import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SaleStatus } from '@prisma/client';

class SaleItemDto {
  @IsString()
  inventoryItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  unitPrice: string;
}

export class CreateSaleDto {
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus = SaleStatus.PENDING;
}

export class UpdateSaleStatusDto {
  @IsEnum(SaleStatus)
  status: SaleStatus;
}