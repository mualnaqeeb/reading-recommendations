import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from '../types/dto/create-book.dto';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/util/prisma-service/prisma.service';
import { UpdateBookDto } from '../types';

@Injectable()
export class BookService {
    constructor(private prisma: PrismaService) { }
    async createBook(data: CreateBookDto): Promise<Book> {
        const existingBook = await this.prisma.book.findUnique({
            where: { name: data.name },
        });

        if (existingBook)
            throw new NotAcceptableException('Book already exists');


        return this.prisma.book.create({
            data: {
                name: data.name,
                num_of_pages: data.pages,
            },
        });
    }

    async updateBook(id: number, data: UpdateBookDto): Promise<Book> {
        const [existingBook, bookWithSameName] = await Promise.all([
            this.prisma.book.findUnique({
                where: { id },
            }),
            this.prisma.book.findFirst({
                where: {
                    AND: [
                        {
                            name: data.name
                        },
                        {
                            NOT: {
                                id
                            }
                        }
                    ]
                },
            })
        ]);

        const existingBookData = existingBook || { num_of_pages: 0 };

        const conflictingIntervals = await this.prisma.readingInterval.findMany({
            where: {
                bookId: id,
                OR: [
                    {
                        startPage: {
                            lt: data.pages
                        },
                        endPage: {
                            gt: data.pages
                        }
                    },
                    {
                        startPage: {
                            lt: data.pages + existingBookData.num_of_pages
                        },
                        endPage: {
                            gt: data.pages + existingBookData.num_of_pages
                        }
                    },
                    {
                        startPage: {
                            gt: data.pages
                        },
                        endPage: {
                            lt: data.pages + existingBookData.num_of_pages
                        }
                    }
                ]
            }
        });

        if (!existingBook) {
            throw new NotFoundException('Book not found');
        }

        if (bookWithSameName) {
            throw new NotAcceptableException('Book name already exists');
        }

        if (conflictingIntervals.length > 0) {
            throw new NotAcceptableException('New page count conflicts with existing reading intervals');
        }

        return this.prisma.book.update({
            where: { id },
            data: {
                name: data.name,
                num_of_pages: data.pages,
            },
        });
    }

    async deleteBook(id: number): Promise<void> {
        const existingBook = await this.prisma.book.findUnique({
            where: { id },
        });
        if (!existingBook) {
            throw new NotFoundException('Book not found');
        }
        await this.prisma.book.delete({
            where: { id },
        });
    }
}
