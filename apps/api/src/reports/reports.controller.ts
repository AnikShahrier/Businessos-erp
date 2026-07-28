import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-overview')
  getSalesOverview(@Req() req: any) {
    return this.reportsService.getSalesOverview(req.user.organizationId);
  }

  @Get('sales-by-period')
  getSalesByPeriod(
    @Req() req: any,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.reportsService.getSalesByPeriod(req.user.organizationId, period);
  }

  @Get('revenue-by-category')
  getRevenueByCategory(@Req() req: any) {
    return this.reportsService.getRevenueByCategory(req.user.organizationId);
  }

  @Get('top-products')
  getTopProducts(@Req() req: any) {
    return this.reportsService.getTopProducts(req.user.organizationId);
  }

  @Get('top-customers')
  getTopCustomers(@Req() req: any) {
    return this.reportsService.getTopCustomers(req.user.organizationId);
  }

  @Get('inventory')
  getInventoryReport(@Req() req: any) {
    return this.reportsService.getInventoryReport(req.user.organizationId);
  }
}