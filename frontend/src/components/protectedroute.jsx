import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || '').toLowerCase();
  const allowed = allowedRoles.length === 0 || allowedRoles.map(r => String(r).toLowerCase()).includes(role);

  if (!allowed) {
    return <Navigate to={role === 'admin' ? '/dashboard' : '/login'} replace />;
  }

  return children;
}