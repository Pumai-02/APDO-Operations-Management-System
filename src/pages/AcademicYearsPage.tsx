import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { AcademicYear } from '../types/database';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Layers,
  CalendarCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const academicYearSchema = z.object({
  name: z.string().min(2, 'Academic year name is required (e.g. 2026–2027)'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  is_active: z.boolean().default(false),
  description: z.string().optional()
}).refine((data) => {
  if (!data.start_date || !data.end_date) return true;
  return new Date(data.end_date) > new Date(data.start_date);
}, {
  message: 'End date must be strictly after start date.',
  path: ['end_date']
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;

export const AcademicYearsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const isAdmin = currentRole === 'ADMIN';

  const {
    academicYears,
    schedules,
    batches,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    toggleAcademicYearStatus,
    setActiveAcademicYear
  } = useOperations();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [inspectingYear, setInspectingYear] = useState<AcademicYear | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion modal state
  const [deleteCandidate, setDeleteCandidate] = useState<AcademicYear | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Status Change Confirmation
  const [statusCandidate, setStatusCandidate] = useState<AcademicYear | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: '',
      start_date: '2026-09-01',
      end_date: '2027-08-31',
      is_active: false,
      description: ''
    }
  });

  // Current active year
  const activeYear = useMemo(() => {
    return academicYears.find(y => y.is_active);
  }, [academicYears]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormError(null);
    setEditingYear(null);
    reset({
      name: '',
      start_date: '2026-09-01',
      end_date: '2027-08-31',
      is_active: academicYears.length === 0,
      description: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (year: AcademicYear) => {
    setFormError(null);
    setEditingYear(year);
    reset({
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date,
      is_active: year.is_active,
      description: year.description || ''
    });
    setIsModalOpen(true);
  };

  // Form Submit
  const onSubmit = (data: AcademicYearFormData) => {
    setFormError(null);
    if (!isAdmin) {
      setFormError('Only authorized administrators can modify academic years.');
      return;
    }

    if (editingYear) {
      const res = updateAcademicYear(editingYear.id, {
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        description: data.description || ''
      });
      if (!res.success) {
        setFormError(res.message || 'Failed to update academic year.');
        return;
      }
    } else {
      const res = addAcademicYear({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        description: data.description || ''
      });
      if (!res.success) {
        setFormError(res.message || 'Failed to create academic year.');
        return;
      }
    }
    setIsModalOpen(false);
  };

  // Safe delete handler
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    if (!isAdmin) {
      setDeleteError('Only administrators are authorized to delete academic years.');
      return;
    }
    const res = deleteAcademicYear(deleteCandidate.id);
    if (!res.success) {
      setDeleteError(res.message || 'Cannot delete academic year.');
    } else {
      setDeleteCandidate(null);
      setDeleteError(null);
    }
  };

  // Status toggle handler
  const handleConfirmStatusChange = () => {
    if (!statusCandidate) return;
    if (!isAdmin) return;
    if (!statusCandidate.is_active) {
      setActiveAcademicYear(statusCandidate.id);
    } else {
      toggleAcademicYearStatus(statusCandidate.id);
    }
    setStatusCandidate(null);
  };

  // Filtered academic years
  const filteredYears = useMemo(() => {
    return academicYears.filter(y => {
      const matchesSearch =
        searchQuery === '' ||
        y.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (y.description && y.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && y.is_active) ||
        (statusFilter === 'inactive' && !y.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [academicYears, searchQuery, statusFilter]);

  // Statistics
  const totalYearsCount = academicYears.length;
  const activeSchedulesCount = schedules.filter(s => {
    const yrId = s.academic_year_id;
    return yrId && yrId === activeYear?.id;
  }).length;
  const totalSchedulesCount = schedules.length;
  const totalBatchesCount = batches.length;

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-blue" />
            Academic Year Management
          </h2>
          <p className="text-xs text-brand-gray mt-0.5">
            Configure academic calendar cycles, manage active operational years, and safeguard historical schedules & approval records.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            id="create-academic-year-btn"
            className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Academic Year
          </button>
        )}
      </div>

      {/* Primary Active Year Banner */}
      {activeYear ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Current Active Academic Cycle
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operational
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Academic Year {activeYear.name}
              </h3>
              <p className="text-xs text-gray-600">
                Period: <span className="font-medium text-gray-800">{new Date(activeYear.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span> – <span className="font-medium text-gray-800">{new Date(activeYear.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {activeYear.description && (
                  <span className="ml-2 text-gray-500 italic">“{activeYear.description}”</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-emerald-200 shrink-0">
            <div className="text-center">
              <span className="text-xs text-gray-500 block">Schedules</span>
              <span className="text-base font-bold text-emerald-700">{activeSchedulesCount}</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <span className="text-xs text-gray-500 block">Batches</span>
              <span className="text-base font-bold text-gray-800">
                {batches.filter(b => b.academic_year_id === activeYear.id).length}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <div className="text-xs">
            <p className="font-bold">No Academic Year is Currently Active</p>
            <p>Please activate an academic year so schedule creation and operations can proceed under standard workflows.</p>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Year</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-gray-900 truncate">
              {activeYear ? activeYear.name : 'None'}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Primary operational cycle
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Academic Years</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-gray-900">{totalYearsCount}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Historical & planned cycles
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Timetable Schedules</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-gray-900">{totalSchedulesCount}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Preserved across all cycles
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Cohort Batches</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-gray-900">{totalBatchesCount}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Student cohort batches
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search academic year name or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
          >
            <option value="all">All Statuses ({academicYears.length})</option>
            <option value="active">Active Only ({academicYears.filter(y => y.is_active).length})</option>
            <option value="inactive">Inactive ({academicYears.filter(y => !y.is_active).length})</option>
          </select>
        </div>
      </div>

      {/* Academic Years Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Academic Year Name</th>
                <th className="py-3 px-4">Calendar Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Linked Records</th>
                <th className="py-3 px-4">Description / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredYears.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-1" />
                    No academic years match your current filters.
                  </td>
                </tr>
              ) : (
                filteredYears.map(year => {
                  const linkedSchedules = schedules.filter(s => s.academic_year_id === year.id);
                  const linkedBatches = batches.filter(b => b.academic_year_id === year.id);
                  const isCurrentActive = year.is_active;

                  return (
                    <tr
                      key={year.id}
                      className={`hover:bg-gray-50/80 transition-colors ${isCurrentActive ? 'bg-emerald-50/20' : ''}`}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isCurrentActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {year.name}
                              {isCurrentActive && (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                                  CURRENT ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">ID #{year.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-800 font-medium">
                          {new Date(year.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' '}–{' '}
                          {new Date(year.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {Math.round((new Date(year.end_date).getTime() - new Date(year.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30.4))} months duration
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <XCircle className="w-3 h-3 text-gray-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Linked Records */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100" title={`${linkedSchedules.length} schedules in this year`}>
                            <Layers className="w-3 h-3" />
                            {linkedSchedules.length} Schedules
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100" title={`${linkedBatches.length} batches in this year`}>
                            <BookOpen className="w-3 h-3" />
                            {linkedBatches.length} Batches
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4">
                        <span className="text-gray-600 line-clamp-1 max-w-xs text-xs">
                          {year.description || <span className="text-gray-400 italic">No notes</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Set Active Action */}
                          {isAdmin && !isCurrentActive && (
                            <button
                              onClick={() => setStatusCandidate(year)}
                              title="Set as Current Active Academic Year"
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-all cursor-pointer"
                            >
                              Set Active
                            </button>
                          )}

                          {/* Edit Action */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEdit(year)}
                              title="Edit Academic Year"
                              className="p-1.5 text-gray-500 hover:text-brand-blue hover:bg-gray-100 rounded transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Action */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteCandidate(year);
                              }}
                              title="Delete Academic Year"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety & Preservation Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">Historical Schedule Integrity & Data Preservation Guarantee</p>
          <p>
            When a new academic year cycle is created or activated, all previous academic schedules, official administrator stamps, and department Dean digital signatures remain intact and accessible for audits and historical reporting. Previous academic year records will not be overwritten.
          </p>
        </div>
      </div>

      {/* Modal: Create / Edit Academic Year */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingYear ? `Edit Academic Year: ${editingYear.name}` : 'Create Academic Year'}
        description="Specify calendar duration, active operational status, and descriptive notes."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Academic Year Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Academic Year Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 2026–2027 or 2027–2028"
              {...register('name')}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">
              Unique name representing the academic cycle. Duplicate names will be rejected.
            </p>
          </div>

          {/* Date Range: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
              {errors.start_date && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
              {errors.end_date && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue/30 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Set as Active Academic Year
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Designating this academic year as active will automatically set it as the primary cycle for new schedules.
                </span>
              </div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Optional notes regarding this academic cycle, term configurations, or university senate directives..."
              {...register('description')}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-blue hover:bg-blue-600 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              {editingYear ? 'Save Changes' : 'Create Academic Year'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Set Active Year */}
      <ConfirmationDialog
        isOpen={!!statusCandidate}
        title={`Activate Academic Year: ${statusCandidate?.name}`}
        message={`Are you sure you want to activate "${statusCandidate?.name}"? It will become the primary operational academic year for schedule creation and timetabling.`}
        confirmLabel="Activate Academic Year"
        variant="primary"
        onConfirm={handleConfirmStatusChange}
        onClose={() => setStatusCandidate(null)}
      />

      {/* Confirmation Dialog: Delete Academic Year */}
      <ConfirmationDialog
        isOpen={!!deleteCandidate}
        title={`Delete Academic Year: ${deleteCandidate?.name}`}
        message={
          deleteError
            ? deleteError
            : `Are you sure you want to delete "${deleteCandidate?.name}"? Academic years referenced by historical schedules or cohort batches cannot be deleted.`
        }
        confirmLabel="Delete Academic Year"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteCandidate(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
};
