import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Major } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { GraduationCap, Plus, Edit, Trash2, Building2, BookOpen, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const majorSchema = z.object({
  branch_id: z.string().min(1, 'Branch campus is required'),
  name: z.string().min(2, 'Major program name is required'),
  code: z.string().min(2, 'Program code is required'),
  description: z.string().min(5, 'Description is required'),
  is_active: z.boolean().default(true)
});

type MajorFormData = z.infer<typeof majorSchema>;

export const MajorsPage: React.FC = () => {
  const { canEditOperational } = useAuth();
  const { majors, branches, addMajor, updateMajor, deleteMajor, classSections, courseMajors } = useOperations();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MajorFormData>({
    resolver: zodResolver(majorSchema),
    defaultValues: {
      branch_id: '1',
      name: '',
      code: '',
      description: '',
      is_active: true
    }
  });

  const handleOpenCreate = () => {
    reset({
      branch_id: branches[0]?.id || '1',
      name: '',
      code: '',
      description: '',
      is_active: true
    });
    setEditingMajor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (major: Major) => {
    reset({
      branch_id: major.branch_id,
      name: major.name,
      code: major.code,
      description: major.description,
      is_active: major.is_active
    });
    setEditingMajor(major);
    setIsModalOpen(true);
  };

  const onSubmit = (data: MajorFormData) => {
    if (editingMajor) {
      updateMajor(editingMajor.id, data);
    } else {
      addMajor(data);
    }
    setIsModalOpen(false);
  };

  const filteredMajors = majors.filter(m =>
    selectedBranch === 'all' || m.branch_id === selectedBranch
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-blue" />
            Academic Majors & Degree Programs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Departmental degree disciplines linked to campuses and curricula.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Major Program</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Filter by Campus:</span>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="all">All Campuses ({branches.length})</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <span className="text-slate-500">{filteredMajors.length} Programs</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMajors.map(major => {
          const branch = branches.find(b => b.id === major.branch_id);
          const sectionsCount = classSections.filter(s => s.major_id === major.id).length;
          const coursesCount = courseMajors.filter(cm => cm.major_id === major.id).length;

          return (
            <div key={major.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                      {major.code}
                    </span>
                    <h3 className="text-base font-bold text-brand-navy mt-2">{major.name}</h3>
                  </div>
                  <StatusBadge status={major.is_active} size="sm" />
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch?.name || 'Branch Campus'}</span>
                  </div>
                  <p className="text-slate-500 line-clamp-2 leading-relaxed">
                    {major.description}
                  </p>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cohorts</span>
                      <span className="text-sm font-extrabold text-slate-800">{sectionsCount} Sections</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Curriculum</span>
                      <span className="text-sm font-extrabold text-slate-800">{coursesCount} Courses</span>
                    </div>
                  </div>
                </div>
              </div>

              {canEditOperational && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(major)}
                    className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                    title="Edit Major"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(major.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Major"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMajor ? `Edit Major: ${editingMajor.name}` : 'Add Academic Major Program'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
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
            <label className="block font-semibold text-slate-700 mb-1">Major Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Software Architecture & Distributed Engineering"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Program Code *</label>
            <input
              type="text"
              {...register('code')}
              placeholder="e.g. SE"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 uppercase"
            />
            {errors.code && <p className="text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Program curriculum scope and learning objectives..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.description && <p className="text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_major"
              {...register('is_active')}
              className="rounded text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="is_active_major" className="font-semibold text-slate-700">
              Active Degree Program
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingMajor ? 'Save Changes' : 'Create Major'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMajor(deleteId);
        }}
        title="Delete Degree Program?"
        message="This will remove the major program and its curriculum associations."
      />
    </div>
  );
};
