import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSales, useDeleteSale, useUpdateSaleStatus } from '../hooks/useSales';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Eye, Trash2, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { SaleStatus } from '@prisma/client';
import {DashboardLayout} from '../components/layout/dashboard-layout';


const statusColors: Record<SaleStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',      // <-- FIX: was COMPLETED
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusIcons = {
  DRAFT: FileText,
  PENDING: Clock,
  PAID: CheckCircle,                        // <-- FIX: was COMPLETED
  CANCELLED: XCircle,
};

export default function SalesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | ''>('');

  const { data: sales, isLoading } = useSales({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const deleteMutation = useDeleteSale();
  const statusMutation = useUpdateSaleStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground">Manage invoices and orders</p>
        </div>
        <Button onClick={() => navigate({ to: '/sales/new' })}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SaleStatus | '')}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground">Loading...</p>
          ) : sales?.length === 0 ? (
            <p className="p-6 text-muted-foreground">No sales found</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Invoice #</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Items</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((sale: any) => {
                  const StatusIcon = statusIcons[sale.status as SaleStatus];
                  return (
                    <tr key={sale.id} className="border-t">
                      <td className="p-3 font-mono text-xs">{sale.invoiceNumber}</td>
                      <td className="p-3">
                        <div className="font-medium">{sale.customer?.name}</div>
                        <div className="text-xs text-muted-foreground">{sale.customer?.email}</div>
                      </td>
                      <td className="p-3">{sale._count?.items || 0} items</td>
                      <td className="p-3 font-semibold">${Number(sale.total).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge className={statusColors[sale.status as SaleStatus]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {sale.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => statusMutation.mutate({ id: sale.id, status: 'PAID' })}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate({ to: `/sales/${sale.id}` })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Delete this sale?')) deleteMutation.mutate(sale.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}