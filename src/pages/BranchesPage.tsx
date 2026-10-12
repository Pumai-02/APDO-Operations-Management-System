import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Branch } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const branchSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Branch code is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(5, 'Phone number is required'),
  contact_email: z.string().email('Valid email required').optional().or(z.literal('')),
  is_active: z.boolean().default(true)
});

type BranchFormData = z.infer<typeof branchSchema>;

export const BranchesPage: React.FC = () => {
  const { canEditOperational } = useAuth();
  const { branches, addBranch, updateBranch, deleteBranch, classrooms, majors } = useOperations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      contact_email: '',
      is_active: true
    }
  });

  const handleOpenCreate = () => {
    reset({
      name: '',
      code: '',
      address: '',
      phone: '',
      contact_email: '',
      is_active: true
    });
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    reset({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      contact_email: branch.contact_email || '',
      is_active: branch.is_active
    });
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const onSubmit = (data: BranchFormData) => {
    if (editingBranch) {
      updateBranch(editingBranch.id, {
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        contact_email: data.contact_email || '',
        is_active: data.is_active
      });
    } else {
      addBranch({
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        contact_email: data.contact_email || '',
        is_active: data.is_active
      });
    }
    setIsModalOpen(false);
  };

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-blue" />
            Organizational Branches & Campuses
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage geographical operational centers, branch facilities, and contact points.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Campus Branch</span>
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBranches.map(branch => {
          const roomCount = classrooms.filter(c => c.branch_id === branch.id).length;
          const majorCount = majors.filter(m => m.branch_id === branch.id).length;

          return (
            <div key={branch.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                      {branch.code}
                    </span>
                    <h3 className="text-base font-bold text-brand-navy mt-2">{branch.name}</h3>
                  </div>
                  <StatusBadge status={branch.is_active} size="sm" />
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  {branch.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">{branch.contact_email}</span>
                    </div>
                  )}

                  <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Classrooms</span>
                      <span className="text-sm font-extrabold text-slate-800">{roomCount} Rooms</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Majors</span>
                      <span className="text-sm font-extrabold text-slate-800">{majorCount} Programs</span>
                    </div>
                  </div>
                </div>
              </div>

              {canEditOperational && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                    title="Edit Branch"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(branch.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Branch"
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
        title={editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add Campus Branch'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. APDO Downtown Innovation Center"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Branch Code *</label>
            <input
              type="text"
              {...register('code')}
              placeholder="e.g. DOWNTOWN-04"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 uppercase"
            />
            {errors.code && <p className="text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address *</label>
            <textarea
              {...register('address')}
              rows={2}
              placeholder="Full street location..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.address && <p className="text-red-500 mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                {...register('contact_email')}
                placeholder="branch@apdo.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_branch"
              {...register('is_active')}
              className="rounded text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="is_active_branch" className="font-semibold text-slate-700">
              Active Operational Campus
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingBranch ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteBranch(deleteId);
        }}
        title="Delete Campus Branch?"
        message="This will remove the campus record. Ensure no active classrooms or majors rely on this branch."
      />
    </div>
  );
};
