import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class UpdateReadingInterval {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    start: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    end: number;
}