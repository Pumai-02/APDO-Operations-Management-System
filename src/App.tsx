import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OperationsProvider } from './context/OperationsContext';
import { MainLayout } from './components/layout/MainLayout';
import { RoleGuard } from './components/shared/RoleGuard';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { ConflictsPage } from './pages/ConflictsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { BranchesPage } from './pages/BranchesPage';
import { MajorsPage } from './pages/MajorsPage';
import { ClassSectionsPage } from './pages/ClassSectionsPage';
import { CoursesPage } from './pages/CoursesPage';
import { ClassroomsPage } from './pages/ClassroomsPage';
import { TimeSlotsPage } from './pages/TimeSlotsPage';
import { LecturersPage } from './pages/LecturersPage';
import { AvailabilitiesPage } from './pages/AvailabilitiesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePreviewPage } from './pages/SchedulePreviewPage';
import { BatchesPage } from './pages/BatchesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AcademicYearsPage } from './pages/AcademicYearsPage';

export function App() {
  return (
    <AuthProvider>
      <OperationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Common Routes */}
              <Route index element={<DashboardPage />} />
              <Route path="schedules" element={<SchedulesPage />} />
              <Route path="schedule-preview" element={<SchedulePreviewPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="availabilities" element={<AvailabilitiesPage />} />
              <Route path="profile" element={<ProfilePage />} />

              {/* Manager (DEAN) & ADMIN Routes */}
              <Route
                path="conflicts"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <ConflictsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="approvals"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <ApprovalsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="departments"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <DepartmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="majors"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <MajorsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="sections"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <ClassSectionsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="batches"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <BatchesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="classrooms"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <ClassroomsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="lecturers"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <LecturersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="reports"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'DEAN']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />

              {/* ADMIN Exclusive Routes */}
              <Route
                path="academic-years"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AcademicYearsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="branches"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <BranchesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="time-slots"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <TimeSlotsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AuditLogsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="users"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <UsersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="settings"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <SettingsPage />
                  </RoleGuard>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </OperationsProvider>
    </AuthProvider>
  );
}

export default App;
