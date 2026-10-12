import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Lecturer, EmploymentStatus } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { UserCheck, Plus, Edit, Trash2, Mail, Phone, Clock, Award, Building, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const lecturerSchema = z.object({
  lecturer_code: z.string().min(2, 'Lecturer code is required'),
  name: z.string().min(3, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  specialization: z.string().min(3, 'Specialization is required'),
  max_hours_per_week: z.coerce.number().min(5).max(40),
  employment_status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
  is_active: z.boolean().default(true)
});

type LecturerFormData = z.infer<typeof lecturerSchema>;

export const LecturersPage: React.FC = () => {
  const { canEditOperational } = useAuth();
  const {
    lecturers,
    addLecturer,
    updateLecturer,
    deleteLecturer,
    schedules,
    lecturerBranches,
    branches,
    lecturerCourses,
    courses
  } = useOperations();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LecturerFormData>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      lecturer_code: '',
      name: '',
      email: '',
      phone: '',
      specialization: '',
      max_hours_per_week: 20,
      employment_status: 'ACTIVE',
      is_active: true
    }
  });

  const handleOpenCreate = () => {
    reset({
      lecturer_code: `LEC-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      phone: '',
      specialization: '',
      max_hours_per_week: 20,
      employment_status: 'ACTIVE',
      is_active: true
    });
    setEditingLecturer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lec: Lecturer) => {
    reset({
      lecturer_code: lec.lecturer_code,
      name: lec.name,
      email: lec.email,
      phone: lec.phone,
      specialization: lec.specialization,
      max_hours_per_week: lec.max_hours_per_week,
      employment_status: lec.employment_status,
      is_active: lec.is_active
    });
    setEditingLecturer(lec);
    setIsModalOpen(true);
  };

  const onSubmit = (data: LecturerFormData) => {
    if (editingLecturer) {
      updateLecturer(editingLecturer.id, data);
    } else {
      addLecturer({
        ...data,
        user_id: null
      });
    }
    setIsModalOpen(false);
  };

  const filteredLecturers = lecturers.filter(l => {
    if (selectedStatus !== 'all' && l.employment_status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.lecturer_code.toLowerCase().includes(q) ||
        l.specialization.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-blue" />
            Faculty & Academic Personnel
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Faculty directory, teaching quotas, academic qualifications, and campus allocations.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search faculty name, code, specialization..."
            className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Employment:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-medium">
          Showing <strong>{filteredLecturers.length}</strong> of {lecturers.length} faculty personnel
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLecturers.map(lec => {
          const assignedSchedules = schedules.filter(s => s.lecturer_id === lec.id && s.status !== 'REJECTED');
          const totalTeachingHours = (assignedSchedules.length * 3.5); // ~3.5h per schedule session
          const branchLinks = lecturerBranches
            .filter((lb: any) => lb.lecturer_id === lec.id)
            .map((lb: any) => branches.find(b => b.id === lb.branch_id))
            .filter(Boolean);

          return (
            <div key={lec.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-navy font-black flex items-center justify-center text-sm border border-blue-200">
                      {lec.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {lec.lecturer_code}
                      </span>
                      <h3 className="text-sm font-bold text-brand-navy leading-snug">{lec.name}</h3>
                    </div>
                  </div>
                  <StatusBadge status={lec.employment_status} size="sm" />
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Specialization:</span>
                    <span className="font-semibold text-slate-800">{lec.specialization}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lec.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lec.phone}</span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Workload Allocation:</span>
                      <span className="font-bold text-slate-800">
                        {totalTeachingHours}h / {lec.max_hours_per_week}h max
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          totalTeachingHours > lec.max_hours_per_week ? 'bg-rose-500' : 'bg-brand-blue'
                        }`}
                        style={{ width: `${Math.min(100, (totalTeachingHours / lec.max_hours_per_week) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {branchLinks.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Assigned Campuses:</span>
                      <div className="flex flex-wrap gap-1">
                        {branchLinks.map((b: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-brand-blue text-[10px] font-medium border border-blue-100">
                            {b?.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {canEditOperational && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(lec)}
                    className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                    title="Edit Faculty Member"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(lec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Faculty Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLecturer ? `Edit Faculty: ${editingLecturer.name}` : 'Add Faculty Member'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Code *</label>
              <input
                type="text"
                {...register('lecturer_code')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
              />
              {errors.lecturer_code && <p className="text-red-500 mt-1">{errors.lecturer_code.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Hours / Week *</label>
              <input
                type="number"
                min={5}
                max={40}
                {...register('max_hours_per_week')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Dr. Alexander Chen"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                {...register('email')}
                placeholder="faculty@apdo.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {errors.phone && <p className="text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Specialization *</label>
            <input
              type="text"
              {...register('specialization')}
              placeholder="e.g. Distributed Database Systems & Algorithms"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.specialization && <p className="text-red-500 mt-1">{errors.specialization.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employment Status *</label>
            <select
              {...register('employment_status')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ACTIVE">ACTIVE (Available for Teaching)</option>
              <option value="ON_LEAVE">ON_LEAVE (Sabbatical / Leave of Absence)</option>
              <option value="INACTIVE">INACTIVE (Not Currently Available)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingLecturer ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteLecturer(deleteId);
        }}
        title="Delete Faculty Profile?"
        message="This will remove the faculty record from the personnel registry."
      />
    </div>
  );
};
