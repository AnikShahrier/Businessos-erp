import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useSalesOverview = () => {
  return useQuery({
    queryKey: ['reports', 'sales-overview'],
    queryFn: async () => {
      const { data } = await api.get('/reports/sales-overview');
      return data;
    },
  });
};

export const useSalesByPeriod = (period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
  return useQuery({
    queryKey: ['reports', 'sales-by-period', period],
    queryFn: async () => {
      const { data } = await api.get(`/reports/sales-by-period?period=${period}`);
      return data;
    },
  });
};

export const useRevenueByCategory = () => {
  return useQuery({
    queryKey: ['reports', 'revenue-by-category'],
    queryFn: async () => {
      const { data } = await api.get('/reports/revenue-by-category');
      return data;
    },
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['reports', 'top-products'],
    queryFn: async () => {
      const { data } = await api.get('/reports/top-products');
      return data;
    },
  });
};

export const useTopCustomers = () => {
  return useQuery({
    queryKey: ['reports', 'top-customers'],
    queryFn: async () => {
      const { data } = await api.get('/reports/top-customers');
      return data;
    },
  });
};