import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DashboardLayout } from '../components/layout/dashboard-layout';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate({ from: '/dashboard' });

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
    navigate({ to: '/login' });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your organization.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Employees" value="0" icon="👥" />
        <StatCard title="Inventory Items" value="0" icon="📦" />
        <StatCard title="Sales This Month" value="$0" icon="💰" />
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}