import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import {
    CreateAccountDto,
    UpdateAccountDto,
    AccountResponseDto,
    AccountWithBalanceDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
export class AccountsController {
    constructor(private accountsService: AccountsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async create(
        @Req() req: any,
        @Body() createAccountDto: CreateAccountDto,
    ): Promise<AccountResponseDto> {
        const userId = req.user.sub;
        return this.accountsService.create(userId, createAccountDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findAll(@Req() req: any): Promise<AccountWithBalanceDto[]> {
        const userId = req.user.sub;
        return this.accountsService.findAll(userId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Req() req: any,
        @Param('id') accountId: string,
    ): Promise<AccountWithBalanceDto> {
        const userId = req.user.sub;
        return this.accountsService.findOne(userId, accountId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async update(
        @Req() req: any,
        @Param('id') accountId: string,
        @Body() updateAccountDto: UpdateAccountDto,
    ): Promise<AccountResponseDto> {
        const userId = req.user.sub;
        return this.accountsService.update(userId, accountId, updateAccountDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(@Req() req: any, @Param('id') accountId: string): Promise<void> {
        const userId = req.user.sub;
        await this.accountsService.remove(userId, accountId);
    }
}
