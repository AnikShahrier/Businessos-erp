import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {DashboardLayout} from '../components/layout/dashboard-layout';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Package,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface InventoryItem {
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
}

interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  lowStock?: boolean;
}

const INVENTORY_KEY = 'inventory';

// --- Hooks (defined OUTSIDE component - these are custom hooks, fine here) ---
function useInventory(filters?: InventoryFilters) {
  return useQuery({
    queryKey: [INVENTORY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.lowStock) params.append('lowStock', 'true');
      
      const { data } = await api.get<InventoryItem[]>(`/inventory?${params}`);
      return data;
    },
  });
}

function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });
    },
  });
}

// const statusColors: Record<string, string> = {
//   ACTIVE: 'bg-green-100 text-green-800',
//   INACTIVE: 'bg-gray-100 text-gray-800',
//   DISCONTINUED: 'bg-red-100 text-red-800',
// };


// --- Component ---
export default function InventoryPage() {
  // ✅ useNavigate MUST be called INSIDE the component function
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [searchInput, setSearchInput] = useState('');
  
  const { data: items, isLoading } = useInventory(filters);
  const deleteMutation = useDeleteInventory();

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined }));
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Item deleted successfully'),
        onError: () => toast.error('Failed to delete item'),
      });
    }
  };

  const isLowStock = (item: InventoryItem) => item.quantity <= item.reorderLevel;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and stock levels
          </p>
        </div>
        {/* ✅ navigate called inside onClick handler */}
        
        <Button onClick={() => navigate({ to: '/inventory/new' })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
       
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Input
            placeholder="Search by name, SKU, or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <select 
          value={filters.category || 'all'}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            category: e.target.value === 'all' ? undefined : e.target.value 
          }))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Food">Food</option>
          <option value="Office">Office</option>
        </select>

        {/* <select
          value={filters.status || 'all'}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            status: e.target.value === 'all' ? undefined : e.target.value 
          }))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select> */}

        <Button
          variant={filters.lowStock ? 'default' : 'outline'}
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            lowStock: !prev.lowStock 
          }))}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Low Stock
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium">SKU</th>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-right p-3 font-medium">Qty</th>
              <th className="text-right p-3 font-medium">Price</th>
              {/* <th className="text-left p-3 font-medium">Status</th> */}
              <th className="p-3 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : items?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">
                <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No products found</p>
              </td></tr>
            ) : (
              items?.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{item.sku}</td>
                  <td className="p-3">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-gray-500 text-xs truncate max-w-[200px]">{item.description}</div>
                    )}
                  </td>
                  <td className="p-3">{item.category || '-'}</td>
                  <td className="p-3 text-right">
                    <span className={isLowStock(item) ? 'text-red-600 font-bold' : ''}>
                      {item.quantity}
                    </span>
                    {isLowStock(item) && <AlertTriangle className="inline ml-1 h-3 w-3 text-red-500" />}
                  </td>
                  <td className="p-3 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  {/* <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td> */}
                  <td className="p-3 text-center">
                    <div className="flex gap-3 justify-center items-center">
                      {/* ✅ navigate called inside onClick */}
                      <Pencil 
                        className="h-4 w-4 text-blue-600 cursor-pointer " 
                        onClick={() => navigate({ to: '/inventory/$id/edit', params: { id: item.id } })}
                      />
                      <Trash2 
                        className="h-4 w-4 text-red-600 cursor-pointer" 
                        onClick={() => handleDelete(item.id, item.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </DashboardLayout>
  );
}