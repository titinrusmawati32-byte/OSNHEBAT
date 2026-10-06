import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProfilePage } from '../pages/common/ProfilePage';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { StudentLayout } from '../layouts/StudentLayout';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentExamsPage } from '../pages/student/StudentExamsPage';
import { StudentMaterialsPage } from '../pages/student/StudentMaterialsPage';
import { StudentResultsPage } from '../pages/student/StudentResultsPage';
import { StudentResultDetailPage } from '../pages/student/StudentResultDetailPage';
import { StudentHistoryPage } from '../pages/student/StudentHistoryPage';

// Teacher Pages
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage';
import { TeacherQuestionsPage } from '../pages/teacher/TeacherQuestionsPage';
import { TeacherExamsPage } from '../pages/teacher/TeacherExamsPage';
import { TeacherMaterialsPage } from '../pages/teacher/TeacherMaterialsPage';
import { GuruResultsPage as TeacherResultsPage } from '../pages/teacher/GuruResultsPage';
import { GuruResultDetailPage as TeacherResultDetailPage } from '../pages/teacher/GuruResultDetailPage';
import { TeacherRankingPage } from '../pages/teacher/TeacherRankingPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminStudentsPage, AdminTeachersPage } from '../pages/admin/AdminStudentsPage';
import { AdminQuestionsPage } from '../pages/admin/AdminQuestionsPage';
import { AdminExamsPage } from '../pages/admin/AdminExamsPage';
import { AdminMaterialsPage } from '../pages/admin/AdminMaterialsPage';
import { AdminSchedulesPage } from '../pages/admin/AdminSchedulesPage';
import { AdminResultsPage } from '../pages/admin/AdminResultsPage';
import { AdminRankingPage } from '../pages/admin/AdminRankingPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, profile } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated && profile ? (
              <Navigate to={`/${profile.role}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            isAuthenticated && profile ? (
              <Navigate to={`/${profile.role}`} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboardPage />} />
          <Route path="exams" element={<StudentExamsPage />} />
          <Route path="materials" element={<StudentMaterialsPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="results/:resultId" element={<StudentResultDetailPage />} />
          <Route path="history" element={<StudentHistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboardPage />} />
          <Route path="questions" element={<TeacherQuestionsPage />} />
          <Route path="exams" element={<TeacherExamsPage />} />
          <Route path="materials" element={<TeacherMaterialsPage />} />
          <Route path="results" element={<TeacherResultsPage />} />
          <Route path="results/:resultId" element={<TeacherResultDetailPage />} />
          <Route path="ranking" element={<TeacherRankingPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="teachers" element={<AdminTeachersPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="exams" element={<AdminExamsPage />} />
          <Route path="materials" element={<AdminMaterialsPage />} />
          <Route path="schedules" element={<AdminSchedulesPage />} />
          <Route path="results" element={<AdminResultsPage />} />
          <Route path="ranking" element={<AdminRankingPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};
