import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/util/prisma-service/prisma.service';
import { NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../types/dto/login.dto';
import { LoginResponse } from '../types/response';
import { AuthService } from '../service/auth.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return LoginResponse if credentials are valid', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'password123' };
      const user = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'USER' };

      prismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(loginDto);

      expect(result).toBeInstanceOf(LoginResponse);
      expect(result.token).toBe('token');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username: loginDto.username } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: user.id, role: user.role });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'password123' };

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username: loginDto.username } });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'password123' };
      const user = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'USER' };

      prismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username: loginDto.username } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });
  });

  describe('register', () => {
    it('should return LoginResponse if registration is successful', async () => {
      const registerDto: any = { username: 'newuser', password: 'password123' };
      const user = { id: 1, username: 'newuser', password: 'hashedpassword', role: 'USER' };

      prismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      prismaService.user.create.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.register(registerDto);

      expect(result).toBeInstanceOf(LoginResponse);
      expect(result.token).toBe('token');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username: registerDto.username } });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...registerDto, password: 'hashedpassword', role: 'USER' },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: user.id, role: user.role });
    });

    it('should throw NotAcceptableException if user already exists', async () => {
      const registerDto: any = { username: 'existinguser', password: 'password123' };
      const user = { id: 1, username: 'existinguser', password: 'hashedpassword', role: 'USER' };

      prismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.register(registerDto)).rejects.toThrow(NotAcceptableException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username: registerDto.username } });
    });
  });

  describe('verifyHash', () => {
    it('should return true if hash matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await (service as any).verifyHash('password', 'hashedpassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
    });

    it('should return false if hash does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await (service as any).verifyHash('password', 'hashedpassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
    });
  });

  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await (service as any).hashPassword('password');

      expect(result).toBe('hashedpassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
  });

  describe('generateToken', () => {
    it('should return a token', async () => {
      jwtService.signAsync.mockResolvedValue('token');

      const result = await (service as any).generateToken({ id: 1, role: 'USER' });

      expect(result).toBe('token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: 1, role: 'USER' });
    });
  });
});
