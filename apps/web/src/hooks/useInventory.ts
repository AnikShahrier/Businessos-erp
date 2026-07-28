import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';  // Changed: default import
import { InventoryItem, InventoryFilters } from '@/types/inventory';

const INVENTORY_KEY = 'inventory';

export const useInventory = (filters?: InventoryFilters) => {
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
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: [INVENTORY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<InventoryItem>(`/inventory/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.post('/inventory', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });
    },
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.patch(`/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });
    },
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });
    },
  });
};