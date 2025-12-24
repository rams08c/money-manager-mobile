import {
    Controller,
    Get,
    Put,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any): Promise<UserResponseDto> {
        // Extract userId from JWT (set by JwtAuthGuard)
        const userId = req.user.sub;
        return this.usersService.getProfile(userId);
    }

    @Put('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Req() req: any,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        // Extract userId from JWT (set by JwtAuthGuard)
        const userId = req.user.sub;
        return this.usersService.updateProfile(userId, updateUserDto);
    }
}
