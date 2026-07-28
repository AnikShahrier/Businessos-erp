import { useNavigate } from '@tanstack/react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const itemSchema = z.object({
  inventoryItemId: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().min(1, 'Min 1'),
  unitPrice: z.coerce.number().min(0.01, 'Price required'),
});

const formSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
});

type FormData = z.infer<typeof formSchema>;

export default function NewSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/customers');
      return data;
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await api.get('/inventory');
      return data;
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ inventoryItemId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          unitPrice: item.unitPrice.toString(),
        })),
      };
      return api.post('/sales', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Sale created');
      navigate({ to: '/sales' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sale');
    },
  });

  const watchedItems = watch('items');
  const subtotal = watchedItems?.reduce((sum, item) => {
    const price = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate({ to: '/sales' })}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sales
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer */}
            <div className="space-y-2">
              <Label>Customer *</Label>
              <select
                {...register('customerId')}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select customer</option>
                {customers?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <Label>Line Items *</Label>
              {fields.map((field, index) => {
                // const selectedProduct = inventory?.find(
                //   (p: any) => p.id === watchedItems?.[index]?.inventoryItemId
                // );
                return (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end border p-3 rounded-md">
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Product</Label>
                      <select
                        {...register(`items.${index}.inventoryItemId`)}
                        className="w-full border rounded-md px-2 py-1.5 text-sm"
                        onChange={(e) => {
                          const product = inventory?.find((p: any) => p.id === e.target.value);
                          if (product) {
                            // You could auto-fill price here
                          }
                        }}
                      >
                        <option value="">Select product</option>
                        {inventory?.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min={1} {...register(`items.${index}.quantity`)} />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitPrice`)}
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium pt-5">
                      ${(Number(watchedItems?.[index]?.unitPrice || 0) * Number(watchedItems?.[index]?.quantity || 0)).toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ inventoryItemId: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
              {errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                {...register('notes')}
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                placeholder="Optional notes..."
              />
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate({ to: '/sales' })}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Sale
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}