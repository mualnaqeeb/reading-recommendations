import { Test, TestingModule } from '@nestjs/testing';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/util/prisma-service/prisma.service';
import { Book } from '@prisma/client';
import { CreateBookDto, UpdateBookDto } from '../types';
import { BookService } from '../service/book.service';

const mockPrismaService = {
    book: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
    },
    readingInterval: {
        findMany: jest.fn(),
    }
};

describe('BookService', () => {
    let service: BookService;
    let prismaService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<BookService>(BookService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAll', () => {
        it('should return books with pagination', async () => {
            const books: Book[] = [{ id: 1, name: 'Test Book', num_of_pages: 100 }];
            prismaService.book.findMany.mockResolvedValue(books);
            prismaService.book.count.mockResolvedValue(1);

            const result = await service.getAll(10, 1);

            expect(result).toEqual({ books, currentPage: 1, totalCount: 1 });
            expect(prismaService.book.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
            expect(prismaService.book.count).toHaveBeenCalled();
        });
    });

    describe('createBook', () => {
        it('should create a new book', async () => {
            const createBookDto: CreateBookDto = { name: 'New Book', pages: 200 };
            const createdBook: Book = { id: 1, name: 'New Book', num_of_pages: 200 };

            prismaService.book.findUnique.mockResolvedValue(null);
            prismaService.book.create.mockResolvedValue(createdBook);

            const result = await service.createBook(createBookDto);

            expect(result).toEqual(createdBook);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { name: createBookDto.name } });
            expect(prismaService.book.create).toHaveBeenCalledWith({ data: { name: createBookDto.name, num_of_pages: createBookDto.pages } });
        });

        it('should throw an error if book already exists', async () => {
            const createBookDto: CreateBookDto = { name: 'Existing Book', pages: 200 };
            prismaService.book.findUnique.mockResolvedValue({ id: 1, name: 'Existing Book', num_of_pages: 200 });

            await expect(service.createBook(createBookDto)).rejects.toThrow(NotAcceptableException);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { name: createBookDto.name } });
        });
    });

    describe('updateBook', () => {
        it('should update a book', async () => {
            const updateBookDto: UpdateBookDto = { name: 'Updated Book', pages: 150 };
            const existingBook: Book = { id: 1, name: 'Old Book', num_of_pages: 100 };
            const updatedBook: Book = { id: 1, name: 'Updated Book', num_of_pages: 150 };

            prismaService.book.findUnique.mockResolvedValue(existingBook);
            prismaService.book.findFirst.mockResolvedValue(null);
            prismaService.readingInterval.findMany.mockResolvedValue([]);
            prismaService.book.update.mockResolvedValue(updatedBook);

            const result = await service.updateBook(1, updateBookDto);

            expect(result).toEqual(updatedBook);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.book.findFirst).toHaveBeenCalled();
            expect(prismaService.readingInterval.findMany).toHaveBeenCalled();
            expect(prismaService.book.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: updateBookDto.name, num_of_pages: updateBookDto.pages } });
        });

        it('should throw NotFoundException if book not found', async () => {
            prismaService.book.findUnique.mockResolvedValue(null);

            await expect(service.updateBook(1, { name: 'Nonexistent Book', pages: 100 })).rejects.toThrow(NotFoundException);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotAcceptableException if book name already exists', async () => {
            const updateBookDto: UpdateBookDto = { name: 'Existing Book', pages: 100 };
            const existingBook: Book = { id: 1, name: 'Old Book', num_of_pages: 100 };
            const bookWithSameName: Book = { id: 2, name: 'Existing Book', num_of_pages: 200 };

            prismaService.book.findUnique.mockResolvedValue(existingBook);
            prismaService.book.findFirst.mockResolvedValue(bookWithSameName);
            prismaService.readingInterval.findMany.mockResolvedValue([]);

            await expect(service.updateBook(1, updateBookDto)).rejects.toThrow(NotAcceptableException);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.book.findFirst).toHaveBeenCalled();
        });

        it('should throw NotAcceptableException if new page count conflicts with existing reading intervals', async () => {
            const updateBookDto: UpdateBookDto = { name: 'Updated Book', pages: 150 };
            const existingBook: Book = { id: 1, name: 'Old Book', num_of_pages: 100 };

            prismaService.book.findUnique.mockResolvedValue(existingBook);
            prismaService.book.findFirst.mockResolvedValue(null);
            prismaService.readingInterval.findMany.mockResolvedValue([{ id: 1, startPage: 120, endPage: 160, bookId: 1 }]);

            await expect(service.updateBook(1, updateBookDto)).rejects.toThrow(NotAcceptableException);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.book.findFirst).toHaveBeenCalled();
            expect(prismaService.readingInterval.findMany).toHaveBeenCalled();
        });
    });

    describe('deleteBook', () => {
        it('should delete a book', async () => {
            const existingBook: Book = { id: 1, name: 'Old Book', num_of_pages: 100 };

            prismaService.book.findUnique.mockResolvedValue(existingBook);
            prismaService.book.delete.mockResolvedValue(existingBook);

            await service.deleteBook(1);

            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.book.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if book not found', async () => {
            prismaService.book.findUnique.mockResolvedValue(null);

            await expect(service.deleteBook(1)).rejects.toThrow(NotFoundException);
            expect(prismaService.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });
});
