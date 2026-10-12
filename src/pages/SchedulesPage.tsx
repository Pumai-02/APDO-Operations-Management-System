import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { HydratedSchedule, ScheduleType, ScheduleStatus, TimeSlot } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import {
  CalendarCheck,
  Plus,
  Filter,
  Calendar,
  ListFilter,
  AlertTriangle,
  Building,
  Building2,
  BookOpen,
  User,
  UserCheck,
  DoorOpen,
  Clock,
  Send,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  FileCheck2,
  Layers,
  ChevronDown,
  Printer,
  Coffee,
  RotateCcw,
  GraduationCap,
  Lock,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatTime12h, formatTimeRange } from '../utils/timeFormat';
import { WindowAvailabilityResult } from '../context/OperationsContext';

const scheduleSchema = z.object({
  department_id: z.string().optional(),
  semester_id: z.string().min(1, 'Semester is required'),
  academic_year_id: z.string().min(1, 'Academic Year is required'),
  branch_id: z.string().min(1, 'Branch campus is required'),
  course_id: z.string().min(1, 'Course is required'),
  lecturer_id: z.string().min(1, 'Lecturer is required'),
  classroom_id: z.string().min(1, 'Classroom is required'),
  time_slot_id: z.string().min(1, 'Operational Time Window is required'),
  session_number: z.coerce.number().min(1).max(3).default(1),
  batch_id: z.string().optional(),
  schedule_type: z.enum(['NORMAL', 'COMBINED']),
  section_ids: z.array(z.string()).min(1, 'At least one class section must be linked'),
  duration_minutes: z.coerce.number().min(30, 'Duration must be at least 30 minutes'),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  remarks: z.string().optional()
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export const SchedulesPage: React.FC = () => {
  const { currentRole, currentUser, canEditOperational } = useAuth();
  const {
    hydratedSchedules,
    branches,
    semesters,
    academicYears,
    departments,
    courses,
    lecturers,
    lecturerBranches,
    lecturerAvailabilities,
    classrooms,
    timeSlots,
    classSections,
    batches,
    conflicts,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    submitSchedule,
    checkLecturerAvailabilityForWindow,
    getAvailableTimeWindowsForLecturer
  } = useOperations();

  // Assigned Department for Dean
  const userDeanDept = useMemo(() => {
    return departments.find(d => d.dean_user_id === currentUser.id);
  }, [departments, currentUser]);

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    if (currentRole === 'DEAN' && userDeanDept) {
      return userDeanDept.id;
    }
    return 'all';
  });
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [selectedLecturerFilter, setSelectedLecturerFilter] = useState<string>('all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('all');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<HydratedSchedule | null>(null);
  const [inspectingSchedule, setInspectingSchedule] = useState<HydratedSchedule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);

  // Availability state for create / edit schedule modal
  const [selectedSessions, setSelectedSessions] = useState<(1 | 2)[]>([1]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [compatibleWindows, setCompatibleWindows] = useState<TimeSlot[]>([]);
  const [windowResults, setWindowResults] = useState<Record<string, WindowAvailabilityResult>>({});

  // Active academic year reference
  const activeAcademicYear = useMemo(() => {
    return academicYears.find(y => y.is_active);
  }, [academicYears]);

  // Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      department_id: (currentRole === 'DEAN' && userDeanDept) ? userDeanDept.id : (departments[0]?.id || '1'),
      semester_id: '1',
      academic_year_id: '2',
      branch_id: '1',
      course_id: '',
      lecturer_id: '',
      classroom_id: '',
      time_slot_id: '1',
      session_number: 1,
      schedule_type: 'NORMAL',
      section_ids: [],
      duration_minutes: 90,
      scheduled_date: new Date().toISOString().split('T')[0],
      remarks: ''
    }
  });

  const watchBranchId = watch('branch_id');
  const watchCourseId = watch('course_id');
  const watchLecturerId = watch('lecturer_id');
  const watchTimeSlotId = watch('time_slot_id');
  const watchAcademicYearId = watch('academic_year_id');
  const watchSessionNumber = (watch('session_number') || 1) as 1 | 2 | 3;
  const watchScheduleType = watch('schedule_type');
  const watchSectionIds = watch('section_ids') || [];

  const selectedTimeSlot = useMemo(() => {
    return timeSlots.find(t => t.id === watchTimeSlotId);
  }, [timeSlots, watchTimeSlotId]);

  const watchAcademicYearObj = useMemo(() => {
    return academicYears.find(y => y.id === watchAcademicYearId);
  }, [academicYears, watchAcademicYearId]);

  // Cascading options
  const availableClassrooms = useMemo(() => {
    return classrooms.filter(c => c.branch_id === watchBranchId && c.is_available);
  }, [classrooms, watchBranchId]);

  const availableSections = useMemo(() => {
    return classSections.filter(s => s.branch_id === watchBranchId);
  }, [classSections, watchBranchId]);

  // Helper to check lecturer availability
  const checkAvailability = (lecId: string, brId: string, currentSlotId?: string) => {
    if (!lecId || !brId) {
      setCompatibleWindows([]);
      setWindowResults({});
      return;
    }

    setIsCheckingAvailability(true);
    setAvailabilityError(null);

    try {
      const { compatibleSlots, slotResults } = getAvailableTimeWindowsForLecturer(
        lecId,
        brId,
        { excludeScheduleId: editingSchedule?.id }
      );
      setCompatibleWindows(compatibleSlots);
      setWindowResults(slotResults);
      setIsCheckingAvailability(false);

      // Validate target slot
      const targetSlot = currentSlotId || watchTimeSlotId;
      if (compatibleSlots.length > 0) {
        if (!compatibleSlots.some(s => s.id === targetSlot)) {
          setValue('time_slot_id', compatibleSlots[0].id);
        }
      } else {
        setValue('time_slot_id', '');
      }
    } catch (err: any) {
      setIsCheckingAvailability(false);
      setAvailabilityError(err?.message || 'Failed to check lecturer availability.');
    }
  };

  // Trigger availability check when lecturer or branch changes
  useEffect(() => {
    if (!isCreateModalOpen) return;
    if (!watchLecturerId || !watchBranchId) {
      setCompatibleWindows([]);
      setWindowResults({});
      return;
    }

    checkAvailability(watchLecturerId, watchBranchId);
  }, [watchLecturerId, watchBranchId, isCreateModalOpen, editingSchedule?.id]);

  // Adjust selectedSessions when time window changes
  useEffect(() => {
    if (!watchTimeSlotId || !windowResults[watchTimeSlotId]) return;
    const res = windowResults[watchTimeSlotId];
    const valid = selectedSessions.filter(s => (s === 1 ? res.session1Available : res.session2Available));
    if (valid.length === 0) {
      if (res.session1Available) setSelectedSessions([1]);
      else if (res.session2Available) setSelectedSessions([2]);
      else setSelectedSessions([]);
    } else if (valid.length !== selectedSessions.length) {
      setSelectedSessions(valid);
    }
  }, [watchTimeSlotId, windowResults]);

  // Adjust duration_minutes and session_number when selectedSessions or timeSlot changes
  useEffect(() => {
    if (!selectedTimeSlot) return;
    const baseDuration = selectedTimeSlot.session_duration_minutes || 90;
    if (selectedSessions.length === 2) {
      const dur = (baseDuration * 2) + (selectedTimeSlot.break_duration_minutes || 10);
      setValue('duration_minutes', dur);
      setValue('session_number', 3);
    } else if (selectedSessions.length === 1) {
      setValue('duration_minutes', baseDuration);
      setValue('session_number', selectedSessions[0]);
    }
  }, [selectedSessions, selectedTimeSlot]);

  // Filtered hydrated schedules
  const filteredSchedules = useMemo(() => {
    return hydratedSchedules.filter(s => {
      // 1. Role-based Department Access
      if (currentRole === 'DEAN' && userDeanDept) {
        if (s.departmentId !== userDeanDept.id && s.department_id !== userDeanDept.id) return false;
      } else if (selectedDepartment !== 'all') {
        if (s.departmentId !== selectedDepartment && s.department_id !== selectedDepartment) return false;
      }

      // 2. Academic Year
      if (selectedYear !== 'all') {
        const schedYear = s.academic_year_id || s.academicYearId;
        if (schedYear && schedYear !== selectedYear) return false;
      }

      // 3. Campus
      if (selectedBranch !== 'all' && s.branch_id !== selectedBranch) return false;

      // 4. Batch
      if (selectedBatch !== 'all' && s.batchId !== selectedBatch && s.batch_id !== selectedBatch) return false;

      // 5. Section
      if (selectedSectionFilter !== 'all' && !s.linkedSectionIds.includes(selectedSectionFilter)) return false;

      // 6. Lecturer
      if (selectedLecturerFilter !== 'all' && s.lecturer_id !== selectedLecturerFilter) return false;

      // 7. Day of Week
      if (selectedDayFilter !== 'all' && s.timeSlotDay !== selectedDayFilter) return false;

      // 8. Operational Time Window
      if (selectedSlotFilter !== 'all' && s.time_slot_id !== selectedSlotFilter) return false;

      // 9. Class Session Filter (1, 2, or Dual Session 3)
      if (selectedSessionFilter !== 'all') {
        const targetSess = parseInt(selectedSessionFilter);
        if (targetSess === 3) {
          if (s.sessionNumber !== 3 && (!s.selected_sessions || s.selected_sessions.length !== 2)) return false;
        } else {
          const schedSessions = (s.selected_sessions && s.selected_sessions.length > 0)
            ? s.selected_sessions
            : (s.sessionNumber === 3 ? [1, 2] : [s.sessionNumber || s.session_number || 1]);
          if (!schedSessions.includes(targetSess as 1 | 2)) return false;
        }
      }

      // 10. Status Filter
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;

      // 11. Semester
      if (selectedSemester !== 'all' && s.semester_id !== selectedSemester) return false;

      // 12. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.courseCode?.toLowerCase().includes(q) ||
          s.courseName?.toLowerCase().includes(q) ||
          s.lecturerName?.toLowerCase().includes(q) ||
          s.classroomNumber?.toLowerCase().includes(q) ||
          s.batchCode?.toLowerCase().includes(q) ||
          s.batchName?.toLowerCase().includes(q) ||
          s.departmentName?.toLowerCase().includes(q) ||
          s.departmentCode?.toLowerCase().includes(q) ||
          s.remarks?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    hydratedSchedules, currentRole, userDeanDept, selectedDepartment,
    selectedYear, selectedBranch, selectedBatch, selectedSectionFilter,
    selectedLecturerFilter, selectedDayFilter, selectedSlotFilter,
    selectedSessionFilter, selectedStatus, selectedSemester, searchQuery
  ]);

  const activeDepartmentObj = useMemo(() => {
    return departments.find(d => d.id === (currentRole === 'DEAN' && userDeanDept ? userDeanDept.id : selectedDepartment));
  }, [departments, currentRole, userDeanDept, selectedDepartment]);

  const activeYearObj = useMemo(() => {
    return academicYears.find(y => y.id === selectedYear);
  }, [academicYears, selectedYear]);

  const activeBranchObj = useMemo(() => {
    return branches.find(b => b.id === selectedBranch);
  }, [branches, selectedBranch]);

  const handleResetFilters = () => {
    if (currentRole !== 'DEAN') setSelectedDepartment('all');
    setSelectedYear('all');
    setSelectedBranch('all');
    setSelectedBatch('all');
    setSelectedSectionFilter('all');
    setSelectedLecturerFilter('all');
    setSelectedDayFilter('all');
    setSelectedSlotFilter('all');
    setSelectedSessionFilter('all');
    setSelectedStatus('all');
    setSelectedSemester('1');
    setSearchQuery('');
  };

  const handleOpenCreate = () => {
    setScheduleFormError(null);
    setAvailabilityError(null);
    const defaultYearId = activeAcademicYear?.id || academicYears[0]?.id || '2';
    const defaultDeptId = (currentRole === 'DEAN' && userDeanDept)
      ? userDeanDept.id
      : (selectedDepartment !== 'all' ? selectedDepartment : (departments[0]?.id || '1'));
    const defaultBranchId = selectedBranch !== 'all' ? selectedBranch : (branches[0]?.id || '1');
    const defaultLecturerId = lecturers[0]?.id || '';

    setSelectedSessions([1]);
    reset({
      department_id: defaultDeptId,
      semester_id: '1',
      academic_year_id: defaultYearId,
      branch_id: defaultBranchId,
      course_id: courses[0]?.id || '',
      lecturer_id: defaultLecturerId,
      classroom_id: classrooms[0]?.id || '',
      time_slot_id: '1',
      session_number: 1,
      batch_id: batches[0]?.id || '',
      schedule_type: 'NORMAL',
      section_ids: classSections.slice(0, 1).map(s => s.id),
      duration_minutes: 90,
      scheduled_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setEditingSchedule(null);
    setIsCreateModalOpen(true);
    if (defaultLecturerId && defaultBranchId) {
      checkAvailability(defaultLecturerId, defaultBranchId, '1');
    }
  };

  const handleOpenEdit = (sched: HydratedSchedule) => {
    setScheduleFormError(null);
    setAvailabilityError(null);
    const defaultYearId = sched.academic_year_id || sched.academicYearId || activeAcademicYear?.id || '2';
    const currentSessions: (1 | 2)[] = (sched.selected_sessions && sched.selected_sessions.length > 0)
      ? sched.selected_sessions
      : (sched.sessionNumber === 3 || sched.session_number === 3 ? [1, 2] : [(sched.sessionNumber || sched.session_number || 1) as 1 | 2]);

    setSelectedSessions(currentSessions);
    reset({
      department_id: sched.departmentId || sched.department_id || departments[0]?.id || '1',
      semester_id: sched.semester_id,
      academic_year_id: defaultYearId,
      branch_id: sched.branch_id,
      course_id: sched.course_id,
      lecturer_id: sched.lecturer_id,
      classroom_id: sched.classroom_id,
      time_slot_id: sched.time_slot_id,
      session_number: (sched.sessionNumber || sched.session_number || 1) as any,
      batch_id: sched.batch_id || sched.batchId || '',
      schedule_type: sched.schedule_type,
      section_ids: sched.linkedSectionIds,
      duration_minutes: sched.duration_minutes || 90,
      scheduled_date: sched.scheduled_date,
      remarks: sched.remarks || ''
    });
    setEditingSchedule(sched);
    setIsCreateModalOpen(true);
    checkAvailability(sched.lecturer_id, sched.branch_id, sched.time_slot_id);
  };

  const onSubmit = (data: ScheduleFormData) => {
    setScheduleFormError(null);

    if (selectedSessions.length === 0) {
      setScheduleFormError('Please select at least one class session (Session 1, Session 2, or both).');
      return;
    }

    // Validate inactive academic year creation permission
    const chosenYear = academicYears.find(y => y.id === data.academic_year_id);
    if (!editingSchedule && chosenYear && !chosenYear.is_active && currentRole !== 'ADMIN') {
      setScheduleFormError(`Academic Year "${chosenYear.name}" is inactive. Creating new schedules under inactive academic years requires Administrator authorization.`);
      return;
    }

    const sessionNum = selectedSessions.length === 2 ? 3 : (selectedSessions[0] || 1);
    const deptId = (currentRole === 'DEAN' && userDeanDept) ? userDeanDept.id : (data.department_id || undefined);

    try {
      if (editingSchedule) {
        updateSchedule(
          editingSchedule.id,
          {
            department_id: deptId,
            semester_id: data.semester_id,
            academic_year_id: data.academic_year_id,
            branch_id: data.branch_id,
            course_id: data.course_id,
            lecturer_id: data.lecturer_id,
            classroom_id: data.classroom_id,
            time_slot_id: data.time_slot_id,
            session_number: sessionNum as any,
            selected_sessions: selectedSessions,
            batch_id: data.batch_id || null,
            schedule_type: data.schedule_type,
            duration_minutes: data.duration_minutes,
            scheduled_date: data.scheduled_date,
            remarks: data.remarks || '',
            created_by: currentUser.id
          },
          data.section_ids
        );
      } else {
        addSchedule(
          {
            department_id: deptId,
            semester_id: data.semester_id,
            academic_year_id: data.academic_year_id,
            branch_id: data.branch_id,
            course_id: data.course_id,
            lecturer_id: data.lecturer_id,
            classroom_id: data.classroom_id,
            time_slot_id: data.time_slot_id,
            session_number: sessionNum as any,
            selected_sessions: selectedSessions,
            batch_id: data.batch_id || null,
            schedule_type: data.schedule_type,
            status: 'DRAFT',
            duration_minutes: data.duration_minutes,
            scheduled_date: data.scheduled_date,
            created_by: currentUser.id,
            approved_by: null,
            approved_at: null,
            remarks: data.remarks || ''
          },
          data.section_ids
        );
      }
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setScheduleFormError(err?.message || 'Failed to save operational schedule.');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const periods = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy">Operational Schedules & Timetable</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic operational sessions, multi-section cohorts, and classroom allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-brand-navy shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white text-brand-navy shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Weekly Matrix
            </button>
          </div>

          <Link
            to="/schedule-preview"
            className="btn-secondary gap-1.5 text-xs inline-flex items-center shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-brand-navy" />
            <span>Preview & Export</span>
          </Link>

          {canEditOperational && (
            <button
              onClick={handleOpenCreate}
              className="btn-primary gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="min-w-[180px] flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search course, lecturer, room..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Department:</span>
            </span>
            <select
              value={currentRole === 'DEAN' && userDeanDept ? userDeanDept.id : selectedDepartment}
              disabled={currentRole === 'DEAN'}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-semibold text-slate-800 disabled:opacity-85 disabled:bg-slate-100"
            >
              {currentRole !== 'DEAN' && (
                <option value="all">All Departments ({departments.length})</option>
              )}
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name} {userDeanDept?.id === d.id && currentRole === 'DEAN' ? '★ (Assigned)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Year:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium text-slate-800"
            >
              <option value="all">All Academic Years ({academicYears.length})</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.is_active ? '★ (Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Campus:</span>
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

          {/* Batch Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Batch:</span>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              <option value="all">All Batches ({batches.length})</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.batch_code} - {b.batch_name}</option>
              ))}
            </select>
          </div>

          {/* Faculty / Lecturer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Lecturer:</span>
            <select
              value={selectedLecturerFilter}
              onChange={e => setSelectedLecturerFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium max-w-[150px] truncate"
            >
              <option value="all">All Lecturers ({lecturers.length})</option>
              {lecturers.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Day Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Day:</span>
            <select
              value={selectedDayFilter}
              onChange={e => setSelectedDayFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              <option value="all">All Days</option>
              {daysOfWeek.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Class Session Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Session:</span>
            <select
              value={selectedSessionFilter}
              onChange={e => setSelectedSessionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              <option value="all">All Sessions</option>
              <option value="1">Session 1 Only</option>
              <option value="2">Session 2 Only</option>
              <option value="3">Dual Session (1 & 2)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredSchedules.length}</strong> schedules
          </div>
          {(selectedDepartment !== 'all' || selectedYear !== 'all' || selectedBranch !== 'all' || selectedBatch !== 'all' || selectedSectionFilter !== 'all' || selectedLecturerFilter !== 'all' || selectedDayFilter !== 'all' || selectedSessionFilter !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        /* TABLE LIST VIEW */
        <div className="card-enterprise overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Schedule ID</th>
                  <th className="px-4 py-3.5">Course & Syllabus</th>
                  <th className="px-4 py-3.5">Assigned Faculty</th>
                  <th className="px-4 py-3.5">Classroom & Campus</th>
                  <th className="px-4 py-3.5">Operational Window & Session</th>
                  <th className="px-4 py-3.5">Sections</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center py-6">
                        <Filter className="w-10 h-10 text-slate-300 mb-3" />
                        <h4 className="font-bold text-slate-700 text-base">No schedules found</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          No operational schedules match the current department ({selectedDepartment === 'all' ? 'All Departments' : activeDepartmentObj?.name}) and active filter settings.
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Filters</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map(sched => (
                    <tr key={sched.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        #{sched.id}
                        {sched.conflictsCount > 0 && (
                          <span
                            title={`${sched.conflictsCount} active conflicts`}
                            className="inline-block ml-1.5 p-0.5 rounded bg-rose-100 text-rose-700 align-middle"
                          >
                            <AlertTriangle className="w-3 h-3 inline" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sched.courseCode}</span>
                          {sched.batchCode && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-mono text-[9px] font-bold border border-purple-200">
                              {sched.batchCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {sched.courseName}
                        </div>
                        <div className="text-[10px] text-indigo-700 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[160px]">{sched.departmentName || sched.departmentCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{sched.lecturerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sched.lecturerCode}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{sched.classroomNumber}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{sched.branchName}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{sched.timeSlotDay} &bull; {sched.timeSlotPeriod}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] border ${
                            sched.sessionNumber === 3 || (sched.selected_sessions && sched.selected_sessions.length === 2)
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : sched.sessionNumber === 2
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-brand-blue border-blue-200'
                          }`}>
                            {sched.sessionNumber === 3 || (sched.selected_sessions && sched.selected_sessions.length === 2)
                              ? 'Dual Session (1 & 2)'
                              : sched.sessionLabel || `Session ${sched.sessionNumber || 1}`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">
                            {sched.effectiveStartTime12h || sched.effectiveStartTime} - {sched.effectiveEndTime12h || sched.effectiveEndTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {sched.linkedSectionNames.map((sec, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-700">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={sched.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingSchedule(sched)}
                            className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEditOperational && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(sched)}
                                className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                                title="Edit Schedule"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {sched.status === 'DRAFT' && (
                                <button
                                  onClick={() => submitSchedule(sched.id, currentUser.id)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Submit for Review"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteConfirmId(sched.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Schedule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* WEEKLY MATRIX TIMETABLE VIEW */
        <div className="card-enterprise p-4 overflow-x-auto space-y-4">
          {/* Timetable Department Heading */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-brand-navy flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-blue" />
                <span>Timetable Schedule &bull; {selectedDepartment === 'all' ? 'All Academic Departments' : activeDepartmentObj?.name || 'Department'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cycle: <strong className="text-slate-700">{selectedYear === 'all' ? 'All Academic Years' : activeYearObj?.name || 'Active Year'}</strong> &bull; Campus: <strong className="text-slate-700">{selectedBranch === 'all' ? 'All Campuses' : activeBranchObj?.name || 'Campus'}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
                {filteredSchedules.length} Timetable Entries
              </span>
            </div>
          </div>

          <div className="min-w-[850px]">
            <div className="grid grid-cols-8 gap-2 pb-2 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase text-center">
              <div className="py-2 bg-slate-100 rounded">Period</div>
              {daysOfWeek.map(d => (
                <div key={d} className="py-2 bg-slate-100 rounded">{d}</div>
              ))}
            </div>

            {periods.map(period => (
              <div key={period} className="grid grid-cols-8 gap-2 py-2 border-b border-slate-100 min-h-[140px]">
                {/* Period label */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-2 text-center border border-slate-200/60">
                  <span className="font-bold text-xs text-brand-navy">{period}</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {period === 'Morning' ? '08:00 - 11:30' : period === 'Afternoon' ? '13:00 - 16:30' : '17:30 - 20:30'}
                  </span>
                </div>

                {/* Days columns */}
                {daysOfWeek.map(day => {
                  const cellSchedules = filteredSchedules.filter(
                    s => s.timeSlotDay === day && s.timeSlotPeriod === period
                  );

                  return (
                    <div
                      key={day}
                      className="p-1.5 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col gap-1.5 overflow-hidden hover:bg-blue-50/20 transition-colors"
                    >
                      {cellSchedules.map(cs => {
                        const isDual = cs.sessionNumber === 3 || (cs.selected_sessions && cs.selected_sessions.length === 2);
                        return (
                          <div
                            key={cs.id}
                            onClick={() => setInspectingSchedule(cs)}
                            className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:shadow-xs ${
                              cs.status === 'APPROVED' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' :
                              cs.status === 'UNDER_REVIEW' ? 'bg-amber-50/90 border-amber-200 text-amber-950' :
                              cs.status === 'SUBMITTED' ? 'bg-blue-50/90 border-blue-200 text-blue-950' :
                              cs.status === 'REJECTED' ? 'bg-rose-50/90 border-rose-200 text-rose-950' :
                              'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <span>{cs.courseCode}</span>
                              <span className="text-[9px] font-mono opacity-80">{cs.classroomNumber}</span>
                            </div>
                            <div className="text-[10px] truncate mt-0.5 opacity-90">{cs.lecturerName}</div>
                            
                            {/* Session Timing Badge in Matrix */}
                            <div className="mt-1 flex items-center justify-between gap-1">
                              <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                                isDual
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                  : cs.sessionNumber === 2
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-blue-100 text-blue-900'
                              }`}>
                                {isDual ? 'Dual (1&2)' : `S${cs.sessionNumber || 1}`}
                              </span>
                              <span className="text-[8px] font-mono opacity-75 truncate">
                                {cs.effectiveStartTime12h?.split(' ')[0]} - {cs.effectiveEndTime12h?.split(' ')[0]}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[9px] px-1 rounded bg-black/5 font-semibold">
                                {cs.linkedSectionNames[0] || 'Sec'}
                              </span>
                              <span className="text-[9px] font-bold">#{cs.id}</span>
                            </div>
                          </div>
                        );
                      })}

                      {cellSchedules.length === 0 && (
                        <div className="h-full flex items-center justify-center text-[10px] text-slate-300">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT SCHEDULE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingSchedule ? `Edit Schedule #${editingSchedule.id}` : 'Create Operational Schedule'}
        description="Configure academic parameters, faculty assignments, and classroom bookings"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {scheduleFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{scheduleFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Academic Year */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Academic Year *</span>
                {watchAcademicYearObj?.is_active ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Current Active Cycle
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    Inactive Cycle
                  </span>
                )}
              </label>
              <select
                {...register('academic_year_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium text-slate-900"
              >
                <option value="">Select Academic Year...</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.is_active ? '★ (Active)' : '(Inactive)'} – {new Date(y.start_date).getFullYear()} to {new Date(y.end_date).getFullYear()}
                  </option>
                ))}
              </select>
              {errors.academic_year_id && <p className="text-red-500 mt-1">{errors.academic_year_id.message}</p>}

              {watchAcademicYearObj && !watchAcademicYearObj.is_active && (
                <div className={`p-2.5 rounded-lg text-xs mt-2 flex items-start gap-2 ${
                  currentRole === 'ADMIN'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      {currentRole === 'ADMIN'
                        ? `Admin Notice: Academic Year "${watchAcademicYearObj.name}" is inactive.`
                        : `Permission Restricted: "${watchAcademicYearObj.name}" is an inactive academic year.`}
                    </p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">
                      {currentRole === 'ADMIN'
                        ? 'As an Administrator, you have explicit permission to schedule under inactive academic years.'
                        : 'New schedules cannot be created under an inactive academic year unless an authorized administrator explicitly permits it.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Academic Department *</span>
                {currentRole === 'DEAN' && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Dean Assigned
                  </span>
                )}
              </label>
              {currentRole === 'DEAN' ? (
                <>
                  <input
                    type="text"
                    disabled
                    value={`${userDeanDept?.name || 'Department'} (${userDeanDept?.code || 'DEPT'})`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-not-allowed"
                  />
                  <input type="hidden" {...register('department_id')} value={userDeanDept?.id || '1'} />
                </>
              ) : (
                <select
                  {...register('department_id')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium text-slate-900"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              )}
              {errors.department_id && <p className="text-red-500 mt-1">{errors.department_id.message}</p>}
            </div>

            {/* Campus Branch */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Branch *</label>
              <select
                {...register('branch_id')}
                onChange={e => {
                  register('branch_id').onChange(e);
                  if (watchLecturerId) {
                    checkAvailability(watchLecturerId, e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors.branch_id && <p className="text-red-500 mt-1">{errors.branch_id.message}</p>}
            </div>

            {/* Course */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course *</label>
              <select
                {...register('course_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="">Select Course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name} ({c.credits} Cr)</option>
                ))}
              </select>
              {errors.course_id && <p className="text-red-500 mt-1">{errors.course_id.message}</p>}
            </div>

            {/* Lecturer */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty / Lecturer *</label>
              <select
                {...register('lecturer_id')}
                onChange={e => {
                  register('lecturer_id').onChange(e);
                  if (e.target.value && watchBranchId) {
                    checkAvailability(e.target.value, watchBranchId);
                  } else {
                    setCompatibleWindows([]);
                    setWindowResults({});
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="">Select Lecturer...</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.lecturer_code}) - {l.employment_status}
                  </option>
                ))}
              </select>
              {errors.lecturer_id && <p className="text-red-500 mt-1">{errors.lecturer_id.message}</p>}
            </div>

            {/* Classroom */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classroom / Facility *</label>
              <select
                {...register('classroom_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="">Select Classroom...</option>
                {availableClassrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.room_number} ({c.room_type}, Cap: {c.capacity})
                  </option>
                ))}
              </select>
              {errors.classroom_id && <p className="text-red-500 mt-1">{errors.classroom_id.message}</p>}
            </div>

            {/* Operational Time Window */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Operational Time Window *</span>
                  {isCheckingAvailability && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Checking availability...</span>
                    </span>
                  )}
                </label>
                {watchLecturerId && !isCheckingAvailability && (
                  <span className={`text-[10px] font-bold ${
                    compatibleWindows.length > 0 ? 'text-brand-blue' : 'text-amber-600'
                  }`}>
                    {compatibleWindows.length} Available Window{compatibleWindows.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <select
                {...register('time_slot_id')}
                disabled={!watchLecturerId || !watchBranchId || isCheckingAvailability || compatibleWindows.length === 0}
                onChange={e => {
                  register('time_slot_id').onChange(e);
                  const slot = timeSlots.find(t => t.id === e.target.value);
                  if (slot) {
                    const baseDur = slot.session_duration_minutes || 90;
                    if (selectedSessions.length === 2) {
                      setValue('duration_minutes', (baseDur * 2) + (slot.break_duration_minutes || 10));
                    } else {
                      setValue('duration_minutes', baseDur);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-semibold text-brand-navy disabled:opacity-60 disabled:bg-slate-100"
              >
                {!watchLecturerId ? (
                  <option value="">Select a lecturer first...</option>
                ) : isCheckingAvailability ? (
                  <option value="">Checking lecturer availability against time windows...</option>
                ) : compatibleWindows.length === 0 ? (
                  <option value="">No available operational time windows for this lecturer.</option>
                ) : (
                  <>
                    <option value="">Select compatible time window...</option>
                    {compatibleWindows.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.day_of_week} &bull; {t.period} Window ({formatTime12h(t.session_1_start || t.start_time)} – {formatTime12h(t.session_2_end || t.end_time)})
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Retry on Error */}
              {availabilityError && (
                <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
                  <span>{availabilityError}</span>
                  <button
                    type="button"
                    onClick={() => checkAvailability(watchLecturerId, watchBranchId)}
                    className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 rounded text-rose-900 font-bold text-[10px]"
                  >
                    Retry Check
                  </button>
                </div>
              )}

              {/* No Compatible Windows Alert */}
              {watchLecturerId && !isCheckingAvailability && compatibleWindows.length === 0 && !availabilityError && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>No available operational time windows for this lecturer. Time windows are filtered strictly by database availability, campus assignments, and existing cross-campus bookings.</span>
                </div>
              )}

              {errors.time_slot_id && <p className="text-red-500 mt-1">{errors.time_slot_id.message}</p>}
            </div>

            {/* Class Session Selector (Session 1, Session 2, or Both Sessions) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Class Session within Window *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Select Session 1, Session 2, or Both for Dual Session)
                  </span>
                </label>
                {selectedTimeSlot && (
                  <button
                    type="button"
                    disabled={!windowResults[watchTimeSlotId]?.session1Available || !windowResults[watchTimeSlotId]?.session2Available}
                    onClick={() => {
                      if (selectedSessions.length === 2) {
                        setSelectedSessions([1]);
                      } else {
                        setSelectedSessions([1, 2]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                      selectedSessions.length === 2
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : windowResults[watchTimeSlotId]?.session1Available && windowResults[watchTimeSlotId]?.session2Available
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {selectedSessions.length === 2 ? '✓ Both Sessions Selected' : 'Select Both (Dual Session)'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Session 1 Card */}
                {(() => {
                  const s1Avail = windowResults[watchTimeSlotId]?.session1Available ?? true;
                  const s1Reason = windowResults[watchTimeSlotId]?.session1Reason;
                  const isS1Selected = selectedSessions.includes(1);

                  return (
                    <button
                      type="button"
                      disabled={!s1Avail}
                      onClick={() => {
                        if (isS1Selected) {
                          if (selectedSessions.length > 1) {
                            setSelectedSessions(selectedSessions.filter(s => s !== 1));
                          }
                        } else {
                          setSelectedSessions([...selectedSessions, 1].sort() as (1 | 2)[]);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        !s1Avail
                          ? 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                          : isS1Selected
                          ? 'bg-blue-50/90 border-brand-blue ring-2 ring-brand-blue/30 text-brand-navy shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isS1Selected}
                            disabled={!s1Avail}
                            readOnly
                            className="rounded text-brand-blue pointer-events-none"
                          />
                          <span className="font-bold text-xs">Session 1</span>
                        </div>
                        {s1Avail ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Available
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[11px] font-mono font-medium text-slate-700">
                        {formatTime12h(selectedTimeSlot?.session_1_start || '08:00:00')} – {formatTime12h(selectedTimeSlot?.session_1_end || '09:30:00')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Duration: {selectedTimeSlot?.session_duration_minutes || 90} minutes
                      </div>
                      {!s1Avail && s1Reason && (
                        <div className="mt-1 text-[10px] text-rose-600 font-normal truncate">
                          {s1Reason}
                        </div>
                      )}
                    </button>
                  );
                })()}

                {/* Session 2 Card */}
                {(() => {
                  const s2Avail = windowResults[watchTimeSlotId]?.session2Available ?? true;
                  const s2Reason = windowResults[watchTimeSlotId]?.session2Reason;
                  const isS2Selected = selectedSessions.includes(2);

                  return (
                    <button
                      type="button"
                      disabled={!s2Avail}
                      onClick={() => {
                        if (isS2Selected) {
                          if (selectedSessions.length > 1) {
                            setSelectedSessions(selectedSessions.filter(s => s !== 2));
                          }
                        } else {
                          setSelectedSessions([...selectedSessions, 2].sort() as (1 | 2)[]);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        !s2Avail
                          ? 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                          : isS2Selected
                          ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-500/30 text-purple-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isS2Selected}
                            disabled={!s2Avail}
                            readOnly
                            className="rounded text-purple-600 pointer-events-none"
                          />
                          <span className="font-bold text-xs">Session 2</span>
                        </div>
                        {s2Avail ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Available
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[11px] font-mono font-medium text-slate-700">
                        {formatTime12h(selectedTimeSlot?.session_2_start || '09:45:00')} – {formatTime12h(selectedTimeSlot?.session_2_end || '11:15:00')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Duration: {selectedTimeSlot?.session_duration_minutes || 90} minutes
                      </div>
                      {!s2Avail && s2Reason && (
                        <div className="mt-1 text-[10px] text-rose-600 font-normal truncate">
                          {s2Reason}
                        </div>
                      )}
                    </button>
                  );
                })()}
              </div>

              <input type="hidden" {...register('session_number')} />
            </div>

            {/* Session Timing & Duration Preview Banner */}
            {selectedTimeSlot && (
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>
                    <strong>Configured Schedule Timing:</strong>{' '}
                    <span className="text-brand-navy font-bold">
                      {selectedSessions.length === 2 ? (
                        <>
                          Dual Session (1 & 2): {formatTime12h(selectedTimeSlot.session_1_start)} – {formatTime12h(selectedTimeSlot.session_2_end)}
                          {' '}({(((selectedTimeSlot.session_duration_minutes || 90) * 2) + (selectedTimeSlot.break_duration_minutes || 10))} mins total)
                        </>
                      ) : selectedSessions[0] === 2 ? (
                        <>
                          Session 2: {formatTime12h(selectedTimeSlot.session_2_start)} – {formatTime12h(selectedTimeSlot.session_2_end)}
                          {' '}({selectedTimeSlot.session_duration_minutes || 90} mins)
                        </>
                      ) : (
                        <>
                          Session 1: {formatTime12h(selectedTimeSlot.session_1_start)} – {formatTime12h(selectedTimeSlot.session_1_end)}
                          {' '}({selectedTimeSlot.session_duration_minutes || 90} mins)
                        </>
                      )}
                    </span>
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-amber-600" />
                  <span>
                    Recess Break: {formatTime12h(selectedTimeSlot.break_start)} – {formatTime12h(selectedTimeSlot.break_end)}
                    {' '}({selectedTimeSlot.break_duration_minutes || 10}m)
                  </span>
                </div>
              </div>
            )}

            {/* Schedule Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Schedule Type *</label>
              <select
                {...register('schedule_type')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="NORMAL">NORMAL (Single Cohort)</option>
                <option value="COMBINED">COMBINED (Multiple Cohorts Merged)</option>
              </select>
            </div>

            {/* Academic Batch */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Batch (Optional)</label>
              <select
                {...register('batch_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="">Auto-derive from Sections</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batch_code} &bull; {b.batch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Sections Multi-Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Linked Class Sections * (Hold Ctrl or click to toggle)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
              {availableSections.map(sec => {
                const isSelected = watchSectionIds.includes(sec.id);
                return (
                  <label
                    key={sec.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-brand-blue text-brand-navy font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => {
                        if (e.target.checked) {
                          setValue('section_ids', [...watchSectionIds, sec.id]);
                        } else {
                          setValue('section_ids', watchSectionIds.filter(id => id !== sec.id));
                        }
                      }}
                      className="rounded text-brand-blue focus:ring-brand-blue"
                    />
                    <div className="truncate">
                      <div>{sec.section_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{sec.student_count} Students</div>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.section_ids && <p className="text-red-500 mt-1">{errors.section_ids.message}</p>}
          </div>

          {/* Scheduled Date & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Effective Date *</label>
              <input
                type="date"
                {...register('scheduled_date')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Duration (Minutes)</label>
              <input
                type="number"
                {...register('duration_minutes')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Operational Remarks / Instructions</label>
            <textarea
              {...register('remarks')}
              rows={2}
              placeholder="e.g. Requires lab workstations equipped with PostgreSQL and dual monitors..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingSchedule ? 'Save Changes' : 'Create Operational Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* INSPECT DETAILS MODAL */}
      {inspectingSchedule && (
        <Modal
          isOpen={!!inspectingSchedule}
          onClose={() => setInspectingSchedule(null)}
          title={`Schedule #${inspectingSchedule.id} Specification`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400">Current Status:</span>
                <div className="mt-1">
                  <StatusBadge status={inspectingSchedule.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Type:</span>
                <div className="font-bold text-slate-800">{inspectingSchedule.schedule_type}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400">Academic Year:</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {inspectingSchedule.academicYearName || '2026–2027'}
                  </span>
                  {inspectingSchedule.isAcademicYearActive && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Live Active Cycle
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Academic Department:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {inspectingSchedule.departmentName || 'General Academic Department'} ({inspectingSchedule.departmentCode || 'DEPT'})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Campus Branch:</span>
                <p className="font-bold text-slate-900 mt-0.5">{inspectingSchedule.branchName} ({inspectingSchedule.branchCode})</p>
              </div>
              <div>
                <span className="text-slate-400">Course:</span>
                <p className="font-bold text-slate-900">{inspectingSchedule.courseCode} - {inspectingSchedule.courseName}</p>
              </div>
              <div>
                <span className="text-slate-400">Faculty Lecturer:</span>
                <p className="font-bold text-slate-900">{inspectingSchedule.lecturerName} ({inspectingSchedule.lecturerCode})</p>
              </div>
              <div>
                <span className="text-slate-400">Classroom:</span>
                <p className="font-bold text-slate-900">{inspectingSchedule.classroomNumber} ({inspectingSchedule.classroomCapacity} capacity)</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Class Session & Timing:</span>
                <p className="font-bold text-brand-navy flex items-center gap-1.5 mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    inspectingSchedule.sessionNumber === 3 || (inspectingSchedule.selected_sessions && inspectingSchedule.selected_sessions.length === 2)
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-extrabold'
                      : inspectingSchedule.sessionNumber === 2
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-blue-50 text-brand-blue border-blue-200'
                  }`}>
                    {inspectingSchedule.sessionNumber === 3 || (inspectingSchedule.selected_sessions && inspectingSchedule.selected_sessions.length === 2)
                      ? 'Dual Session (1 & 2)'
                      : inspectingSchedule.sessionLabel || `Session ${inspectingSchedule.sessionNumber || 1}`}
                  </span>
                  <span>
                    {inspectingSchedule.effectiveStartTime12h} – {inspectingSchedule.effectiveEndTime12h} ({inspectingSchedule.effectiveStartTime} – {inspectingSchedule.effectiveEndTime})
                  </span>
                  <span className="text-slate-400 font-normal">
                    • {inspectingSchedule.duration_minutes || 90} mins
                  </span>
                </p>
                <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                  Time Window: {inspectingSchedule.timeSlotDay} &bull; {inspectingSchedule.timeSlotPeriod} Period
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Linked Class Sections:</span>
              <div className="flex flex-wrap gap-2">
                {inspectingSchedule.linkedSectionNames.map((name, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-mono font-semibold">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {inspectingSchedule.remarks && (
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Remarks & Notes:</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {inspectingSchedule.remarks}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setInspectingSchedule(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) deleteSchedule(deleteConfirmId);
        }}
        title="Delete Operational Schedule?"
        message="This will remove the schedule record, dissociate linked sections, and remove any assigned bookings."
        confirmLabel="Delete Record"
      />
    </div>
  );
};
