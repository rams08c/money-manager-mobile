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
import { CategoriesService } from './categories.service';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryResponseDto,
    CategoryQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async create(
        @Req() req: any,
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const userId = req.user.sub;
        return this.categoriesService.create(userId, createCategoryDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findAll(
        @Req() req: any,
        @Query() query: CategoryQueryDto,
    ): Promise<CategoryResponseDto[]> {
        const userId = req.user.sub;
        return this.categoriesService.findAll(userId, query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Req() req: any,
        @Param('id') categoryId: string,
    ): Promise<CategoryResponseDto> {
        const userId = req.user.sub;
        return this.categoriesService.findOne(userId, categoryId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async update(
        @Req() req: any,
        @Param('id') categoryId: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const userId = req.user.sub;
        return this.categoriesService.update(userId, categoryId, updateCategoryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(@Req() req: any, @Param('id') categoryId: string): Promise<void> {
        const userId = req.user.sub;
        await this.categoriesService.remove(userId, categoryId);
    }
}
