import React from 'react';
import { Outlet } from 'react-router-dom';
import { BaseLayout } from './BaseLayout';
import { ProtectedRoute, RoleGuard } from '../routes/ProtectedRoute';

export const AdminLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['admin']}>
        <BaseLayout>
          <Outlet />
        </BaseLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
};
