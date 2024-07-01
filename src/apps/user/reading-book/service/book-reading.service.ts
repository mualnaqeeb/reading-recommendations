import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Book, ReadingInterval } from '@prisma/client';
import { PrismaService } from 'src/util/prisma-service/prisma.service';
import { CreateReadingInterval } from '../types/dto/create-reading-interval.dto';
import { UpdateReadingInterval } from '../types/dto/update-reading-interval';

@Injectable()
export class BookReadingService {
    constructor(private prisma: PrismaService) { }

    private async getBookById(bookId: number): Promise<Book> {
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });
        if (!book) {
            throw new NotAcceptableException('Book not found');
        }
        return book;
    }

    private async validateReadingInterval(userId: number, bookId: number, start: number, end: number, intervalId?: number): Promise<void> {
        const overlappingIntervals = await this.prisma.readingInterval.findMany({
            where: {
                AND: [
                    { bookId },
                    { userId },
                    { startPage: { lte: end } },
                    { endPage: { gte: start } },
                    intervalId ? { id: { not: intervalId } } : {},
                ],
            },
        });
        if (overlappingIntervals.length > 0) {
            throw new NotAcceptableException('Overlapping reading intervals');
        }
    }

    private validatePageNumbers(start: number, end: number, numOfPages: number): void {
        if (start > numOfPages || end > numOfPages) {
            throw new NotAcceptableException('Invalid start or end page');
        }
        if (start > end) {
            throw new NotAcceptableException('Start page cannot be greater than end page');
        }
    }

    async getAll(ps: number, pn: number): Promise<{ books: Book[], currentPage: number, totalCount: number }> {
        const skip = (pn - 1) * ps;
        const take = ps;
        const [books, totalCount] = await Promise.all([
            this.prisma.book.findMany({ skip, take }),
            this.prisma.book.count(),
        ]);
        const currentPage = pn;
        return { books, currentPage, totalCount };
    }

    async createReadingInterval(userId: number, data: CreateReadingInterval): Promise<ReadingInterval> {
        const book = await this.getBookById(data.bookId);
        await this.validateReadingInterval(userId, data.bookId, data.start, data.end);
        this.validatePageNumbers(data.start, data.end, book.num_of_pages);

        return this.prisma.readingInterval.create({
            data: {
                userId,
                bookId: data.bookId,
                startPage: data.start,
                endPage: data.end,
            },
        });
    }

    async updateReadingInterval(userId: number, id: number, data: UpdateReadingInterval): Promise<ReadingInterval> {
        const interval = await this.prisma.readingInterval.findUnique({
            where: { id, userId },
            include: { book: true },
        });
        if (!interval) {
            throw new NotAcceptableException('Reading interval not found');
        }

        await this.validateReadingInterval(userId, interval.bookId, data.start, data.end, id);
        this.validatePageNumbers(data.start, data.end, interval.book.num_of_pages);

        return this.prisma.readingInterval.update({
            where: { id },
            data: {
                startPage: data.start,
                endPage: data.end,
            },
        });
    }
    async getBookReadingIntervals(userId: number, bookId: number): Promise<any> {
        return await this.prisma.readingInterval.findMany({
            where: {
                bookId,
                userId
            },
        })
    }
    async getTopRecommendedBooks(): Promise<any> {
        const intervals = await this.prisma.readingInterval.groupBy({
            by: ['bookId'],
            _sum: { endPage: true, startPage: true },
        });

        const uniquePages = intervals.map(interval => ({
            bookId: interval.bookId,
            numOfReadPages: interval._sum.endPage - interval._sum.startPage,
        }));

        const topBooks = uniquePages.sort((a, b) => b.numOfReadPages - a.numOfReadPages).slice(0, 5);

        const books = await this.prisma.book.findMany({
            where: {
                id: { in: topBooks.map(b => b.bookId) },
            },
        });

        return books.map(book => ({
            id: book.id,
            name: book.name,
            pages: book.num_of_pages,
            readPages: topBooks.find(b => b.bookId === book.id).numOfReadPages,
        }));
    }
}
