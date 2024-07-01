import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Role } from 'src/common/auth/types';
import { CreateBookDto, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, UpdateBookDto } from '../types';
import { BookService } from '../service/book.service';
import { Roles } from 'src/common/auth/decorator';
import { Book } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller()
@Roles(Role.Admin)
@ApiTags('Admin manage books API')
@ApiBearerAuth()
export class BookController {
    constructor(private readonly bookService: BookService) { }

    @Get()
    async getBooks(@Query('ps') pageSize?: number, @Query('pn') pageNumber?: number): Promise<{ books: Book[], currentPage: number, totalCount: number }> {
        return this.bookService.getAll(+pageSize || DEFAULT_PAGE_SIZE, +pageNumber || DEFAULT_PAGE_NUMBER);
    }

    @Post()
    async createBook(@Body() bookDto: CreateBookDto): Promise<Book> {
        return this.bookService.createBook(bookDto);
    }

    @Put(':id')
    async updateBook(@Param('id') id: number, @Body() bookDto: UpdateBookDto): Promise<Book> {
        return this.bookService.updateBook(id, bookDto);
    }

    @Delete(':id')
    async deleteBook(@Param('id') id: number): Promise<void> {
        return this.bookService.deleteBook(id);
    }
}
