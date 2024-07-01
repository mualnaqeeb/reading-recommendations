import { Module } from '@nestjs/common';
import { BookReadingModule } from './reading-book/book-reading.module';

@Module({
    imports: [BookReadingModule],
    providers: [],
    controllers: [],
})
export class UserModule { }