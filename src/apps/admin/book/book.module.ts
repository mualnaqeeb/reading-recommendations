import { Module } from '@nestjs/common';
import { BookService } from './service/book.service';
import { BookController } from './controller/book.controller';

@Module({
  controllers: [BookController],
  providers: [BookService]
})
export class BookModule { }
