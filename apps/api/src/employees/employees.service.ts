import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@businessos/database';

@Injectable()
export class EmployeesService {
  async findAll(organizationId: string) {
    return prisma.employee.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, organizationId },
    });
    
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    
    return employee;
  }

  async create(dto: any, organizationId: string) {
    // Auto-generate employee ID if not provided
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const count = await prisma.employee.count({
        where: { organizationId },
      });
      employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    // Check if employeeId already exists
    const existing = await prisma.employee.findUnique({
      where: { employeeId },
    });
    
    if (existing) {
      // If exists, append timestamp
      employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
    }

    return prisma.employee.create({
      data: {
        employeeId,
        firstName: dto.firstName,      // <-- ADD
        lastName: dto.lastName,         // <-- ADD
        department: dto.department || null,
        position: dto.position || null,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : new Date(),
        salary: dto.salary ? parseFloat(dto.salary) : null,
        status: dto.status || 'ACTIVE',
        organizationId,
      } as any,
    });
  }

  async update(id: string, dto: any, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, organizationId },
    });
    
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return prisma.employee.update({
      where: { id },
      data: {

        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.salary !== undefined && { salary: dto.salary ? parseFloat(dto.salary) : null }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, organizationId },
    });
    
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return prisma.employee.delete({
      where: { id },
    });
  }
}