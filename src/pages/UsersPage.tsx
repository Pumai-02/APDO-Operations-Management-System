import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { User, UserRole } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { ShieldCheck, Plus, Edit, Trash2, Mail, Lock, User as UserIcon, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['ADMIN', 'DEAN', 'LECTURER']),
  is_active: z.boolean().default(true)
});

type UserFormData = z.infer<typeof userSchema>;

export const UsersPage: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useOperations();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'LECTURER',
      is_active: true
    }
  });

  const handleOpenCreate = () => {
    reset({
      name: '',
      email: '',
      role: 'LECTURER',
      is_active: true
    });
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUser(editingUser.id, data);
    } else {
      addUser({
        ...data,
        email_verified_at: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => {
    if (selectedRole !== 'all' && u.role !== selectedRole) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            System User Management & Access Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated enterprise accounts, administrative privileges, and role scopes.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search account name or email..."
            className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Role:</span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DEAN">DEAN</option>
              <option value="LECTURER">LECTURER</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500">
          Showing <strong>{filteredUsers.length}</strong> active user accounts
        </span>
      </div>

      {/* Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">User Profile</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Email Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map(user => {
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-navy font-bold flex items-center justify-center text-xs border border-blue-200">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {user.name}
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'DEAN' ? 'bg-blue-100 text-brand-navy' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.is_active} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {user.email_verified_at ? 'Verified' : 'Pending'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => switchUser(user.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                          title="Switch active session to this user"
                        >
                          Impersonate
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => setDeleteId(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
        title={editingUser ? `Edit Account: ${editingUser.name}` : 'Create User Account'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Dr. Jordan Bell"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              {...register('email')}
              placeholder="user@apdo.org"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ADMIN">ADMIN (Full Administrative Management)</option>
              <option value="DEAN">DEAN (Supervisor & Approval Authority)</option>
              <option value="LECTURER">LECTURER (Faculty / Staff Operator)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_usr"
              {...register('is_active')}
              className="rounded text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="is_active_usr" className="font-semibold text-slate-700">
              Active Enterprise Account
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingUser ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteUser(deleteId);
        }}
        title="Delete User Account?"
        message="This user will no longer be able to log in or manage system operations."
      />
    </div>
  );
};
