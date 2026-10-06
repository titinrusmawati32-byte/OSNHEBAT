import React from 'react';
import { Outlet } from 'react-router-dom';
import { BaseLayout } from './BaseLayout';
import { ProtectedRoute, RoleGuard } from '../routes/ProtectedRoute';

export const StudentLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['student']}>
        <BaseLayout>
          <Outlet />
        </BaseLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
};
