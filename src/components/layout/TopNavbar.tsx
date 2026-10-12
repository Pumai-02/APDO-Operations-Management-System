import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { UserRole } from '../../types/database';
import {
  Menu,
  Bell,
  RotateCcw,
  Check,
  AlertTriangle,
  FileCheck,
  User as UserIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const TopNavbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { currentUser, currentRole, switchRole, allUsers, switchUser } = useAuth();
  const { conflicts, schedules, resetDemoData } = useOperations();
  const location = useLocation();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const openConflicts = conflicts.filter(c => !c.resolved);
  const pendingApprovals = schedules.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW');
  const notificationCount = openConflicts.length + pendingApprovals.length;

  const handleResetData = () => {
    if (window.confirm('Reset all operational demo data to initial defaults?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Executive Operational Dashboard';
      case '/schedules': return 'Operational Schedules & Timetable';
      case '/conflicts': return 'Conflict Detection & Validation Engine';
      case '/approvals': return 'Operational Approval Workflow';
      case '/branches': return 'Organizational Branches & Campuses';
      case '/majors': return 'Academic Majors & Degree Programs';
      case '/sections': return 'Cohort Class Sections';
      case '/courses': return 'Course Catalog & Syllabus Management';
      case '/classrooms': return 'Physical Resources & Classrooms';
      case '/time-slots': return 'Operational Time Slots';
      case '/lecturers': return 'Staff & Faculty Management';
      case '/availabilities': return 'Faculty Availability Matrix';
      case '/reports': return 'Operational Reports & Analytics';
      case '/audit-logs': return 'System Activity & Audit Logs';
      case '/users': return 'User Account Access Control';
      case '/settings': return 'System Settings & Operational Policies';
      case '/profile': return 'User Profile & Responsibilities';
      default: return 'APDO Operations Management';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="lg:hidden flex items-center shrink-0">
          <img src="/logo.png" alt="Western University" className="w-8 h-8 object-contain" />
        </Link>

        <div className="flex flex-col">
          <h1 className="text-sm sm:text-base font-bold text-brand-navy leading-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5 font-medium">
            <span className="text-slate-400">APDO</span>
            <span>/</span>
            <span className="capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Development Demo Role Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowRoleModal(!showRoleModal)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/75 hover:bg-blue-100 text-brand-navy transition-all shadow-xs"
            title="Switch Demo Role (Admin / Dean / Lecturer)"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold">Demo Role:</span>
            <span className="text-xs font-bold text-brand-blue uppercase px-1.5 py-0.2 rounded bg-white border border-blue-200">
              {currentRole}
            </span>
          </button>

          {/* Role Switcher Dropdown */}
          {showRoleModal && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-dropdown border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Demo Role Switcher</div>
                  <div className="text-[10px] text-slate-500">Test different permission scopes</div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  DEMO ONLY
                </span>
              </div>

              <div className="space-y-1">
                {(['ADMIN', 'DEAN', 'LECTURER'] as UserRole[]).map(role => {
                  const isSelected = currentRole === role;
                  const roleUser = allUsers.find(u => u.role === role);

                  return (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setShowRoleModal(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-brand-blue font-semibold border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-bold flex items-center gap-1.5">
                          {role}
                          {role === 'ADMIN' && <span className="text-[9px] text-slate-400 font-normal">(System Admin)</span>}
                          {role === 'DEAN' && <span className="text-[9px] text-slate-400 font-normal">(Supervisor)</span>}
                          {role === 'LECTURER' && <span className="text-[9px] text-slate-400 font-normal">(Faculty/Staff)</span>}
                        </div>
                        {roleUser && (
                          <div className="text-[11px] text-slate-500">{roleUser.name}</div>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-blue" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Operational alerts"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            )}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Operational Alerts</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                  {notificationCount} Alerts
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                {openConflicts.map(c => (
                  <Link
                    key={c.id}
                    to="/conflicts"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-100 hover:bg-rose-100/70 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-900">{c.conflict_type}</div>
                      <div className="text-[11px] text-rose-700 line-clamp-2">{c.description}</div>
                    </div>
                  </Link>
                ))}

                {pendingApprovals.map(s => (
                  <Link
                    key={s.id}
                    to="/approvals"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-100 hover:bg-amber-100/70 transition-colors"
                  >
                    <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900">Schedule #{s.id} Awaiting Decision</div>
                      <div className="text-[11px] text-amber-700">{s.remarks || 'Pending approval'}</div>
                    </div>
                  </Link>
                ))}

                {notificationCount === 0 && (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    All operations running smoothly with zero unresolved alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset Demo Mock Data"
        >
          <RotateCcw className={`w-4 h-4 ${resetSuccess ? 'text-emerald-600 animate-spin' : ''}`} />
        </button>

        {/* User Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 text-slate-700 hover:text-brand-navy"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs border border-slate-200">
            <UserIcon className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold leading-tight">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400">{currentUser.email}</div>
          </div>
        </Link>
      </div>
    </header>
  );
};
