import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Department, User } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import {
  GraduationCap,
  Building,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(3, 'Department name must be at least 3 characters'),
  code: z.string().min(2, 'Department code is required (e.g., CSIT)'),
  faculty_name: z.string().min(3, 'Faculty name is required'),
  dean_user_id: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

export const DepartmentsPage: React.FC = () => {
  const { currentUser, currentRole, canApprove } = useAuth();
  const {
    departments,
    majors,
    hydratedSchedules,
    branches,
    users,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    assignDeanToDepartment
  } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedDeanFilter, setSelectedDeanFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [reassignCandidate, setReassignCandidate] = useState<Department | null>(null);
  const [selectedNewDeanId, setSelectedNewDeanId] = useState<string>('');
  const [deleteCandidate, setDeleteCandidate] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Available Deans (users with role DEAN or ADMIN)
  const availableDeans = useMemo(() => {
    return users.filter(u => u.role === 'DEAN' || u.role === 'ADMIN');
  }, [users]);

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      faculty_name: '',
      dean_user_id: null,
      branch_id: '1',
      description: '',
      is_active: true
    }
  });

  const handleOpenCreateModal = () => {
    setEditingDept(null);
    reset({
      name: '',
      code: '',
      faculty_name: 'Faculty of Science & Technology',
      dean_user_id: availableDeans[0]?.id || null,
      branch_id: '1',
      description: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    reset({
      name: dept.name,
      code: dept.code,
      faculty_name: dept.faculty_name,
      dean_user_id: dept.dean_user_id || null,
      branch_id: dept.branch_id || '1',
      description: dept.description || '',
      is_active: dept.is_active
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = (data: DepartmentFormData) => {
    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: data.name,
        code: data.code.toUpperCase(),
        faculty_name: data.faculty_name,
        dean_user_id: data.dean_user_id || null,
        branch_id: data.branch_id || undefined,
        description: data.description || '',
        is_active: data.is_active
      });
    } else {
      addDepartment({
        name: data.name,
        code: data.code.toUpperCase(),
        faculty_name: data.faculty_name,
        dean_user_id: data.dean_user_id || null,
        branch_id: data.branch_id || undefined,
        description: data.description || '',
        is_active: data.is_active
      });
    }
    setIsModalOpen(false);
    setEditingDept(null);
  };

  const handleQuickReassign = () => {
    if (!reassignCandidate) return;
    assignDeanToDepartment(reassignCandidate.id, selectedNewDeanId || null);
    setReassignCandidate(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    const res = deleteDepartment(deleteCandidate.id);
    if (!res.success) {
      setDeleteError(res.message || 'Cannot delete department.');
    } else {
      setDeleteCandidate(null);
      setDeleteError(null);
    }
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.faculty_name ? d.faculty_name.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (d.dean_user_id && users.find(u => u.id === d.dean_user_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && d.is_active) ||
        (selectedStatus === 'inactive' && !d.is_active);

      const matchesDean =
        selectedDeanFilter === 'all' ||
        (selectedDeanFilter === 'assigned' && !!d.dean_user_id) ||
        (selectedDeanFilter === 'unassigned' && !d.dean_user_id);

      return matchesSearch && matchesStatus && matchesDean;
    });
  }, [departments, searchQuery, selectedStatus, selectedDeanFilter, users]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const assignedDepts = departments.filter(d => !!d.dean_user_id).length;
    const totalMajors = majors.length;
    const totalSchedules = hydratedSchedules.length;
    const pendingDeanSchedules = hydratedSchedules.filter(s => s.status === 'ADMIN_APPROVED').length;

    return { totalDepts, assignedDepts, totalMajors, totalSchedules, pendingDeanSchedules };
  }, [departments, majors, hydratedSchedules]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Department &amp; Dean Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage university academic departments and assign authorized Deans for automated schedule routing and official verification.
              </p>
            </div>
          </div>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Departments</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalDepts}</div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">University Divisions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dean Assignments</div>
            <div className="text-2xl font-bold text-indigo-600 mt-0.5">
              {stats.assignedDepts} / {stats.totalDepts}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Authorized Signatories</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Majors</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.totalMajors}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Academic Programs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Dean Review</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{stats.pendingDeanSchedules}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Admin Approved Schedules</div>
          </div>
        </div>
      </div>

      {/* Workflow Explanation Banner */}
      <div className="bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/40 p-4 rounded-2xl border border-blue-100 text-sm text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-blue-950">How Department-Specific Routing Works:</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            When an Administrator approves a schedule and uploads their signature &amp; official stamp, the schedule is automatically routed to the Dean assigned to that schedule's department (e.g., Computer Science schedules go to Dean Vance; Business schedules go to Dean Bradley). The Dean reviews and applies their personal signature to grant final approval.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments, faculties, or deans..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Dean:</span>
            <select
              value={selectedDeanFilter}
              onChange={e => setSelectedDeanFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Departments</option>
              <option value="assigned">Dean Assigned</option>
              <option value="unassigned">Dean Missing</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDepartments.map(dept => {
          const assignedDean = users.find(u => u.id === dept.dean_user_id);
          const deptMajors = majors.filter(m => m.department_id === dept.id);
          const deptSchedules = hydratedSchedules.filter(s => s.departmentId === dept.id);
          const pendingDeanCount = deptSchedules.filter(s => s.status === 'ADMIN_APPROVED').length;
          const fullyApprovedCount = deptSchedules.filter(s => s.status === 'FULLY_APPROVED').length;

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md uppercase tracking-wider">
                        {dept.code}
                      </span>
                      <StatusBadge status={dept.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {dept.faculty_name}
                    </p>
                  </div>

                  {currentRole === 'ADMIN' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(dept)}
                        title="Edit Department"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteCandidate(dept);
                          setDeleteError(null);
                        }}
                        title="Delete Department"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {dept.description && (
                  <p className="text-xs text-gray-600 mt-2 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                    {dept.description}
                  </p>
                )}
              </div>

              {/* Dean Assignment Card */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Assigned Department Dean
                  </span>
                  {currentRole === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setReassignCandidate(dept);
                        setSelectedNewDeanId(dept.dean_user_id || '');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline"
                    >
                      {assignedDean ? 'Reassign Dean' : 'Assign Dean'}
                    </button>
                  )}
                </div>

                {assignedDean ? (
                  <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {assignedDean.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          {assignedDean.name}
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-medium">
                            {assignedDean.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{assignedDean.email}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Signatory
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-amber-50/70 rounded-lg border border-amber-200/70 text-amber-800 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>No Dean currently assigned. Admin approval will require manual dispatch.</span>
                    </div>
                    {currentRole === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setReassignCandidate(dept);
                          setSelectedNewDeanId(availableDeans[0]?.id || '');
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md text-xs transition-colors shrink-0"
                      >
                        Assign Now
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Department Details & Metrics */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium text-gray-700">Academic Majors:</span>
                  <span className="font-semibold text-gray-900">{deptMajors.length} Programs</span>
                </div>

                {deptMajors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {deptMajors.slice(0, 4).map(m => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] rounded-md font-medium"
                      >
                        {m.code} - {m.name}
                      </span>
                    ))}
                    {deptMajors.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-md">
                        +{deptMajors.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center text-xs">
                  <div>
                    <div className="text-[11px] text-gray-500">Total Schedules</div>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">{deptSchedules.length}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-amber-600 font-medium">Pending Dean</div>
                    <div className="text-sm font-bold text-amber-600 mt-0.5">{pendingDeanCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-600 font-medium">Fully Approved</div>
                    <div className="text-sm font-bold text-emerald-600 mt-0.5">{fullyApprovedCount}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No departments found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            No departments match your current filter or search criteria.
          </p>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDept(null);
        }}
        title={editingDept ? 'Edit Academic Department' : 'Create New Academic Department'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Department Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Department of Computer Science & Information Technology"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Department Code *
              </label>
              <input
                type="text"
                {...register('code')}
                placeholder="e.g. CSIT"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Campus / Branch
              </label>
              <select
                {...register('branch_id')}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Faculty / College Name *
            </label>
            <input
              type="text"
              {...register('faculty_name')}
              placeholder="e.g. Faculty of Science & Technology"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.faculty_name && <p className="text-xs text-red-600 mt-1">{errors.faculty_name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Assigned Department Dean (Signatory)
            </label>
            <select
              {...register('dean_user_id')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- No Dean Assigned --</option>
              {availableDeans.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} - {u.email})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">
              This Dean will automatically receive schedules for this department once approved by the Admin.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Operational details, mission, or coverage notes..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_dept"
              {...register('is_active')}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="is_active_dept" className="text-sm font-medium text-gray-700">
              Department is Active
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDept(null);
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-xs"
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Reassign Dean Modal */}
      <Modal
        isOpen={!!reassignCandidate}
        onClose={() => setReassignCandidate(null)}
        title={`Assign Dean: ${reassignCandidate?.name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Select the authorized Dean responsible for verifying and affixing signatures to schedules belonging to <strong className="text-gray-900">{reassignCandidate?.name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Select Dean
            </label>
            <select
              value={selectedNewDeanId}
              onChange={e => setSelectedNewDeanId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- No Dean Assigned --</option>
              {availableDeans.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} - {u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800">
            <strong>Automatic Update:</strong> Any schedules in this department currently awaiting Dean verification will be immediately accessible to the newly assigned Dean.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setReassignCandidate(null)}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickReassign}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-xs"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteCandidate}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Department"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteCandidate(null);
          setDeleteError(null);
        }}
      />

      {deleteError && (
        <Modal
          isOpen={!!deleteError}
          onClose={() => setDeleteError(null)}
          title="Deletion Error"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteError(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
