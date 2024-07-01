import { NotAcceptableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/util/prisma-service/prisma.service';
import { BookReadingService } from '../service/book-reading.service';
import { CreateReadingInterval } from '../types/dto/create-reading-interval.dto';
import { UpdateReadingInterval } from '../types/dto/update-reading-interval';

const mockPrismaService = {
    book: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
    readingInterval: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        groupBy: jest.fn(),
    },
};

describe('BookReadingService', () => {
    let service: BookReadingService;
    let prismaService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookReadingService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<BookReadingService>(BookReadingService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getBookById', () => {
        it('should return a book if found', async () => {
            const book = { id: 1, name: 'Test Book', num_of_pages: 100 };
            prismaService.book.findUnique.mockResolvedValue(book);

            const result = await (service as any).getBookById(1);

            expect(result).toEqual(book);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotAcceptableException if book not found', async () => {
            prismaService.book.findUnique.mockResolvedValue(null);

            await expect((service as any).getBookById(1)).rejects.toThrow(NotAcceptableException);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe('validateReadingInterval', () => {
        it('should throw NotAcceptableException if overlapping intervals are found', async () => {
            const overlappingIntervals = [{ id: 1, bookId: 1, startPage: 1, endPage: 10 }];
            prismaService.readingInterval.findMany.mockResolvedValue(overlappingIntervals);

            await expect((service as any).validateReadingInterval(1, 1, 1, 10)).rejects.toThrow(NotAcceptableException);
            expect(prismaService.readingInterval.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [
                        { bookId: 1 },
                        { userId: 1 },
                        { startPage: { lte: 10 } },
                        { endPage: { gte: 1 } },
                    ],
                },
            });
        });

        it('should pass if no overlapping intervals are found', async () => {
            prismaService.readingInterval.findMany.mockResolvedValue([]);

            await expect((service as any).validateReadingInterval(1, 1, 1, 10)).resolves.toBeUndefined();
        });
    });

    describe('validatePageNumbers', () => {
        it('should throw NotAcceptableException if start or end page is invalid', () => {
            expect(() => (service as any).validatePageNumbers(101, 102, 100)).toThrow(NotAcceptableException);
        });

        it('should throw NotAcceptableException if start page is greater than end page', () => {
            expect(() => (service as any).validatePageNumbers(10, 5, 100)).toThrow(NotAcceptableException);
        });

        it('should pass if page numbers are valid', () => {
            expect(() => (service as any).validatePageNumbers(5, 10, 100)).not.toThrow();
        });
    });

    describe('getAll', () => {
        it('should return books with pagination', async () => {
            const books = [{ id: 1, name: 'Test Book', num_of_pages: 100 }];
            prismaService.book.findMany.mockResolvedValue(books);
            prismaService.book.count.mockResolvedValue(1);

            const result = await service.getAll(10, 1);

            expect(result).toEqual({ books, currentPage: 1, totalCount: 1 });
            expect(prismaService.book.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
            expect(prismaService.book.count).toHaveBeenCalled();
        });
    });

    describe('createReadingInterval', () => {
        it('should create a reading interval', async () => {
            const createReadingIntervalDto: CreateReadingInterval = { bookId: 1, start: 1, end: 10 };
            const book = { id: 1, name: 'Test Book', num_of_pages: 100 };
            const readingInterval = { id: 1, bookId: 1, startPage: 1, endPage: 10 };

            prismaService.book.findUnique.mockResolvedValue(book);
            prismaService.readingInterval.findMany.mockResolvedValue([]);
            prismaService.readingInterval.create.mockResolvedValue(readingInterval);

            const result = await service.createReadingInterval(1, createReadingIntervalDto);

            expect(result).toEqual(readingInterval);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: createReadingIntervalDto.bookId } });
            expect(prismaService.readingInterval.findMany).toHaveBeenCalled();
            expect(prismaService.readingInterval.create).toHaveBeenCalledWith({
                data: { userId: 1, bookId: createReadingIntervalDto.bookId, startPage: createReadingIntervalDto.start, endPage: createReadingIntervalDto.end },
            });
        });
    });

    describe('updateReadingInterval', () => {
        it('should update a reading interval', async () => {
            const updateReadingIntervalDto: UpdateReadingInterval = { start: 5, end: 15 };
            const interval = { id: 1, bookId: 1, startPage: 1, endPage: 10, userId: 1, book: { id: 1, num_of_pages: 100 } };
            const updatedInterval = { ...interval, ...updateReadingIntervalDto };

            prismaService.readingInterval.findUnique.mockResolvedValue(interval);
            prismaService.readingInterval.findMany.mockResolvedValue([]);
            prismaService.readingInterval.update.mockResolvedValue(updatedInterval);

            const result = await service.updateReadingInterval(1, 1, updateReadingIntervalDto);

            expect(result).toEqual(updatedInterval);
            expect(prismaService.readingInterval.findUnique).toHaveBeenCalledWith({ where: { id: 1, userId: 1 }, include: { book: true } });
            expect(prismaService.readingInterval.findMany).toHaveBeenCalled();
            expect(prismaService.readingInterval.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { startPage: updateReadingIntervalDto.start, endPage: updateReadingIntervalDto.end },
            });
        });

        it('should throw NotAcceptableException if interval not found', async () => {
            prismaService.readingInterval.findUnique.mockResolvedValue(null);

            await expect(service.updateReadingInterval(1, 1, { start: 5, end: 15 })).rejects.toThrow(NotAcceptableException);
            expect(prismaService.readingInterval.findUnique).toHaveBeenCalledWith({ where: { id: 1, userId: 1 }, include: { book: true } });
        });
    });

    describe('getBookReadingIntervals', () => {
        it('should return reading intervals for a book and user', async () => {
            const intervals = [{ id: 1, bookId: 1, userId: 1, startPage: 1, endPage: 10 }];
            prismaService.readingInterval.findMany.mockResolvedValue(intervals);

            const result = await service.getBookReadingIntervals(1, 1);

            expect(result).toEqual(intervals);
            expect(prismaService.readingInterval.findMany).toHaveBeenCalledWith({ where: { bookId: 1, userId: 1 } });
        });
    });

    describe('getTopRecommendedBooks', () => {
        it('should return top recommended books based on reading intervals', async () => {
            const intervals = [{ bookId: 1, _sum: { endPage: 20, startPage: 0 } }];
            const books = [{ id: 1, name: 'Test Book', num_of_pages: 100 }];
            const topBooks = [{ bookId: 1, numOfReadPages: 20 }];

            prismaService.readingInterval.groupBy.mockResolvedValue(intervals);
            prismaService.book.findMany.mockResolvedValue(books);

            const result = await service.getTopRecommendedBooks();

            expect(result).toEqual([{ id: 1, name: 'Test Book', pages: 100, readPages: 20 }]);
            expect(prismaService.readingInterval.groupBy).toHaveBeenCalledWith({ by: ['bookId'], _sum: { endPage: true, startPage: true } });
            expect(prismaService.book.findMany).toHaveBeenCalledWith({ where: { id: { in: [1] } } });
        });
    });
});
