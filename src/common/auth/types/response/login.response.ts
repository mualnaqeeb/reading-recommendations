import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";

export class LoginResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    token: string;
    constructor(user: User, token: string) {
        this.id = user.id;
        this.username = user.username;
        this.name = user.name;
        this.role = user.role;
        this.token = token;
    }
}