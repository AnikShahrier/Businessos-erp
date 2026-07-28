import { useDashboardStats } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from '@tanstack/react-router';
import { DashboardLayout } from '../components/layout/dashboard-layout';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const navigate = useNavigate({ from: '/dashboard' });
  const logout = useAuthStore.getState().logout;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
    navigate({ to: '/login' });
  };
  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.counts?.employees || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: stats?.counts?.products || 0,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Low Stock Items',
      value: stats?.counts?.lowStock || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Inventory Value',
      value: `$${(stats?.financials?.inventoryValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business</p>
          </div>
          <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
             {stats?.recent?.employees?.map((emp: any) => (
  <div key={emp.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
    <div>
      <p className="font-medium">
  {emp.firstName} {emp.lastName}
</p>
      <p className="text-xs text-muted-foreground">
        {emp.position || emp.department || 'No position'}
      </p>
    </div>
    <span className="text-xs text-muted-foreground font-mono">{emp.employeeId}</span>
  </div>
))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent?.products?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products yet</p>
              ) : (
                stats?.recent?.products?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats?.topLowStock && stats.topLowStock.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLowStock.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}

 

