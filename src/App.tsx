import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Builder from '@/pages/Builder';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <h2 className="text-2xl font-bold">Template Gallery coming soon</h2>
                  <p className="text-muted-foreground">We are working on premium templates for you.</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Builder Route (No Global Layout) */}
          <Route 
            path="/builder/:id" 
            element={<Builder />} 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
