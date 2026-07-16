import { Button } from '../components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6">
          <span className="text-6xl">🏢</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">BusinessOS</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          The modern multi-tenant ERP platform for SMEs. 
          Manage your organization, employees, inventory, and sales — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <a href="/register">Get Started</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    </div>
  );
}