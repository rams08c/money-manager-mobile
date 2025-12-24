import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPushDto, SyncResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sync')
export class SyncController {
    constructor(private syncService: SyncService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async sync(
        @Req() req: any,
        @Body() syncPushDto: SyncPushDto,
    ): Promise<SyncResponseDto> {
        const userId = req.user.sub;
        return this.syncService.sync(userId, syncPushDto);
    }

    @Get('time')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getServerTime(): Promise<{ serverTime: Date }> {
        return { serverTime: new Date() };
    }
}
