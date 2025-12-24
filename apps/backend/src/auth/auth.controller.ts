import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() refreshTokenDto: RefreshTokenDto,
    ): Promise<AuthResponseDto> {
        // Extract userId from refresh token JWT
        const userId = await this.authService.extractUserIdFromRefreshToken(
            refreshTokenDto.refreshToken,
        );
        return this.authService.refreshTokens(userId, refreshTokenDto.refreshToken);
    }


    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(): Promise<{ message: string }> {
        // Logout is client-side only (clearing tokens from SecureStore)
        // No server-side action needed unless we implement refresh token blacklist
        return { message: 'Logged out successfully' };
    }
}
