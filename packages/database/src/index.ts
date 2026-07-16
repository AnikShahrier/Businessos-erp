import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logConfig: string[] = process.env.NODE_ENV === 'development' 
  ? ['query', 'error', 'warn']
  : ['error'];

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: logConfig as any,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle connection issues with Neon
prisma.$connect().catch((err) => {
  console.error('Prisma connection error:', err);
});

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