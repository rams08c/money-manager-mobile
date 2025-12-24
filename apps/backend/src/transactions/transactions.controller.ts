import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
    CreateTransactionDto,
    CreateTransferDto,
    UpdateTransactionDto,
    TransactionResponseDto,
    TransferResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async create(
        @Req() req: any,
        @Body() createTransactionDto: CreateTransactionDto,
    ): Promise<TransactionResponseDto> {
        const userId = req.user.sub;
        return this.transactionsService.create(userId, createTransactionDto);
    }

    @Post('transfer')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async createTransfer(
        @Req() req: any,
        @Body() createTransferDto: CreateTransferDto,
    ): Promise<TransferResponseDto> {
        const userId = req.user.sub;
        return this.transactionsService.createTransfer(userId, createTransferDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findAll(
        @Req() req: any,
        @Query('accountId') accountId?: string,
        @Query('type') type?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<TransactionResponseDto[]> {
        const userId = req.user.sub;
        return this.transactionsService.findAll(userId, {
            accountId,
            type,
            startDate,
            endDate,
        });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Req() req: any,
        @Param('id') transactionId: string,
    ): Promise<TransactionResponseDto> {
        const userId = req.user.sub;
        return this.transactionsService.findOne(userId, transactionId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async update(
        @Req() req: any,
        @Param('id') transactionId: string,
        @Body() updateTransactionDto: UpdateTransactionDto,
    ): Promise<TransactionResponseDto> {
        const userId = req.user.sub;
        return this.transactionsService.update(
            userId,
            transactionId,
            updateTransactionDto,
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(
        @Req() req: any,
        @Param('id') transactionId: string,
    ): Promise<void> {
        const userId = req.user.sub;
        await this.transactionsService.remove(userId, transactionId);
    }
}
