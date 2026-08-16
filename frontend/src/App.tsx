import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RolesProvider } from './context/RolesContext';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { AuditProvider } from './context/AuditContext';
import { ProductProvider } from './context/ProductContext';
import { SalesProvider } from './context/SalesContext';
import { UsersProvider } from './context/UsersContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Users from './pages/Users';
import RolesPermissions from './pages/RolesPermissions';

function RootRedirect() {
  const token = localStorage.getItem('minisuper_user');
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <ModalProvider>
      <RolesProvider>
        <AuthProvider>
          <AuditProvider>
            <ProductProvider>
              <SalesProvider>
                <UsersProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<RootRedirect />} />
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <AppLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="dashboard"  element={<Dashboard />} />
                        <Route path="pos"        element={<POS />} />
                        <Route path="inventory"  element={<Inventory />} />
                        <Route path="reports"    element={<Reports />} />
                        <Route path="audit-log"  element={
                          <ProtectedRoute permission="auditlog:view"><AuditLog /></ProtectedRoute>
                        } />
                        <Route path="users"      element={
                          <ProtectedRoute permission="users:view"><Users /></ProtectedRoute>
                        } />
                        <Route path="roles"      element={
                          <ProtectedRoute permission="roles:view"><RolesPermissions /></ProtectedRoute>
                        } />
                      </Route>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </BrowserRouter>
                </UsersProvider>
              </SalesProvider>
            </ProductProvider>
          </AuditProvider>
        </AuthProvider>
      </RolesProvider>
    </ModalProvider>
  );
}
