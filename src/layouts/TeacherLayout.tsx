import React from 'react';
import { Outlet } from 'react-router-dom';
import { BaseLayout } from './BaseLayout';
import { ProtectedRoute, RoleGuard } from '../routes/ProtectedRoute';

export const TeacherLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['teacher']}>
        <BaseLayout>
          <Outlet />
        </BaseLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
};
