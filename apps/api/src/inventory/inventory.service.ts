import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@businessos/database';
import { CreateInventoryDto, InventoryStatus } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  private generateSKU(name: string, category?: string): string {
    const prefix = category
      ? category.slice(0, 3).toUpperCase()
      : 'PRD';
    const namePart = name.slice(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    return `${prefix}-${namePart}-${random}-${timestamp}`;
  }

  async create(dto: CreateInventoryDto, organizationId: string) {
    let sku: string;
    let attempts = 0;
    do {
      sku = this.generateSKU(dto.name, dto.category);
      attempts++;
      // FIX #1: Use findFirst instead of findUnique for SKU check
      const existing = await prisma.inventoryItem.findFirst({
        where: { sku, organizationId },
      });
      if (!existing) break;
    } while (attempts < 5);

    if (attempts >= 5) {
      throw new ConflictException('Failed to generate unique SKU. Please try again.');
    }

    return prisma.inventoryItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        costPrice: dto.costPrice ?? null,
       reorderLevel: dto.reorderLevel,
        status: dto.status,
        sku,
        organizationId,
      },
    });
  }

  async findAll(
    organizationId: string,
    filters: {
      search?: string;
      category?: string;
      status?: string;
      lowStock?: boolean;
    } = {},
  ) {
    const where: any = { organizationId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status as InventoryStatus;
    }

    // FIX #2: Use raw query or filter in JS for lowStock
   if (filters.lowStock) {
  const items = await prisma.$queryRaw`
    SELECT * FROM inventory_items 
    WHERE "organization_id" = ${organizationId}
    AND quantity <= "reorder_level"
  `;
  return items;
}

    return prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, organizationId },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID "${id}" not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateInventoryDto, organizationId: string) {
    await this.findOne(id, organizationId);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) data.unitPrice = dto.unitPrice;
    if (dto.costPrice !== undefined) data.costPrice = dto.costPrice ?? null;
    if (dto.reorderLevel !== undefined) data.reorderLevel = dto.reorderLevel;
    if (dto.status !== undefined) data.status = dto.status;

    return prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return prisma.inventoryItem.delete({
      where: { id },
    });
  }
}