import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import api from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DashboardLayout } from '../components/layout/dashboard-layout';

const employeeSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  joinDate: z.string().optional(),
  salary: z.string().optional(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

export default function NewEmployeePage() {
  const navigate = useNavigate({ from: '/employees/new' });
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeInput) => {
    try {
      toast.loading('Creating employee...', { id: 'create' });
      
      await api.post('/employees', data);
      
      toast.success('Employee created!', { id: 'create' });
      navigate({ to: '/employees' });
    } catch (error: any) {
      console.error('Create employee error:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to create employee';
      toast.error(message, { id: 'create' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h2>
        
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
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                {...register('joinDate')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                placeholder="50000"
                {...register('salary')}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Employee'}
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