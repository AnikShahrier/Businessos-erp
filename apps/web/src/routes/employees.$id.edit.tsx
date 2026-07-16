import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import api from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DashboardLayout } from '../components/layout/dashboard-layout';

const employeeSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

export default function EditEmployeePage() {
  const navigate = useNavigate({ from: '/employees/$id/edit' });
  const { id } = useParams({ from: '/employees/$id/edit' });
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      reset({
        department: response.data.department || '',
        position: response.data.position || '',
        salary: response.data.salary?.toString() || '',
        status: response.data.status,
      });
    } catch (error) {
      toast.error('Failed to load employee');
      navigate({ to: '/employees' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EmployeeInput) => {
    try {
      toast.loading('Updating employee...', { id: 'update' });
      
      await api.patch(`/employees/${id}`, data);
      
      toast.success('Employee updated!', { id: 'update' });
      navigate({ to: '/employees' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update employee';
      toast.error(message, { id: 'update' });
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
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Employee</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                placeholder="Engineering"
                {...register('department')}
                className={errors.department ? 'border-red-500' : ''}
              />
              {errors.department && (
                <p className="text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                placeholder="Software Engineer"
                {...register('position')}
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && (
                <p className="text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                placeholder="50000"
                {...register('salary')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Employee'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate({ to: '/employees' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}