import { useDashboardStats } from '../hooks/useDashboard';
import { useSalesOverview, useSalesByPeriod, useRevenueByCategory, useTopProducts } from '../hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Package, AlertTriangle, DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salesOverview } = useSalesOverview();
  const { data: salesTrend } = useSalesByPeriod('monthly');
  const { data: revenueByCategory } = useRevenueByCategory();
  const { data: topProducts } = useTopProducts();
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem('token');
  navigate({ to: '/login' });
};
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

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
    {
      title: 'Total Sales',
      value: salesOverview?.totalSales || 0,
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Total Revenue',
      value: `$${(salesOverview?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Pending Sales',
      value: salesOverview?.pendingSales || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Avg Order Value',
      value: `$${salesOverview?.avgOrderValue || '0.00'}`,
      icon: DollarSign,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  return (
<DashboardLayout>
<div className="space-y-6">
      <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
    <p className="text-muted-foreground">Overview of your business</p>
  </div>
  <Button variant="outline" onClick={handleLogout}>
    <LogOut className="mr-2 h-4 w-4" />
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Trend (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {salesTrend && salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => (typeof value === 'number' ? `$${value.toFixed(2)}` : '')} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sales data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {revenueByCategory && revenueByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {revenueByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) =>
                      typeof value === "number" ? `$${value.toFixed(2)}` : value
                    } />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No category data yet
                </div>
              )}
            </div>
            {revenueByCategory && revenueByCategory.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {revenueByCategory.map((cat: any, i: number) => (
                  <div key={cat.category} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span>{cat.category}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No product sales yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent?.sales?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet</p>
              ) : (
                stats?.recent?.sales?.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{sale.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{sale.customer?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(sale.total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{sale.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
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
              {stats?.recent?.employees?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No employees yet</p>
              ) : (
                stats?.recent?.employees?.map((emp: any) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.position || 'No position'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{emp.employeeId}</span>
                  </div>
                ))
              )}
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
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
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