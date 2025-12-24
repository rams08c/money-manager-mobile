import {
    Controller,
    Get,
    Query,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
    MonthlyReportQueryDto,
    DateRangeReportQueryDto,
    MonthlySummaryDto,
    CategoryBreakdownDto,
    BudgetVsActualDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('monthly')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getMonthlySummary(
        @Req() req: any,
        @Query() query: MonthlyReportQueryDto,
    ): Promise<MonthlySummaryDto> {
        const userId = req.user.sub;
        return this.reportsService.getMonthlySummary(
            userId,
            query.month,
            query.accountId,
        );
    }

    @Get('categories')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getCategoryBreakdown(
        @Req() req: any,
        @Query() query: DateRangeReportQueryDto,
    ): Promise<CategoryBreakdownDto[]> {
        const userId = req.user.sub;
        return this.reportsService.getCategoryBreakdown(
            userId,
            query.startDate,
            query.endDate,
            query.type,
            query.categoryId,
        );
    }

    @Get('budget-vs-actual')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getBudgetVsActual(
        @Req() req: any,
        @Query('month') month: string,
    ): Promise<BudgetVsActualDto[]> {
        const userId = req.user.sub;
        return this.reportsService.getBudgetVsActual(userId, month);
    }
}
