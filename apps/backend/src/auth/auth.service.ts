import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import {
    InvalidCredentialsException,
    UserAlreadyExistsException,
    TokenExpiredException,
} from './exceptions';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new UserAlreadyExistsException();
        }

        // Hash password
        const hashedPassword = await this.hashData(registerDto.password);

        // Create user
        const user = await this.usersService.create(
            registerDto.email,
            hashedPassword,
            registerDto.name,
        );

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Hash and store refresh token
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        return new AuthResponseDto(tokens.accessToken, tokens.refreshToken);
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        // Find user by email
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new InvalidCredentialsException();
        }

        // Verify password
        const isPasswordValid = await this.verifyPassword(
            loginDto.password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new InvalidCredentialsException();
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Hash and store refresh token
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        return new AuthResponseDto(tokens.accessToken, tokens.refreshToken);
    }

    async refreshTokens(
        userId: string,
        refreshToken: string,
    ): Promise<AuthResponseDto> {
        // Find user
        const user = await this.usersService.findById(userId);
        if (!user || !user.hashedRefreshToken) {
            throw new TokenExpiredException();
        }

        // Verify refresh token
        const isRefreshTokenValid = await this.verifyPassword(
            refreshToken,
            user.hashedRefreshToken,
        );
        if (!isRefreshTokenValid) {
            throw new TokenExpiredException();
        }

        // Generate new tokens (token rotation)
        const tokens = await this.generateTokens(user.id, user.email);

        // Hash and store new refresh token
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        return new AuthResponseDto(tokens.accessToken, tokens.refreshToken);
    }

    async logout(userId: string): Promise<void> {
        // Clear refresh token
        await this.usersService.updateRefreshToken(userId, null);
    }

    /**
     * Extract userId from refresh token JWT
     * Validates token and returns userId (sub claim)
     */
    async extractUserIdFromRefreshToken(refreshToken: string): Promise<string> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
            return payload.sub;
        } catch (error) {
            // Token is invalid or expired
            throw new TokenExpiredException();
        }
    }

    // Private helper methods

    private async hashData(data: string): Promise<string> {
        const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10', 10);
        return bcrypt.hash(data, saltRounds);
    }

    private async verifyPassword(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    private async generateTokens(
        userId: string,
        email: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
            } as any),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d',
            } as any),
        ]);

        return { accessToken, refreshToken };
    }
}
