import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceList from './pages/InvoiceList';
import OrganizationSettings from './pages/OrganizationSettings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminOrganizationsOverview from './pages/AdminOrganizationsOverview';
import AdminOrganizationUsers from './pages/AdminOrganizationUsers';
import AdminOrganizationDesign from './pages/AdminOrganizationDesign';
import AdminUsers from './pages/AdminUsers';
import AdminUserOrganizations from './pages/AdminUserOrganizations';
import AdminAssignments from './pages/AdminAssignments';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoiceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/new/:type"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id/edit"
        element={
          <ProtectedRoute>
            <EditInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/settings"
        element={
          <ProtectedRoute>
            <OrganizationSettings />
          </ProtectedRoute>
        }
      />
      
      {/* Routes Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizations"
        element={
          <ProtectedRoute>
            <AdminOrganizations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizations/overview"
        element={
          <ProtectedRoute>
            <AdminOrganizationsOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizations/:orgId/users"
        element={
          <ProtectedRoute>
            <AdminOrganizationUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organizations/:orgId/design"
        element={
          <ProtectedRoute>
            <AdminOrganizationDesign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId/organizations"
        element={
          <ProtectedRoute>
            <AdminUserOrganizations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute>
            <AdminAssignments />
          </ProtectedRoute>
        }
      />
      
      {/* Route par défaut - rediriger vers login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <AppRoutes />
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
