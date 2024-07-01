import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min } from "class-validator";

export class CreateBookDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @Min(1)
    pages: number;
}