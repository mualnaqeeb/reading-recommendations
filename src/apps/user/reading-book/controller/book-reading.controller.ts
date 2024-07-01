import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId, Roles } from 'src/common/auth/decorator';
import { Role } from 'src/common/auth/types';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from 'src/common/constants';
import { BookReadingService } from '../service/book-reading.service';
import { CreateReadingInterval } from '../types/dto/create-reading-interval.dto';
import { Book, ReadingInterval } from '@prisma/client';
import { UpdateReadingInterval } from '../types/dto/update-reading-interval';

@Controller()
@ApiTags('User Book Reading API')
@Roles(Role.User)
export class BookController {
    constructor(private readonly bookReadingService: BookReadingService) { }

    @Get()
    async getBooks(@Query('ps') pageSize?: number, @Query('pn') pageNumber?: number): Promise<{ books: Book[], currentPage: number, totalCount: number }> {
        return this.bookReadingService.getAll(+pageSize || DEFAULT_PAGE_SIZE, +pageNumber || DEFAULT_PAGE_NUMBER);
    }
    @Get('intervals/:id')
    async getBookReadingIntervals(@GetCurrentUserId() userId: number, @Param('id') id: number): Promise<ReadingInterval[]> {
        return this.bookReadingService.getBookReadingIntervals(userId, id);
    }
    @Post('interval')
    async createReadingInterval(@GetCurrentUserId() userId: number, @Body() readingIntervalDto: CreateReadingInterval) {
        return this.bookReadingService.createReadingInterval(userId, readingIntervalDto);
    }

    @Put('interval/:id')
    async updateReadingInterval(@GetCurrentUserId() userId: number, @Param('id') id: number, @Body() readingIntervalDto: UpdateReadingInterval) {
        return this.bookReadingService.updateReadingInterval(userId, +id, readingIntervalDto);
    }

    @Get('top')
    async getTopRecommendedBooks() {
        return this.bookReadingService.getTopRecommendedBooks();
    }
}
