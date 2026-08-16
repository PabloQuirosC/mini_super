import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  permission?: string;
}

export default function ProtectedRoute({ children, permission }: Props) {
  const { isAuthenticated, can } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (permission && !can(permission)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
