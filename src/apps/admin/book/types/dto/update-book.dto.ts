import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, Min } from "class-validator";

export class UpdateBookDto {
    @ApiProperty()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsOptional()
    @Min(1)
    pages: number;
}