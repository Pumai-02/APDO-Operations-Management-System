import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import {
  LayoutDashboard,
  CalendarCheck,
  AlertTriangle,
  FileCheck2,
  Building2,
  GraduationCap,
  Users2,
  BookOpen,
  DoorOpen,
  Clock,
  UserCheck,
  Calendar,
  CalendarDays,
  BarChart3,
  History,
  ShieldCheck,
  Settings,
  ChevronRight,
  Sparkles,
  Printer,
  Layers
} from 'lucide-react';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  roles?: ('ADMIN' | 'DEAN' | 'LECTURER')[];
}

interface SidebarSection {
  heading: string;
  items: SidebarItem[];
}

export const AppSidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({
  isOpen,
  toggleSidebar
}) => {
  const { currentRole, currentUser } = useAuth();
  const { conflicts, schedules } = useOperations();

  const openConflictsCount = conflicts.filter(c => !c.resolved).length;
  const pendingApprovalsCount = schedules.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;

  const sections: SidebarSection[] = [
    {
      heading: 'Operations & Timetable',
      items: [
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        { title: 'Operational Schedules', path: '/schedules', icon: CalendarCheck },
        { title: 'Schedule Preview & Export', path: '/schedule-preview', icon: Printer },
        {
          title: 'Conflict Detection',
          path: '/conflicts',
          icon: AlertTriangle,
          badge: openConflictsCount > 0 ? openConflictsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
          roles: ['ADMIN', 'DEAN']
        },
        {
          title: 'Approval Workflow',
          path: '/approvals',
          icon: FileCheck2,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
          roles: ['ADMIN', 'DEAN']
        }
      ]
    },
    {
      heading: 'Organizational Structure',
      items: [
        { title: 'Academic Years', path: '/academic-years', icon: Calendar, roles: ['ADMIN'] },
        { title: 'Departments & Deans', path: '/departments', icon: Building2, roles: ['ADMIN', 'DEAN'] },
        { title: 'Branches & Campuses', path: '/branches', icon: Building2, roles: ['ADMIN'] },
        { title: 'Majors & Programs', path: '/majors', icon: GraduationCap, roles: ['ADMIN', 'DEAN'] },
        { title: 'Batch Management', path: '/batches', icon: Layers, roles: ['ADMIN', 'DEAN'] },
        { title: 'Cohort Class Sections', path: '/sections', icon: Users2, roles: ['ADMIN', 'DEAN'] }
      ]
    },
    {
      heading: 'Resources & Academic',
      items: [
        { title: 'Course Catalog', path: '/courses', icon: BookOpen },
        { title: 'Classrooms & Facilities', path: '/classrooms', icon: DoorOpen, roles: ['ADMIN', 'DEAN'] },
        { title: 'Time Slots', path: '/time-slots', icon: Clock, roles: ['ADMIN'] }
      ]
    },
    {
      heading: 'Personnel & Availability',
      items: [
        { title: 'Lecturers & Faculty', path: '/lecturers', icon: UserCheck, roles: ['ADMIN', 'DEAN'] },
        { title: 'Faculty Availability', path: '/availabilities', icon: CalendarDays }
      ]
    },
    {
      heading: 'Analytics & Administration',
      items: [
        { title: 'Operational Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'DEAN'] },
        { title: 'Audit & Change Logs', path: '/audit-logs', icon: History, roles: ['ADMIN'] },
        { title: 'User Management', path: '/users', icon: ShieldCheck, roles: ['ADMIN'] },
        { title: 'System Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-navy text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-700/60 bg-[#122b4a]">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
            <img src="/logo.png" alt="Western University Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white leading-tight truncate">APDO OPERATIONS</span>
            <span className="text-[10px] text-blue-200/90 font-semibold tracking-wider uppercase truncate">Western University</span>
          </div>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((sec, secIdx) => {
            const visibleItems = sec.items.filter(item => !item.roles || item.roles.includes(currentRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={secIdx}>
                <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {sec.heading}
                </div>
                <div className="space-y-1">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-brand-blue text-white shadow-sm font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-blue-600 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Current Profile Card */}
        <div className="p-3 border-t border-slate-700/60 bg-[#122b4a]/75">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-400/30">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-blue-300/80 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {currentRole}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
