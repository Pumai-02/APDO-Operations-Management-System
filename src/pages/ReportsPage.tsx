import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building,
  Building2,
  Users2,
  DoorOpen,
  FileCheck2,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const {
    hydratedSchedules,
    academicYears,
    lecturers,
    classrooms,
    branches,
    departments,
    courses,
    approvalHistory
  } = useOperations();

  const userDeanDept = useMemo(() => {
    return departments.find(d => d.dean_user_id === currentUser.id);
  }, [departments, currentUser]);

  const [activeReport, setActiveReport] = useState<'summary' | 'faculty' | 'facilities' | 'approvals'>('summary');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    if (currentRole === 'DEAN' && userDeanDept) return userDeanDept.id;
    return 'all';
  });

  // Filtered schedules for reports
  const reportSchedules = hydratedSchedules.filter(s => {
    // 1. Role-based Department Access
    if (currentRole === 'DEAN' && userDeanDept) {
      if (s.departmentId !== userDeanDept.id && s.department_id !== userDeanDept.id) return false;
    } else if (selectedDepartment !== 'all') {
      if (s.departmentId !== selectedDepartment && s.department_id !== selectedDepartment) return false;
    }

    if (selectedYear !== 'all') {
      const sYear = s.academic_year_id || s.academicYearId;
      if (sYear && sYear !== selectedYear) return false;
    }
    if (selectedBranch !== 'all' && s.branch_id !== selectedBranch) return false;
    return true;
  });

  // 1. Faculty workload metrics
  const facultyWorkloadData = lecturers.map(l => {
    const assigned = reportSchedules.filter(s => s.lecturer_id === l.id && s.status !== 'REJECTED');
    const assignedHours = assigned.length * 3.5;
    return {
      name: l.name.split(' ').pop() || l.name,
      fullName: l.name,
      code: l.lecturer_code,
      assignedHours,
      maxHours: l.max_hours_per_week,
      utilization: Math.round((assignedHours / l.max_hours_per_week) * 100)
    };
  });

  // 2. Classroom utilization metrics
  const classroomData = classrooms
    .filter(c => selectedBranch === 'all' || c.branch_id === selectedBranch)
    .map(c => {
      const bookings = reportSchedules.filter(s => s.classroom_id === c.id && s.status !== 'REJECTED').length;
      return {
        room: c.room_number,
        type: c.room_type,
        capacity: c.capacity,
        bookings,
        utilizationRate: Math.round((bookings / 15) * 100) // approx out of 15 available weekly slots
      };
    });

  // 3. Status summary data
  const statusCounts = {
    APPROVED: reportSchedules.filter(s => s.status === 'APPROVED').length,
    UNDER_REVIEW: reportSchedules.filter(s => s.status === 'UNDER_REVIEW').length,
    SUBMITTED: reportSchedules.filter(s => s.status === 'SUBMITTED').length,
    DRAFT: reportSchedules.filter(s => s.status === 'DRAFT').length,
    REJECTED: reportSchedules.filter(s => s.status === 'REJECTED').length
  };

  const statusPieData = [
    { name: 'Approved', value: statusCounts.APPROVED, color: '#10B981' },
    { name: 'Under Review', value: statusCounts.UNDER_REVIEW, color: '#F59E0B' },
    { name: 'Submitted', value: statusCounts.SUBMITTED, color: '#2563EB' },
    { name: 'Draft', value: statusCounts.DRAFT, color: '#94A3B8' },
    { name: 'Rejected', value: statusCounts.REJECTED, color: '#EF4444' }
  ].filter(d => d.value > 0);

  // CSV Export utility
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeReport === 'summary') {
      csvContent += 'Schedule ID,Academic Year,Course Code,Course Name,Faculty,Classroom,Campus,Time Slot,Status\n';
      reportSchedules.forEach(s => {
        csvContent += `"${s.id}","${s.academicYearName || '2026–2027'}","${s.courseCode}","${s.courseName}","${s.lecturerName}","${s.classroomNumber}","${s.branchName}","${s.timeSlotDay} ${s.timeSlotPeriod}","${s.status}"\n`;
      });
    } else if (activeReport === 'faculty') {
      csvContent += 'Faculty Code,Name,Assigned Hours,Max Hours Quota,Utilization %\n';
      facultyWorkloadData.forEach(f => {
        csvContent += `"${f.code}","${f.fullName}",${f.assignedHours},${f.maxHours},${f.utilization}%\n`;
      });
    } else if (activeReport === 'facilities') {
      csvContent += 'Room Number,Type,Capacity,Weekly Bookings,Estimated Utilization %\n';
      classroomData.forEach(c => {
        csvContent += `"${c.room}","${c.type}",${c.capacity},${c.bookings},${c.utilizationRate}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apdo_${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-blue" />
            Operational Reports & Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven analytics, faculty teaching quotas, and classroom utilization exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary gap-1.5 text-xs py-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>

          <button
            onClick={exportToCSV}
            className="btn-primary gap-1.5 text-xs py-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs & Filter */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveReport('summary')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeReport === 'summary' ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Operational Summary
          </button>
          <button
            onClick={() => setActiveReport('faculty')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeReport === 'faculty' ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Faculty Workload
          </button>
          <button
            onClick={() => setActiveReport('facilities')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeReport === 'facilities' ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Facility Utilization
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Department:</span>
            </span>
            <select
              value={currentRole === 'DEAN' && userDeanDept ? userDeanDept.id : selectedDepartment}
              disabled={currentRole === 'DEAN'}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium disabled:opacity-85 disabled:bg-slate-100"
            >
              {currentRole !== 'DEAN' && <option value="all">All Departments ({departments.length})</option>}
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name} {currentRole === 'DEAN' && userDeanDept?.id === d.id ? '★ (Assigned)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Academic Year:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              <option value="all">All Academic Years</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name} {y.is_active ? '(Active)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Scope Campus:</span>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              <option value="all">All Campuses</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT: SUMMARY */}
      {activeReport === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-enterprise p-5">
              <h3 className="text-sm font-bold text-brand-navy mb-4 pb-2 border-b border-slate-100">
                Workflow Breakdown
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-enterprise p-5 md:col-span-2">
              <h3 className="text-sm font-bold text-brand-navy mb-4 pb-2 border-b border-slate-100">
                Key Performance Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Sessions</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{reportSchedules.length}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">Approval Rate</span>
                  <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                    {reportSchedules.length > 0 ? `${Math.round((statusCounts.APPROVED / reportSchedules.length) * 100)}%` : '0%'}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-700">In Review</span>
                  <div className="text-2xl font-extrabold text-brand-blue mt-1">
                    {statusCounts.SUBMITTED + statusCounts.UNDER_REVIEW}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700">Rejections</span>
                  <div className="text-2xl font-extrabold text-rose-800 mt-1">{statusCounts.REJECTED}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-enterprise p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-3">Operational Record Dataset</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2.5">ID</th>
                    <th className="px-3 py-2.5">Course</th>
                    <th className="px-3 py-2.5">Faculty</th>
                    <th className="px-3 py-2.5">Classroom</th>
                    <th className="px-3 py-2.5">Slot</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportSchedules.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono font-bold">#{s.id}</td>
                      <td className="px-3 py-2.5 font-medium">{s.courseCode} - {s.courseName}</td>
                      <td className="px-3 py-2.5">{s.lecturerName}</td>
                      <td className="px-3 py-2.5">{s.classroomNumber}</td>
                      <td className="px-3 py-2.5">{s.timeSlotDay} ({s.timeSlotPeriod})</td>
                      <td className="px-3 py-2.5 font-semibold">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: FACULTY */}
      {activeReport === 'faculty' && (
        <div className="space-y-6">
          <div className="card-enterprise p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-4 pb-2 border-b border-slate-100">
              Teaching Hours Allocation (Assigned vs Max Capacity)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="assignedHours" name="Assigned Teaching Hours" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxHours" name="Max Quota (Hours/Wk)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-enterprise overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Faculty Member</th>
                  <th className="px-4 py-3">Assigned Hours</th>
                  <th className="px-4 py-3">Max Weekly Quota</th>
                  <th className="px-4 py-3">Quota Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyWorkloadData.map(f => (
                  <tr key={f.code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold">{f.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{f.fullName}</td>
                    <td className="px-4 py-3 font-bold text-brand-blue">{f.assignedHours} Hours</td>
                    <td className="px-4 py-3 text-slate-600">{f.maxHours} Hours</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        f.utilization > 100 ? 'bg-rose-100 text-rose-800' :
                        f.utilization >= 75 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {f.utilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: FACILITIES */}
      {activeReport === 'facilities' && (
        <div className="space-y-6">
          <div className="card-enterprise p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-4 pb-2 border-b border-slate-100">
              Classroom & Facility Session Frequency
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classroomData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="room" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="bookings" name="Weekly Scheduled Sessions" fill="#17365D" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-enterprise overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Weekly Bookings</th>
                  <th className="px-4 py-3">Occupancy Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classroomData.map(c => (
                  <tr key={c.room} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-brand-navy">{c.room}</td>
                    <td className="px-4 py-3">{c.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3">{c.capacity} Seats</td>
                    <td className="px-4 py-3 font-bold text-brand-blue">{c.bookings} Bookings</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {c.utilizationRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
