import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { prisma } from '@businessos/database';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  @Get()
  findAll(@Req() req: any) {
    return prisma.customer.findMany({
      where: { organizationId: req.user.organizationId },
      orderBy: { name: 'asc' },
    });
  }

  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        organizationId: req.user.organizationId,
      },
    });
  }
}