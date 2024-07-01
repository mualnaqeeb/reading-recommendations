import { Module } from '@nestjs/common';
import { BookController as BookReadingController } from './controller/book-reading.controller';
import { BookReadingService } from './service/book-reading.service';

@Module({
  controllers: [BookReadingController],
  providers: [BookReadingService]
})
export class BookReadingModule { }
