import { useState } from 'react';
import {
  useSalesOverview,
  useSalesByPeriod,
  useRevenueByCategory,
  useTopProducts,
  useTopCustomers,
} from '../hooks/useReports';
import {DashboardLayout} from '../components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
  
} from 'recharts';



export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { data: overview } = useSalesOverview();
  const { data: trend } = useSalesByPeriod(period);
  const { data: categoryRevenue } = useRevenueByCategory();
  const { data: topProducts } = useTopProducts();
  const { data: topCustomers } = useTopCustomers();

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your business</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${(overview?.totalRevenue || 0).toLocaleString()}` },
          { label: 'Total Sales', value: overview?.totalSales || 0 },
          { label: 'Paid Sales', value: overview?.paidSales || 0 },
          { label: 'Pending Sales', value: overview?.pendingSales || 0 },
          { label: 'Cancelled', value: overview?.cancelledSales || 0 },
          { label: 'Avg Order', value: `$${overview?.avgOrderValue || '0.00'}` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Sales Trend</CardTitle>
          <select
            className="border rounded-md px-3 py-1.5 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: string | number | readonly (string | number)[] | undefined, name?: string | number) => {
                    const label = name === 'revenue' ? 'Revenue' : 'Sales Count';
                    const formattedValue = Array.isArray(value)
                      ? value.map((v) => v ?? 0).join(', ')
                      : name === 'revenue'
                      ? `$${Number(value ?? 0).toFixed(2)}`
                      : value ?? 0;
                    return [formattedValue, label] as const;
                  }} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data for selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryRevenue && categoryRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                      const numericValue = Array.isArray(value) ? value[0] : value;
                      return `$${Number(numericValue ?? 0).toFixed(2)}`;
                    }} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No category data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers && topCustomers.length > 0 ? (
                topCustomers.map((c: any, i: number) => (
                  <div key={c.name} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                      </div>
                    </div>
                    <span className="font-semibold">${c.spent.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No customer data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {topProducts && topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
    </div>
    </DashboardLayout>
  );
}