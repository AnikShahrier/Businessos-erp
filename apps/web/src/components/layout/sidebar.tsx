import { Link } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { label: 'Dashboard', to: '/dashboard', icon: '📊' },
    { label: 'Employees', to: '/employees', icon: '👥' },
    { label: 'Inventory', to: '/inventory', icon: '📦' },
    { label: 'Sales', to: '/sales', icon: '💰' },
    { label: 'Reports', to: '/reports', icon: '📈' },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">BusinessOS</h2>
        <p className="text-sm text-gray-500 mt-1">{user?.organization.name}</p>
      </div>
      
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            activeProps={{ className: 'bg-blue-50 text-blue-700' }}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}