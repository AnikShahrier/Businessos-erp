import { useParams, useNavigate } from '@tanstack/react-router';
import { useSale, useUpdateSaleStatus, useDeleteSale } from '../hooks/useSales';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react';


const statusColors: any = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function SaleDetailPage() {
  const { saleId } = useParams({ from: '/sales/$saleId' });
  const navigate = useNavigate();
  const { data: sale, isLoading } = useSale(saleId);
  const statusMutation = useUpdateSaleStatus();
  const deleteMutation = useDeleteSale();

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!sale) return <p className="p-6">Sale not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate({ to: '/sales' })}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sales
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{sale.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            {new Date(sale.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge className={statusColors[sale.status]}>{sale.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{sale.customer?.name}</p>
          <p className="text-sm text-muted-foreground">{sale.customer?.email}</p>
          <p className="text-sm text-muted-foreground">{sale.customer?.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-right p-2">Unit Price</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="p-2 text-right">${Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t mt-4 pt-4 space-y-1 text-sm text-right">
            <p>Subtotal: ${Number(sale.subtotal).toFixed(2)}</p>
            <p>Tax: ${Number(sale.tax).toFixed(2)}</p>
            <p className="text-lg font-bold">Total: ${Number(sale.total).toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {sale.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{sale.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {sale.status === 'PENDING' && (
          <Button
            onClick={() => statusMutation.mutate({ id: sale.id, status: 'PAID' as any })}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Paid
          </Button>
        )}
        {sale.status === 'PAID' && (
          <Button
            variant="outline"
            onClick={() => statusMutation.mutate({ id: sale.id, status: 'PENDING' as any })}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Revert to Pending
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm('Delete this sale?')) {
              deleteMutation.mutate(sale.id, {
                onSuccess: () => navigate({ to: '/sales' }),
              });
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}