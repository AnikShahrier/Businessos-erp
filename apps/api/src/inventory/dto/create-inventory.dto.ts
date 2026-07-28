import { IsString, IsOptional, IsInt, IsDecimal, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsInt()
  @Min(0)
  quantity: number = 0;

  @IsDecimal({ decimal_digits: '2' })
  unitPrice: string;

  @IsInt()
  @Min(0)
  reorderLevel: number = 10;  // <-- CHANGED
}