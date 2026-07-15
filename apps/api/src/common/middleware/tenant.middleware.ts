import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { withTenant } from '@businessos/database';
import { JwtService } from '@nestjs/jwt';

declare module 'express' {
  interface Request {
    organizationId?: string;
    tenantPrisma?: ReturnType<typeof withTenant>;
  }
}

interface JwtUser {
  id: string;
  email: string;
  organizationId: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  // FIXED: Create JwtService manually instead of DI
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = this.jwtService.verify(token);

      const user: JwtUser = {
        id: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
      };

      (req as any).user = user;
      req.organizationId = payload.organizationId;
      req.tenantPrisma = withTenant(payload.organizationId);

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}