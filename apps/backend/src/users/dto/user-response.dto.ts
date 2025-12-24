import { Exclude } from 'class-transformer';

export class UserResponseDto {
    id: string;
    name: string;
    email: string;
    defaultCurrency: string;
    createdAt: Date;
    updatedAt: Date;

    @Exclude()
    password: string;

    @Exclude()
    hashedRefreshToken: string;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
