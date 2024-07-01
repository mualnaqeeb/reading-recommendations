import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { Role } from 'src/common/auth/types';
import { CreateBookDto, UpdateBookDto } from '../types';
import { BookService } from '../service/book.service';
import { Roles } from 'src/common/auth/decorator';
import { Book } from '@prisma/client';

@Controller()
@Roles(Role.Admin)
export class BookController {
    constructor(private readonly bookService: BookService) { }

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
