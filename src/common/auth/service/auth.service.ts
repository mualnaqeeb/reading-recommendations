import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/util/prisma-service/prisma.service';
import { LoginDto } from '../types/dto/login.dto';
import { IJwtPayload } from '../types/interface';
import { LoginResponse } from '../types/response';
import { RegisterDto } from '../types';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService,
    ) { }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { username: loginDto.username },
        });

        if (!user) throw new NotFoundException('User not found');

        const isMatch = await this.verifyHash(loginDto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const token = await this.generateToken({ id: user.id, role: user.role });

        return new LoginResponse(user, token);
    }

    async register(registerDto: RegisterDto): Promise<LoginResponse> {
        const existingUser = await this.prismaService.user.findUnique({
            where: { username: registerDto.username },
        });

        if (existingUser) throw new NotAcceptableException('User already exists');

        const hashedPassword = await this.hashPassword(registerDto.password);

        const newUser = await this.prismaService.user.create({
            data: {
                ...registerDto,
                password: hashedPassword,
                role: 'USER',
            },
        });

        const token = await this.generateToken({ id: newUser.id, role: newUser.role });

        return new LoginResponse(newUser, token);
    }

    private async verifyHash(str: string, hash: string): Promise<boolean> {
        return bcrypt.compare(str, hash);
    }

    private async hashPassword(str: string): Promise<string> {
        return bcrypt.hash(str, 10);
    }

    private async generateToken(payload: IJwtPayload): Promise<string> {
        return this.jwtService.signAsync(payload);
    }
}
