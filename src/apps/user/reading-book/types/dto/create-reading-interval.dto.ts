import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateReadingInterval {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    bookId: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    start: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    end: number;
}