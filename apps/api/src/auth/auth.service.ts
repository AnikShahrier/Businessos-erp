import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@businessos/database';
import * as bcrypt from 'bcryptjs';

export class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

export class LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(dto: any) {
    const existing = await prisma.user.findUnique({ 
      where: { email: dto.email } 
    });
    
    if (existing) {
      throw new ConflictException('This email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: this.generateSlug(dto.organizationName),
        },
      });

      const adminRole = await tx.role.create({
        data: {
          name: 'Admin',
          description: 'Full system access',
          isDefault: true,
          organizationId: org.id,
        },
      });

      const permissionData = [
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' },
        { resource: 'employees', action: 'create' },
        { resource: 'employees', action: 'read' },
        { resource: 'employees', action: 'update' },
        { resource: 'employees', action: 'delete' },
        { resource: 'inventory', action: 'create' },
        { resource: 'inventory', action: 'read' },
        { resource: 'inventory', action: 'update' },
        { resource: 'inventory', action: 'delete' },
        { resource: 'sales', action: 'create' },
        { resource: 'sales', action: 'read' },
        { resource: 'sales', action: 'update' },
        { resource: 'sales', action: 'delete' },
        { resource: 'reports', action: 'read' },
      ];

      await tx.permission.createMany({
        data: permissionData.map(p => ({ 
          ...p, 
          organizationId: org.id 
        })),
      });

      const createdPerms = await tx.permission.findMany({
        where: { organizationId: org.id },
      });

      await tx.rolePermission.createMany({
        data: createdPerms.map(p => ({
          roleId: adminRole.id,
          permissionId: p.id,
        })),
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          organizationId: org.id,
        },
      });

      await tx.userRole.create({
        data: { 
          userId: user.id, 
          roleId: adminRole.id 
        },
      });

      return { user, organization: org };
    });

    const token = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
    });

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
      },
    };
  }

  async login(dto: any) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
        },
      },
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
}