import { Type } from 'class-transformer';
import {
    IsString,
    IsDateString,
    IsArray,
    ValidateNested,
    IsOptional,
    IsBoolean,
    IsUUID,
    IsNumber,
} from 'class-validator';

export class SyncRecordDto {
    @IsUUID()
    id: string;

    @IsBoolean()
    isDeleted: boolean;

    @IsDateString()
    updatedAt: string;

    @IsDateString()
    createdAt: string;

    // Entity-specific fields will be in subclasses
    [key: string]: any;
}

export class SyncPushDto {
    @IsUUID()
    deviceId: string;

    @IsOptional()
    @IsDateString()
    lastSyncAt?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRecordDto)
    accounts?: SyncRecordDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRecordDto)
    transactions?: SyncRecordDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRecordDto)
    budgets?: SyncRecordDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRecordDto)
    categories?: SyncRecordDto[];
}
