import { Injectable } from '@nestjs/common';
import { prisma } from '@businessos/database';

@Injectable()
export class DashboardService {
  async getStats(organizationId: string) {
  const [
    employeeCount,
    productCount,
    allInventoryItems,
    recentEmployees,
    recentProducts,
    totalSales,
    totalRevenue,
    pendingSales,
    recentSales,
  ] = await Promise.all([
    prisma.employee.count({ where: { organizationId } }),
    prisma.inventoryItem.count({ where: { organizationId } }),
    prisma.inventoryItem.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } }),
    prisma.employee.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.inventoryItem.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.sale.count({ where: { organizationId } }),
    prisma.sale.aggregate({
      where: { organizationId, status: 'PAID' },
      _sum: { total: true },
    }),
    prisma.sale.count({ where: { organizationId, status: 'PENDING' } }),
    prisma.sale.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { name: true } },
      },
    }),
  ]);

  const lowStockCount = allInventoryItems.filter(
    (item) => item.quantity <= item.reorderLevel
  ).length;

  const inventoryValue = allInventoryItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitPrice),
    0
  );

  return {
    counts: {
      employees: employeeCount,
      products: productCount,
      lowStock: lowStockCount,
      totalSales,
      pendingSales,
    },
    financials: {
      inventoryValue: Number(inventoryValue.toFixed(2)),
      totalRevenue: Number(totalRevenue._sum.total || 0),
    },
    recent: {
      employees: recentEmployees,
      products: recentProducts,
      sales: recentSales,
    },
    topLowStock: allInventoryItems
      .filter((item) => item.quantity <= item.reorderLevel)
      .slice(0, 5),
  };
}
}