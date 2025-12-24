import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UserResponseDto } from './dto';
import {
    UserNotFoundException,
    CurrencyChangeNotAllowedException,
} from './exceptions';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // Auth-related methods (used by AuthService)

    async create(email: string, hashedPassword: string, name?: string) {
        return this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken },
        });
    }

    // Profile management methods (used by UsersController)

    async getProfile(userId: string): Promise<UserResponseDto> {
        const user = await this.findById(userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        return this.mapToResponseDto(user);
    }

    async updateProfile(
        userId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        const user = await this.findById(userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        // Check if currency is being changed
        if (
            updateUserDto.defaultCurrency &&
            updateUserDto.defaultCurrency !== user.defaultCurrency
        ) {
            // Enforce currency immutability rule
            const hasTransactions = await this.hasTransactions(userId);
            if (hasTransactions) {
                throw new CurrencyChangeNotAllowedException();
            }
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateUserDto,
        });

        return this.mapToResponseDto(updatedUser);
    }

    // Private helper methods

    private async hasTransactions(userId: string): Promise<boolean> {
        // Check if user has any transactions
        // Note: This assumes Transaction model exists with userId field
        const count = await this.prisma.transaction.count({
            where: { userId },
        });

        return count > 0;
    }

    private mapToResponseDto(user: any): UserResponseDto {
        return new UserResponseDto({
            id: user.id,
            name: user.name,
            email: user.email,
            defaultCurrency: user.defaultCurrency,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
}

