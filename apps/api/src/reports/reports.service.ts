import { Injectable } from '@nestjs/common';
import { prisma } from '@businessos/database';

@Injectable()
export class ReportsService {
  async getSalesOverview(organizationId: string) {
    const [totalSales, totalRevenue, pendingSales, paidSales, cancelledSales] = await Promise.all([
      prisma.sale.count({ where: { organizationId } }),
      prisma.sale.aggregate({ where: { organizationId, status: 'PAID' }, _sum: { total: true } }),
      prisma.sale.count({ where: { organizationId, status: 'PENDING' } }),
      prisma.sale.count({ where: { organizationId, status: 'PAID' } }),
      prisma.sale.count({ where: { organizationId, status: 'CANCELLED' } }),
    ]);

    const revenue = Number(totalRevenue._sum.total || 0);

    return {
      totalSales,
      totalRevenue: revenue,
      pendingSales,
      paidSales,
      cancelledSales,
      avgOrderValue: totalSales > 0 ? Number((revenue / totalSales).toFixed(2)) : 0,
    };
  }

  async getSalesByPeriod(organizationId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const results: any[] = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${period}, s.created_at) as period,
        COUNT(*)::int as sales_count,
        COALESCE(SUM(s.total), 0)::float as revenue
      FROM sales s
      WHERE s.organization_id = ${organizationId}
        AND s.status = 'PAID'
      GROUP BY DATE_TRUNC(${period}, s.created_at)
      ORDER BY period ASC
      LIMIT 12
    `;

    return results.map((r) => ({
      period: new Date(r.period).toLocaleDateString('en-US', {
        month: 'short',
        year: period === 'monthly' ? 'numeric' : undefined,
        day: period === 'daily' ? 'numeric' : undefined,
      }),
      sales: r.sales_count,
      revenue: Number(r.revenue),
    }));
  }

  async getRevenueByCategory(organizationId: string) {
    const results: any[] = await prisma.$queryRaw`
      SELECT 
        COALESCE(ii.category, 'Uncategorized') as category,
        COUNT(*)::int as sales_count,
        COALESCE(SUM(si.total), 0)::float as revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      LEFT JOIN inventory_items ii ON si.inventory_item_id = ii.id
      WHERE s.organization_id = ${organizationId}
        AND s.status = 'PAID'
      GROUP BY COALESCE(ii.category, 'Uncategorized')
      ORDER BY revenue DESC
    `;

    return results.map((r) => ({
      category: r.category,
      sales: r.sales_count,
      revenue: Number(r.revenue),
    }));
  }

  async getTopProducts(organizationId: string, limit: number = 5) {
    const results: any[] = await prisma.$queryRaw`
      SELECT 
        si.product_name as name,
        SUM(si.quantity)::int as total_qty,
        COALESCE(SUM(si.total), 0)::float as revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.organization_id = ${organizationId}
        AND s.status = 'PAID'
      GROUP BY si.product_name
      ORDER BY total_qty DESC
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      name: r.name,
      quantity: r.total_qty,
      revenue: Number(r.revenue),
    }));
  }

  async getTopCustomers(organizationId: string, limit: number = 5) {
    const results: any[] = await prisma.$queryRaw`
      SELECT 
        c.name,
        COUNT(s.id)::int as order_count,
        COALESCE(SUM(s.total), 0)::float as total_spent
      FROM customers c
      JOIN sales s ON s.customer_id = c.id
      WHERE s.organization_id = ${organizationId}
        AND s.status = 'PAID'
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      name: r.name,
      orders: r.order_count,
      spent: Number(r.total_spent),
    }));
  }

  async getInventoryReport(organizationId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: { organizationId },
      orderBy: { quantity: 'asc' },
    });

    const totalValue = items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);
    const lowStock = items.filter((i) => i.quantity <= i.reorderLevel);
    const outOfStock = items.filter((i) => i.quantity === 0);

    const categoryResults: any[] = await prisma.$queryRaw`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*)::int as count,
        COALESCE(SUM(quantity * unit_price), 0)::float as value
      FROM inventory_items
      WHERE organization_id = ${organizationId}
      GROUP BY COALESCE(category, 'Uncategorized')
      ORDER BY value DESC
    `;

    return {
      totalItems: items.length,
      totalValue: Number(totalValue.toFixed(2)),
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStockItems: lowStock.slice(0, 5).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        reorderLevel: i.reorderLevel,
      })),
      categoryBreakdown: categoryResults.map((r) => ({
        category: r.category,
        count: r.count,
        value: Number(r.value),
      })),
    };
  }
}