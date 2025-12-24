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
import { BudgetsService } from './budgets.service';
import {
    CreateBudgetDto,
    UpdateBudgetDto,
    BudgetResponseDto,
    BudgetWithSpendingDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budgets')
export class BudgetsController {
    constructor(private budgetsService: BudgetsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async create(
        @Req() req: any,
        @Body() createBudgetDto: CreateBudgetDto,
    ): Promise<BudgetResponseDto> {
        const userId = req.user.sub;
        return this.budgetsService.create(userId, createBudgetDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findAll(
        @Req() req: any,
        @Query('month') month?: string,
    ): Promise<BudgetWithSpendingDto[]> {
        const userId = req.user.sub;
        return this.budgetsService.findAll(userId, month);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Req() req: any,
        @Param('id') budgetId: string,
    ): Promise<BudgetWithSpendingDto> {
        const userId = req.user.sub;
        return this.budgetsService.findOne(userId, budgetId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async update(
        @Req() req: any,
        @Param('id') budgetId: string,
        @Body() updateBudgetDto: UpdateBudgetDto,
    ): Promise<BudgetResponseDto> {
        const userId = req.user.sub;
        return this.budgetsService.update(userId, budgetId, updateBudgetDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(@Req() req: any, @Param('id') budgetId: string): Promise<void> {
        const userId = req.user.sub;
        await this.budgetsService.remove(userId, budgetId);
    }
}
