import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../types/dto/login.dto';
import { LoginResponse } from '../types/response';
import { Public } from '../decorator/ispub.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../types';

@Controller('auth')
@Public()
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    //.....................................................................................................................................
    @Post('login')
    public async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }
    //.....................................................................................................................................
    @Post('register')
    public async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
        return this.authService.register(registerDto);
    }
}
