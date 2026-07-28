import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@businessos/database';
import { CreateInventoryDto } from './dto/create-inventory.dto';
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
    const sku = this.generateSKU(dto.name, dto.category);

    try {
      return await prisma.inventoryItem.create({
        data: {
          name: dto.name,
          description: dto.description,
          category: dto.category,
          location: dto.location,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
          reorderLevel: dto.reorderLevel,  // <-- CHANGED
          sku,
          organizationId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const newSku = this.generateSKU(dto.name, dto.category);
        return prisma.inventoryItem.create({
          data: {
            name: dto.name,
            description: dto.description,
            category: dto.category,
            location: dto.location,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            reorderLevel: dto.reorderLevel,  // <-- CHANGED
            sku: newSku,
            organizationId,
          },
        });
      }
      throw error;
    }
  }

  async findAll(
    organizationId: string,
    filters: {
      search?: string;
      category?: string;
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

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (filters.lowStock) {
      return items.filter(item => item.quantity <= item.reorderLevel);  // <-- CHANGED
    }

    return items;
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
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) data.unitPrice = dto.unitPrice;
    if (dto.reorderLevel !== undefined) data.reorderLevel = dto.reorderLevel;  // <-- CHANGED

    return prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return prisma.inventoryItem.delete({ where: { id } });
  }
}