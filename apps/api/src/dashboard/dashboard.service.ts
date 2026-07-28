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
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId } }),
      prisma.inventoryItem.count({ where: { organizationId } }),

      prisma.inventoryItem.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),

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
    ]);

    // ✅ FIX: Use reorderLevel (not reorderPoint) to match your schema
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
      },
      financials: {
        inventoryValue: Number(inventoryValue.toFixed(2)),
      },
      recent: {
        employees: recentEmployees,
        products: recentProducts,
      },
      // ✅ FIX: Use reorderPoint here too
      topLowStock: allInventoryItems
        .filter((item) => item.quantity <= item.reorderLevel)
        .slice(0, 5),
    };
  }
}