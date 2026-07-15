import { PrismaClient, Prisma } from '@prisma/client';

// ==========================================
// NEON-SPECIFIC: Connection Pooling
// ==========================================
// Neon is serverless, so we need connection pooling
// Prisma handles this automatically with the connection string
// Just make sure your Neon URL has ?sslmode=require

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logConfig: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' 
  ? ['query', 'error', 'warn']
  : ['error'];

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: logConfig,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ==========================================
// TENANT MAGIC: withTenant
// ==========================================

type QueryArgs = {
  where?: Record<string, any>;
  [key: string]: any;
};

type QueryFn = (args: QueryArgs) => Promise<any>;

export function withTenant(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ 
          model, 
          operation, 
          args, 
          query 
        }: { 
          model: string; 
          operation: string; 
          args: QueryArgs; 
          query: QueryFn; 
        }) {
          args.where = { ...args.where, organizationId };
          return query(args);
        },
        
        async findFirst({ 
          model, 
          operation, 
          args, 
          query 
        }: { 
          model: string; 
          operation: string; 
          args: QueryArgs; 
          query: QueryFn; 
        }) {
          args.where = { ...args.where, organizationId };
          return query(args);
        },
        
        async findUnique({ 
          model, 
          operation, 
          args, 
          query 
        }: { 
          model: string; 
          operation: string; 
          args: QueryArgs; 
          query: QueryFn; 
        }) {
          if ('where' in args) {
            const prismaAny = prisma as any;
            return prismaAny[model].findFirst({
              where: { ...args.where, organizationId },
            });
          }
          return query(args);
        },
        
        async count({ 
          model, 
          operation, 
          args, 
          query 
        }: { 
          model: string; 
          operation: string; 
          args: QueryArgs; 
          query: QueryFn; 
        }) {
          args.where = { ...args.where, organizationId };
          return query(args);
        },
      },
    },
  });
}

export * from '@prisma/client';