export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unitPrice: string;
  costPrice: string | null;
  reorderLevel: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  lowStock?: boolean;
}