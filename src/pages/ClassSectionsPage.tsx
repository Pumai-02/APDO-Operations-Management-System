import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { ClassSection } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { Users2, Plus, Edit, Trash2, Building2, GraduationCap, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const sectionSchema = z.object({
  branch_id: z.string().min(1, 'Campus is required'),
  major_id: z.string().min(1, 'Major is required'),
  semester_id: z.string().min(1, 'Semester is required'),
  batch_id: z.string().optional(),
  year_level: z.coerce.number().min(1).max(8),
  section_name: z.string().min(1, 'Section name is required'),
  display_name: z.string().optional(),
  student_count: z.coerce.number().min(1, 'Student headcount must be at least 1'),
  is_active: z.boolean().default(true)
});

type SectionFormData = z.infer<typeof sectionSchema>;

export const ClassSectionsPage: React.FC = () => {
  const { canEditOperational } = useAuth();
  const {
    classSections,
    branches,
    majors,
    semesters,
    batches,
    addClassSection,
    updateClassSection,
    deleteClassSection
  } = useOperations();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ClassSection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      branch_id: '1',
      major_id: '1',
      semester_id: '1',
      year_level: 2,
      section_name: '',
      display_name: '',
      student_count: 35,
      is_active: true
    }
  });

  const watchBranchId = watch('branch_id');
  const availableMajors = majors.filter(m => m.branch_id === watchBranchId);

  const handleOpenCreate = () => {
    reset({
      branch_id: branches[0]?.id || '1',
      major_id: majors[0]?.id || '1',
      semester_id: '1',
      batch_id: batches[0]?.id || '',
      year_level: 2,
      section_name: '',
      display_name: '',
      student_count: 35,
      is_active: true
    });
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec: ClassSection) => {
    reset({
      branch_id: sec.branch_id,
      major_id: sec.major_id,
      semester_id: sec.semester_id,
      batch_id: sec.batch_id || '',
      year_level: sec.year_level,
      section_name: sec.section_name,
      display_name: sec.display_name || '',
      student_count: sec.student_count,
      is_active: sec.is_active
    });
    setEditingSection(sec);
    setIsModalOpen(true);
  };

  const onSubmit = (data: SectionFormData) => {
    const formattedDisplay = data.display_name || `${data.section_name} (Year ${data.year_level})`;
    if (editingSection) {
      updateClassSection(editingSection.id, {
        ...data,
        display_name: formattedDisplay
      });
    } else {
      addClassSection({
        ...data,
        display_name: formattedDisplay
      });
    }
    setIsModalOpen(false);
  };

  const filteredSections = classSections.filter(s => {
    if (selectedBranch !== 'all' && s.branch_id !== selectedBranch) return false;
    if (selectedMajor !== 'all' && s.major_id !== selectedMajor) return false;
    if (selectedBatch !== 'all' && s.batch_id !== selectedBatch) return false;
    return true;
  });

  const totalHeadcount = filteredSections.reduce((acc, s) => acc + s.student_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Users2 className="w-5 h-5 text-brand-blue" />
            Cohort Class Sections
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Student cohort groups by branch, academic major, and study year level.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Create Section</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Campus:</span>
            <select
              value={selectedBranch}
              onChange={e => {
                setSelectedBranch(e.target.value);
                setSelectedMajor('all');
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Campuses</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Major:</span>
            <select
              value={selectedMajor}
              onChange={e => setSelectedMajor(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Majors</option>
              {majors.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Batch:</span>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.batch_code} - {b.batch_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500">
          Showing <strong>{filteredSections.length}</strong> cohorts ({totalHeadcount} enrolled students)
        </div>
      </div>

      {/* Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Section Code</th>
                <th className="px-4 py-3">Full Display Name</th>
                <th className="px-4 py-3">Major & Branch</th>
                <th className="px-4 py-3">Year Level</th>
                <th className="px-4 py-3">Student Enrolment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSections.map(sec => {
                const branch = branches.find(b => b.id === sec.branch_id);
                const major = majors.find(m => m.id === sec.major_id);
                const batch = batches.find(b => b.id === sec.batch_id);

                return (
                  <tr key={sec.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-brand-navy">
                      <div>{sec.section_name}</div>
                      {batch && (
                        <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200 mt-0.5 inline-block font-sans font-semibold">
                          {batch.batch_code}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {sec.display_name || sec.section_name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{major?.name || 'Major'}</div>
                      <div className="text-[10px] text-slate-400">{branch?.name}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      Year {sec.year_level}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-brand-blue font-bold">
                        <Users className="w-3 h-3" />
                        {sec.student_count} Students
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sec.is_active} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canEditOperational && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sec)}
                            className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                            title="Edit Section"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(sec.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? `Edit Section: ${editingSection.section_name}` : 'Create Cohort Section'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Branch *</label>
              <select
                {...register('branch_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Major Discipline *</label>
              <select
                {...register('major_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {availableMajors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Associated Academic Batch</label>
            <select
              {...register('batch_id')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="">None / Independent Cohort</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batch_code} &bull; {b.batch_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section Identifier *</label>
              <input
                type="text"
                {...register('section_name')}
                placeholder="e.g. CS-Y2-SecC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono"
              />
              {errors.section_name && <p className="text-red-500 mt-1">{errors.section_name.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year Level (1-8) *</label>
              <input
                type="number"
                min={1}
                max={8}
                {...register('year_level')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Headcount *</label>
              <input
                type="number"
                min={1}
                {...register('student_count')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {errors.student_count && <p className="text-red-500 mt-1">{errors.student_count.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                {...register('semester_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Descriptive Name</label>
            <input
              type="text"
              {...register('display_name')}
              placeholder="e.g. Computer Science Year 2 Section C"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_section"
              {...register('is_active')}
              className="rounded text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="is_active_section" className="font-semibold text-slate-700">
              Active Operational Cohort
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingSection ? 'Save Changes' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteClassSection(deleteId);
        }}
        title="Delete Cohort Section?"
        message="This will remove the cohort section. Any linked schedules will be dissociated."
      />
    </div>
  );
};
