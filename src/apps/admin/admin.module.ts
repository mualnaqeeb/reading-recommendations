import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module';

@Module({
    imports: [BookModule],
    providers: [],
    controllers: [],
})
export class AdminModule { }