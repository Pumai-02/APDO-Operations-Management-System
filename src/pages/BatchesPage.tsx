import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Batch } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Calendar,
  GraduationCap,
  Users2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const batchSchema = z.object({
  batch_name: z.string().min(3, 'Batch name must be at least 3 characters'),
  batch_code: z.string().min(2, 'Batch code is required (e.g. B2026-MAIN)'),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  branch_id: z.string().min(1, 'Campus branch is required'),
  major_id: z.string().nullable().optional(),
  intake_period: z.string().min(2, 'Intake period is required (e.g. Fall Intake)'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  is_active: z.boolean().default(true),
  description: z.string().optional()
});

type BatchFormData = z.infer<typeof batchSchema>;

export const BatchesPage: React.FC = () => {
  const { currentRole, canEditOperational } = useAuth();
  const {
    batches,
    academicYears,
    branches,
    majors,
    classSections,
    schedules,
    addBatch,
    updateBatch,
    deleteBatch,
    toggleBatchStatus
  } = useOperations();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [inspectingBatch, setInspectingBatch] = useState<Batch | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Batch | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batch_name: '',
      batch_code: '',
      academic_year_id: '2',
      branch_id: '1',
      major_id: '',
      intake_period: 'Fall Intake',
      start_date: '2026-09-01',
      end_date: '2030-06-30',
      is_active: true,
      description: ''
    }
  });

  const selectedFormBranch = watch('branch_id');
  const availableFormMajors = useMemo(() => {
    if (!selectedFormBranch) return majors;
    return majors.filter(m => m.branch_id === selectedFormBranch);
  }, [majors, selectedFormBranch]);

  // Handle open create
  const handleOpenCreate = () => {
    reset({
      batch_name: '',
      batch_code: '',
      academic_year_id: academicYears[0]?.id || '2',
      branch_id: branches[0]?.id || '1',
      major_id: '',
      intake_period: 'Fall Intake',
      start_date: '2026-09-01',
      end_date: '2030-06-30',
      is_active: true,
      description: ''
    });
    setEditingBatch(null);
    setIsModalOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (batch: Batch) => {
    reset({
      batch_name: batch.batch_name,
      batch_code: batch.batch_code,
      academic_year_id: batch.academic_year_id,
      branch_id: batch.branch_id,
      major_id: batch.major_id || '',
      intake_period: batch.intake_period || 'Fall Intake',
      start_date: batch.start_date,
      end_date: batch.end_date,
      is_active: batch.is_active,
      description: batch.description || ''
    });
    setEditingBatch(batch);
    setIsModalOpen(true);
  };

  const onSubmit = (data: BatchFormData) => {
    const payload = {
      ...data,
      major_id: data.major_id && data.major_id !== '' ? data.major_id : null,
      description: data.description || ''
    };

    if (editingBatch) {
      updateBatch(editingBatch.id, payload);
    } else {
      addBatch(payload);
    }
    setIsModalOpen(false);
  };

  // Safe delete handler
  const confirmDelete = () => {
    if (!deleteCandidate) return;
    const res = deleteBatch(deleteCandidate.id);
    if (!res.success) {
      setDeleteError(res.message || 'Cannot delete batch.');
    } else {
      setDeleteCandidate(null);
      setDeleteError(null);
    }
  };

  // Filter batches
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesSearch =
        searchQuery === '' ||
        b.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.batch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = selectedBranch === 'all' || b.branch_id === selectedBranch;
      const matchesYear = selectedYear === 'all' || b.academic_year_id === selectedYear;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && b.is_active) ||
        (selectedStatus === 'inactive' && !b.is_active);

      return matchesSearch && matchesBranch && matchesYear && matchesStatus;
    });
  }, [batches, searchQuery, selectedBranch, selectedYear, selectedStatus]);

  // Stats
  const activeBatchesCount = batches.filter(b => b.is_active).length;
  const totalLinkedSections = classSections.filter(c => !!c.batch_id).length;
  const totalStudentsInBatches = classSections
    .filter(c => !!c.batch_id)
    .reduce((acc, c) => acc + (c.student_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-blue" />
            Academic Batch Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage student intake cohorts, curriculum start-to-graduation lifecycles, and multi-campus allocations.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Batches</span>
            <span className="text-xl font-extrabold text-brand-navy">{batches.length}</span>
          </div>
        </div>

        <div className="card-enterprise p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block">Active Intakes</span>
            <span className="text-xl font-extrabold text-emerald-700">{activeBatchesCount}</span>
          </div>
        </div>

        <div className="card-enterprise p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block">Linked Cohort Sections</span>
            <span className="text-xl font-extrabold text-purple-900">{totalLinkedSections}</span>
          </div>
        </div>

        <div className="card-enterprise p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block">Students Enrolled</span>
            <span className="text-xl font-extrabold text-amber-800">{totalStudentsInBatches}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-enterprise p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="min-w-[220px] flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search batch name, code, description..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          {/* Campus Branch */}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Academic Year */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="all">All Academic Years</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold text-[11px]">
          Showing {filteredBatches.length} of {batches.length} batches
        </div>
      </div>

      {/* Batches Table */}
      <div className="card-enterprise overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Batch Code & Title</th>
                <th className="px-4 py-3.5">Academic Intake Year</th>
                <th className="px-4 py-3.5">Campus Branch & Discipline</th>
                <th className="px-4 py-3.5">Linked Cohort Sections</th>
                <th className="px-4 py-3.5">Intake Schedule</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No academic batches found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBatches.map(b => {
                  const branch = branches.find(br => br.id === b.branch_id);
                  const year = academicYears.find(y => y.id === b.academic_year_id);
                  const major = majors.find(m => m.id === b.major_id);
                  const linkedSections = classSections.filter(cs => cs.batch_id === b.id);
                  const totalStudents = linkedSections.reduce((acc, curr) => acc + curr.student_count, 0);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {b.batch_code}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{b.batch_name}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{b.description}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                          <span>{year?.name || '2026-2027'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{b.intake_period || 'Regular'}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 block">{branch?.name || 'Main Campus'}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {major ? `${major.name} (${major.code})` : 'General / Multi-Program'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue font-bold text-[10px]">
                            {linkedSections.length} Sections
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ({totalStudents} Students)
                          </span>
                        </div>
                        {linkedSections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {linkedSections.slice(0, 2).map(sec => (
                              <span key={sec.id} className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded border">
                                {sec.section_name}
                              </span>
                            ))}
                            {linkedSections.length > 2 && (
                              <span className="text-[9px] text-slate-400">+{linkedSections.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        <div>{b.start_date}</div>
                        <div className="text-slate-400 text-[10px]">to {b.end_date}</div>
                      </td>

                      <td className="px-4 py-3">
                        {canEditOperational ? (
                          <button
                            onClick={() => toggleBatchStatus(b.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                              b.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                            }`}
                            title="Click to toggle active status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${b.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {b.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {b.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Inspect Details */}
                          <button
                            onClick={() => setInspectingBatch(b)}
                            className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Batch Details & Associates"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {canEditOperational && (
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Batch"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {currentRole === 'ADMIN' && (
                            <button
                              onClick={() => {
                                setDeleteCandidate(b);
                                setDeleteError(null);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT BATCH                                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBatch ? `Edit Batch: ${editingBatch.batch_code}` : 'Create Academic Batch'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batch Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch Name *
              </label>
              <input
                type="text"
                {...register('batch_name')}
                placeholder="e.g. Batch 2026 (Freshman Cohort)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {errors.batch_name && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.batch_name.message}</p>
              )}
            </div>

            {/* Batch Code */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch Code (Unique Identifier) *
              </label>
              <input
                type="text"
                {...register('batch_code')}
                placeholder="e.g. B2026-MAIN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
              />
              {errors.batch_code && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.batch_code.message}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Year *
              </label>
              <select
                {...register('academic_year_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
              {errors.academic_year_id && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.academic_year_id.message}</p>
              )}
            </div>

            {/* Campus Branch */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Campus Branch *
              </label>
              <select
                {...register('branch_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.branch_id && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.branch_id.message}</p>
              )}
            </div>

            {/* Degree Major (Optional) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Major / Program Discipline (Optional)
              </label>
              <select
                {...register('major_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="">General / All Disciplines</option>
                {availableFormMajors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Intake Period */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Intake Period *
              </label>
              <input
                type="text"
                {...register('intake_period')}
                placeholder="e.g. Fall Intake, Spring Intake"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {errors.intake_period && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.intake_period.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Curriculum Start Date *
              </label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono"
              />
              {errors.start_date && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.start_date.message}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expected Completion Date *
              </label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono"
              />
              {errors.end_date && (
                <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Operational Notes
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Provide intake scope, curriculum guidelines, or department notes..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
            />
            <label htmlFor="is_active" className="font-semibold text-slate-700">
              Active Batch (Available for operational scheduling and cohort enrolment)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingBatch ? 'Save Changes' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: BATCH DETAILS & ASSOCIATED COHORTS / SCHEDULES                     */}
      {/* ========================================================================= */}
      {inspectingBatch && (
        <Modal
          isOpen={!!inspectingBatch}
          onClose={() => setInspectingBatch(null)}
          title={`Batch Details: ${inspectingBatch.batch_name}`}
          maxWidth="2xl"
        >
          {(() => {
            const branch = branches.find(b => b.id === inspectingBatch.branch_id);
            const year = academicYears.find(y => y.id === inspectingBatch.academic_year_id);
            const major = majors.find(m => m.id === inspectingBatch.major_id);
            const linkedSections = classSections.filter(cs => cs.batch_id === inspectingBatch.id);
            const linkedSchedules = schedules.filter(s => s.batch_id === inspectingBatch.id);

            return (
              <div className="space-y-5 text-xs">
                {/* Meta Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch Code</span>
                    <span className="font-mono font-bold text-brand-navy">{inspectingBatch.batch_code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Year</span>
                    <span className="font-bold text-slate-800">{year?.name || '2026-2027'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus Branch</span>
                    <span className="font-bold text-slate-800">{branch?.name || 'Main Campus'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Program Major</span>
                    <span className="font-bold text-slate-800">{major?.name || 'All Programs'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Intake Period</span>
                    <span className="font-medium text-slate-700">{inspectingBatch.intake_period}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                    <span className={`font-bold ${inspectingBatch.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {inspectingBatch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Curriculum Start</span>
                    <span className="font-mono text-slate-700">{inspectingBatch.start_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected End</span>
                    <span className="font-mono text-slate-700">{inspectingBatch.end_date}</span>
                  </div>
                </div>

                {/* Description */}
                {inspectingBatch.description && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-slate-700">
                    <span className="font-bold text-brand-navy block mb-0.5">Description:</span>
                    <p>{inspectingBatch.description}</p>
                  </div>
                )}

                {/* Linked Cohort Class Sections */}
                <div>
                  <h4 className="font-bold text-brand-navy text-sm flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-brand-blue" />
                      Associated Cohort Class Sections ({linkedSections.length})
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {linkedSections.reduce((acc, curr) => acc + curr.student_count, 0)} total students
                    </span>
                  </h4>

                  {linkedSections.length === 0 ? (
                    <p className="text-slate-400 italic p-3 bg-slate-50 rounded-lg text-center">
                      No cohort class sections are currently assigned to this batch.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {linkedSections.map(sec => (
                        <div key={sec.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{sec.section_name}</span>
                            <span className="text-[10px] text-slate-500">Year Level {sec.year_level} &bull; {sec.display_name}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                            {sec.student_count} Students
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Linked Operational Schedules */}
                <div>
                  <h4 className="font-bold text-brand-navy text-sm flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    Operational Schedules Linked ({linkedSchedules.length})
                  </h4>

                  {linkedSchedules.length === 0 ? (
                    <p className="text-slate-400 italic p-3 bg-slate-50 rounded-lg text-center">
                      No operational timetable sessions currently linked directly to this batch.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {linkedSchedules.map(sched => (
                        <div key={sched.id} className="p-2 rounded border border-slate-200 bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-blue">SCH-{sched.id}</span>
                            <span className="text-slate-700">Date: {sched.scheduled_date}</span>
                          </div>
                          <StatusBadge status={sched.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setInspectingBatch(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOG: DELETE BATCH                                         */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <ConfirmationDialog
          isOpen={!!deleteCandidate}
          onClose={() => {
            setDeleteCandidate(null);
            setDeleteError(null);
          }}
          onConfirm={confirmDelete}
          title={`Delete Batch: ${deleteCandidate.batch_code}`}
          message={
            deleteError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            ) : (
              `Are you sure you want to delete batch "${deleteCandidate.batch_name}" (${deleteCandidate.batch_code})? This action cannot be undone.`
            )
          }
          confirmLabel={deleteError ? 'Dismiss' : 'Delete Batch'}
          variant="danger"
        />
      )}
    </div>
  );
};
