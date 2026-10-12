import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { StatCard } from '../components/dashboard/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConflictBadge } from '../components/shared/ConflictBadge';
import {
  CalendarCheck,
  AlertTriangle,
  FileCheck2,
  Users2,
  Building2,
  PlusCircle,
  ArrowRight,
  Clock,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const {
    schedules,
    hydratedSchedules,
    conflicts,
    lecturers,
    branches,
    classrooms,
    courses,
    approvalHistory
  } = useOperations();

  // Stats calculation
  const totalSchedules = schedules.length;
  const approvedSchedules = schedules.filter(s => s.status === 'APPROVED').length;
  const pendingApprovals = schedules.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;
  const openConflicts = conflicts.filter(c => !c.resolved).length;
  const activeLecturers = lecturers.filter(l => l.is_active && l.employment_status === 'ACTIVE').length;
  const totalCapacity = classrooms.reduce((acc, c) => acc + c.capacity, 0);

  // Status breakdown for Recharts
  const statusColors: Record<string, string> = {
    APPROVED: '#10B981',
    UNDER_REVIEW: '#F59E0B',
    SUBMITTED: '#2563EB',
    DRAFT: '#94A3B8',
    REJECTED: '#EF4444'
  };

  const statusData = [
    { name: 'Approved', value: approvedSchedules, color: statusColors.APPROVED },
    { name: 'Under Review', value: schedules.filter(s => s.status === 'UNDER_REVIEW').length, color: statusColors.UNDER_REVIEW },
    { name: 'Submitted', value: schedules.filter(s => s.status === 'SUBMITTED').length, color: statusColors.SUBMITTED },
    { name: 'Draft', value: schedules.filter(s => s.status === 'DRAFT').length, color: statusColors.DRAFT },
    { name: 'Rejected', value: schedules.filter(s => s.status === 'REJECTED').length, color: statusColors.REJECTED }
  ].filter(d => d.value > 0);

  // Schedules by Branch
  const branchData = branches.map(b => {
    const count = schedules.filter(s => s.branch_id === b.id).length;
    return {
      name: b.name.replace(' Branch', '').replace(' Operations', ''),
      schedules: count,
      code: b.code
    };
  });

  // Filter for Lecturer role
  const myAssignedLecturer = lecturers.find(l => l.user_id === currentUser.id);
  const mySchedules = myAssignedLecturer
    ? hydratedSchedules.filter(s => s.lecturer_id === myAssignedLecturer.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Role Context */}
      <div className="bg-gradient-to-r from-brand-navy to-[#254b7c] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold mb-3 border border-blue-400/20">
              <span>Welcome, {currentUser.name}</span>
              <span className="w-1 h-1 rounded-full bg-blue-200" />
              <span className="uppercase">{currentRole} Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              APDO Operations Control Center
            </h2>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Centralized platform for operational scheduling, classroom allocation, faculty availability validation, and multi-tier approval workflows at Western University.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/schedules"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                Manage Schedules
              </Link>
              {(currentRole === 'ADMIN' || currentRole === 'DEAN') && (
                <Link
                  to="/approvals"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Review Queue ({pendingApprovals})
                </Link>
              )}
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all"
              >
                View Analytics
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-center bg-white rounded-2xl p-3.5 shadow-xl border border-white/40 shrink-0 text-slate-800 text-center">
            <img src="/logo.png" alt="Western University" className="w-20 h-20 object-contain drop-shadow" />
            <span className="font-extrabold text-[11px] tracking-wider uppercase text-brand-navy mt-1.5">Western University</span>
            <span className="text-[9px] text-slate-500 font-medium">APDO Operations</span>
          </div>
        </div>
      </div>

      {/* Critical Conflict Warning Alert if open conflicts exist */}
      {openConflicts > 0 && (currentRole === 'ADMIN' || currentRole === 'DEAN') && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                {openConflicts} Unresolved Operational Conflict{openConflicts > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Room or faculty double-bookings require administrative resolution to maintain schedule integrity.
              </p>
            </div>
          </div>
          <Link
            to="/conflicts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Resolve Conflicts
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Operational Records"
          value={totalSchedules}
          subtitle={`${approvedSchedules} approved & finalized`}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals}
          subtitle="Awaiting Dean or Admin review"
          icon={FileCheck2}
          color="amber"
          trend={pendingApprovals > 0 ? `${pendingApprovals} action items` : 'All cleared'}
          trendType={pendingApprovals > 0 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Active Conflicts"
          value={openConflicts}
          subtitle="Violations flagged by engine"
          icon={AlertTriangle}
          color="rose"
          trend={openConflicts === 0 ? 'Zero conflicts' : 'Requires review'}
          trendType={openConflicts === 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Active Faculty / Staff"
          value={activeLecturers}
          subtitle={`Across ${branches.length} campus branches`}
          icon={Users2}
          color="emerald"
        />
      </div>

      {/* If Lecturer role, show Personalized Operational Card */}
      {currentRole === 'LECTURER' && (
        <div className="card-enterprise p-6 border-l-4 border-l-brand-blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Assigned Teaching Operations</h3>
              <p className="text-xs text-slate-500">
                {myAssignedLecturer ? `${myAssignedLecturer.specialization} &bull; Max ${myAssignedLecturer.max_hours_per_week}h/week` : 'Lecturer profile'}
              </p>
            </div>
            <Link
              to="/availabilities"
              className="btn-outline"
            >
              Update Availability Matrix
            </Link>
          </div>

          {mySchedules.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No operational schedules assigned to your profile in the current semester.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mySchedules.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-800">{s.courseCode} - {s.courseName}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{s.timeSlotDay} ({s.timeSlotPeriod})</span>
                      <span>&bull;</span>
                      <span>{s.classroomNumber}</span>
                    </div>
                  </div>
                  <StatusBadge status={s.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Operational Status Distribution</h3>
              <p className="text-xs text-slate-500">Current schedule workflow states</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {totalSchedules} Total
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} Schedules`, 'Count']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedules per Campus Bar Chart */}
        <div className="card-enterprise p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Activity Distribution by Campus Branch</h3>
              <p className="text-xs text-slate-500">Operational schedule load across organizational units</p>
            </div>
            <Link to="/branches" className="text-xs font-semibold text-brand-blue hover:underline">
              View Campuses
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Operational Schedules`, 'Count']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="schedules" fill="#17365D" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Operational Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Operational Records */}
        <div className="card-enterprise p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Recent Operational Schedules</h3>
              <p className="text-xs text-slate-500">Latest created and modified timetable records</p>
            </div>
            <Link
              to="/schedules"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-blue-700"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">Course</th>
                  <th className="px-3 py-2.5">Faculty</th>
                  <th className="px-3 py-2.5">Slot / Room</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hydratedSchedules.slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900">{s.courseCode}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{s.courseName}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-800">{s.lecturerName}</div>
                      <div className="text-[10px] text-slate-400">{s.branchCode}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-700">{s.timeSlotDay} ({s.timeSlotPeriod})</div>
                      <div className="text-[10px] text-slate-400">{s.classroomNumber}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        to={`/schedules?id=${s.id}`}
                        className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-brand-blue hover:bg-blue-50 rounded transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations & System Highlights */}
        <div className="space-y-4">
          <div className="card-enterprise p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-3 pb-2 border-b border-slate-100">
              Quick Operations
            </h3>

            <div className="space-y-2">
              <Link
                to="/schedules"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-brand-blue hover:bg-blue-50/30 transition-all text-xs font-semibold text-slate-700 hover:text-brand-navy group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-brand-blue group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span>Create Operational Schedule</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-colors" />
              </Link>

              {(currentRole === 'ADMIN' || currentRole === 'DEAN') && (
                <Link
                  to="/approvals"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-xs font-semibold text-slate-700 hover:text-amber-900 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <span>Review Pending Submissions</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {pendingApprovals}
                  </span>
                </Link>
              )}

              <Link
                to="/conflicts"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-400 hover:bg-rose-50/30 transition-all text-xs font-semibold text-slate-700 hover:text-rose-900 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span>Conflict Validation Engine</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {openConflicts}
                </span>
              </Link>

              <Link
                to="/reports"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-xs font-semibold text-slate-700 hover:text-emerald-900 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Generate Operational Reports</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* System Highlights Card */}
          <div className="card-enterprise p-5 bg-gradient-to-br from-slate-50 to-blue-50/30">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              System Specification
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-semibold text-slate-800">PostgreSQL (BIGINT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Classrooms:</span>
                <span className="font-semibold text-slate-800">{classrooms.length} ({totalCapacity} seats)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Courses:</span>
                <span className="font-semibold text-slate-800">{courses.length} Catalogued</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Future Backend:</span>
                <span className="font-semibold text-brand-navy">Laravel REST API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
