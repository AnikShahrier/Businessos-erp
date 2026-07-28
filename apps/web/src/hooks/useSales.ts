import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { SaleStatus } from '@prisma/client';

export const useSales = (filters?: { status?: SaleStatus; search?: string }) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const { data } = await api.get(`/sales?${params.toString()}`);
      return data;
    },
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: async () => {
      const { data } = await api.get(`/sales/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.post('/sales', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });
};

export const useUpdateSaleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SaleStatus }) =>
      api.patch(`/sales/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sales/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });
};