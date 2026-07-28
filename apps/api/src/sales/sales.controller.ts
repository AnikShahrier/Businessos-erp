import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleStatusDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaleStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto, @Req() req: any) {
    return this.salesService.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: SaleStatus,
    @Query('search') search?: string,
  ) {
    return this.salesService.findAll(req.user.organizationId, { status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.salesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSaleStatusDto,
    @Req() req: any,
  ) {
    return this.salesService.updateStatus(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.salesService.remove(id, req.user.organizationId);
  }
}