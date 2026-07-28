import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  unitPrice: z.coerce.number().min(0.01, 'Unit price must be greater than 0'),
  // costPrice: z.coerce.number().min(0).optional(),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative'),
  // status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
});

type FormData = z.infer<typeof formSchema>;

export default function NewInventoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    // setValue,
    // watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      quantity: 0,
      unitPrice: 0,
      // costPrice: undefined,
      reorderLevel: 10,
      // status: 'ACTIVE',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        unitPrice: data.unitPrice.toString(),
        // costPrice: data.costPrice?.toString(),
      };
      return api.post('/inventory', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Product added successfully');
      navigate({ to: '/inventory' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add product');
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ✅ Use a plain button, not Button component with asChild */}
      <button 
        onClick={() => navigate({ to: '/inventory' })}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inventory
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register('name')} placeholder="e.g., Wireless Mouse" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" {...register('category')} placeholder="e.g., Electronics" />
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Product description..."
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input id="unitPrice" type="number" step="0.01" {...register('unitPrice', { valueAsNumber: true })} />
                {errors.unitPrice && <p className="text-sm text-red-500">{errors.unitPrice.message}</p>}
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price ($)</Label>
                <Input id="costPrice" type="number" step="0.01" {...register('costPrice', { valueAsNumber: true })} />
              </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input id="reorderLevel" type="number" {...register('reorderLevel', { valueAsNumber: true })} />
                {errors.reorderLevel && <p className="text-sm text-red-500">{errors.reorderLevel.message}</p>}
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={watch('status')}
                  onChange={(e) => setValue('status', e.target.value as any)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div> */}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              {/* ✅ Use plain button for cancel */}
              <button
                type="button"
                onClick={() => navigate({ to: '/inventory' })}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {createMutation.isPending ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}