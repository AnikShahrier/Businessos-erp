import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import './index.css';

// Import pages
import EditEmployeePage from './routes/employees.$id.edit';
import HomePage from './routes/index';
import LoginPage from './routes/login';
import RegisterPage from './routes/register';
import DashboardPage from './routes/dashboard';
import EmployeesPage from './routes/employees';
import NewEmployeePage from './routes/employees.new';
import InventoryPage from './routes/InventoryPage';
import { ProtectedRoute } from './components/protected-route';
import NewInventoryPage from './routes/NewInventoryPage';
import EditInventoryPage from './routes/EditInventoryPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const inventoryNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory/new',
  component: NewInventoryPage,
});

const inventoryEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory/$id/edit',
  component: EditInventoryPage,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  component: () => (
    <ProtectedRoute>
      <EmployeesPage />
    </ProtectedRoute>
  ),
});
const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryPage,
});
const newEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/new',
  component: () => (
    <ProtectedRoute>
      <NewEmployeePage />
    </ProtectedRoute>
  ),
});

const editEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id/edit',
  component: () => (
    <ProtectedRoute>
      <EditEmployeePage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  employeesRoute,
  newEmployeeRoute,
  editEmployeeRoute,
  inventoryRoute,
   inventoryNewRoute,
  inventoryEditRoute, 
]);

const router = createRouter({ routeTree });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);