import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import api from '../lib/api';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface Employee {
  id: string;
  employeeId: string;
  department: string | null;
  position: string | null;
  status: string;
  joinDate: string;
  salary: number | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate({ from: '/employees' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <Button onClick={() => navigate({ to: '/employees/new' })}>
          + Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No employees found. Add your first employee!
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{emp.employeeId}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.department || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.position || '-'}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {emp.salary ? `$${emp.salary.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link 
  to="/employees/$id/edit"
  params={{ id: emp.id }}
  className="text-blue-600 hover:text-blue-800 font-medium"
>
  Edit
</Link>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    ON_LEAVE: 'bg-yellow-100 text-yellow-800',
    TERMINATED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}