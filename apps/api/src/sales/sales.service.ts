import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@businessos/database';
import { SaleStatus } from '@prisma/client';
import { CreateSaleDto, UpdateSaleStatusDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const count = await prisma.sale.count({ where: { organizationId } });
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateSaleDto, organizationId: string) {
    // Verify customer exists and belongs to org
    const customer = await prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate totals
    let subtotal = 0;
    const saleItems = [];

    for (const item of dto.items) {
      const inventory = await prisma.inventoryItem.findFirst({
        where: { id: item.inventoryItemId, organizationId },
      });
      if (!inventory) {
        throw new NotFoundException(`Inventory item ${item.inventoryItemId} not found`);
      }
      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${inventory.name}". Available: ${inventory.quantity}, Requested: ${item.quantity}`
        );
      }

      const lineTotal = item.quantity * Number(item.unitPrice);
      subtotal += lineTotal;

      saleItems.push({
        inventoryItemId: item.inventoryItemId,
        productName: inventory.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: lineTotal.toFixed(2),
      });
    }

    const tax = subtotal * 0.05; // 5% tax — adjust as needed
    const total = subtotal + tax;
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    return prisma.sale.create({
      data: {
        invoiceNumber,
        customerId: dto.customerId,
        status: dto.status || SaleStatus.DRAFT,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes: dto.notes,
        organizationId,
        items: {
          create: saleItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async findAll(organizationId: string, filters: { status?: SaleStatus; search?: string } = {}) {
    const where: any = { organizationId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { select: { id: true, productName: true, quantity: true, unitPrice: true, total: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const sale = await prisma.sale.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        items: { include: { inventoryItem: { select: { id: true, sku: true, quantity: true } } } },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async updateStatus(id: string, dto: UpdateSaleStatusDto, organizationId: string) {
    const sale = await this.findOne(id, organizationId);

    // If marking as PAID, deduct inventory
    if (dto.status === SaleStatus.PAID && sale.status !== SaleStatus.PAID) {
      for (const item of sale.items) {
        if (item.inventoryItemId) {
          await prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
    }

    // If reverting from PAID, restore inventory (optional but safe)
    if (sale.status === SaleStatus.PAID && dto.status !== SaleStatus.PAID) {
      for (const item of sale.items) {
        if (item.inventoryItemId) {
          await prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    return prisma.sale.update({
      where: { id },
      data: { status: dto.status },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const sale = await this.findOne(id, organizationId);

    // Restore stock if deleting a paid sale
    if (sale.status === SaleStatus.PAID) {
      for (const item of sale.items) {
        if (item.inventoryItemId) {
          await prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    return prisma.sale.delete({ where: { id } });
  }
}