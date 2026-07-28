import { IsString, IsOptional, IsInt, IsDecimal, Min, IsEnum } from 'class-validator';
export enum InventoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export class CreateInventoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsInt()
  @Min(0)
  quantity: number = 0;

  @IsDecimal({ decimal_digits: '2' })
  unitPrice: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  costPrice?: string;

  @IsInt()
  @Min(0)
  reorderLevel: number = 10;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus = InventoryStatus.ACTIVE;
}