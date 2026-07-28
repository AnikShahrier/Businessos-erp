import { z } from 'zod';

export const inventoryStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']);

export const createInventorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  unitPrice: z.coerce.number().min(0.01, 'Unit price must be greater than 0'),
  costPrice: z.coerce.number().min(0).optional(),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative'),
  status: inventoryStatusEnum.default('ACTIVE'),
});

export const updateInventorySchema = createInventorySchema.partial();

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;