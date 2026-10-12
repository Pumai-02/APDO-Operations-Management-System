import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { HydratedSchedule, ClassSection, Lecturer } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import {
  exportScheduleToPDF,
  exportScheduleToExcel,
  exportScheduleToCSV,
  ScheduleExportMeta
} from '../utils/scheduleExport';
import {
  formatTime12h,
  formatTime24h,
  getSessionTimes,
  calculateDurationMinutes
} from '../utils/timeFormat';
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  ListFilter,
  Users2,
  UserCheck,
  Building2,
  GraduationCap,
  DoorOpen,
  Clock,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Award,
  FileCheck,
  FileCheck2,
  Stamp,
  PenTool,
  CheckCircle,
  ShieldCheck,
  Loader2,
  XCircle,
  RotateCcw,
  Building,
  Filter,
  ExternalLink
} from 'lucide-react';

export const SchedulePreviewPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const {
    hydratedSchedules,
    academicYears,
    semesters,
    branches,
    departments,
    majors,
    courses,
    batches,
    classSections,
    lecturers,
    lecturerBranches,
    timeSlots,
    scheduleClassSections,
    approvalHistory,
    users
  } = useOperations();

  // Find linked lecturer profile if current user is LECTURER
  const myLecturerProfile = useMemo(() => {
    return lecturers.find(l => l.user_id === currentUser.id);
  }, [lecturers, currentUser]);

  // Find assigned department if current user is DEAN
  const userDeanDept = useMemo(() => {
    return departments.find(d => d.dean_user_id === currentUser.id);
  }, [departments, currentUser]);

  // Mode selection: 'student' or 'lecturer'
  // If user is LECTURER, default to 'lecturer' mode
  const [scheduleMode, setScheduleMode] = useState<'student' | 'lecturer'>(
    currentRole === 'LECTURER' ? 'lecturer' : 'student'
  );

  // Layout presentation: 'official' (Western University Document Format matching user photo), 'table', or 'matrix'
  const [viewFormat, setViewFormat] = useState<'official' | 'table' | 'matrix'>('official');

  // Common Academic Filters - Default to Year 4 Batch 21 Computer Science Evening
  const [selectedYearId, setSelectedYearId] = useState<string>('2'); // Default 2026-2027
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('1'); // Default Semester 1

  // Dynamically extract distinct periods from database time_slots table
  const availablePeriods = useMemo(() => {
    const list = Array.from(new Set(timeSlots.map(t => t.period).filter(Boolean))) as ('Morning' | 'Afternoon' | 'Evening')[];
    return list.length > 0 ? list : (['Morning', 'Afternoon', 'Evening'] as const);
  }, [timeSlots]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('Evening'); // Default Evening Shift
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('6'); // Default Batch 21
  const [selectedBranchId, setSelectedBranchId] = useState<string>('1'); // Toul Kork Campus (TK-01)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(() => {
    if (currentRole === 'DEAN' && userDeanDept) {
      return userDeanDept.id;
    }
    return 'all';
  });
  const [selectedMajorId, setSelectedMajorId] = useState<string>('1'); // CSE402
  const [selectedSectionId, setSelectedSectionId] = useState<string>('8'); // CS-Y4-Batch21

  // Loading state for smooth transitions during Campus switching to clear stale schedules
  const [isLoadingCampus, setIsLoadingCampus] = useState<boolean>(false);

  // Official Approval Document Modal State
  const [isOfficialDocModalOpen, setIsOfficialDocModalOpen] = useState<boolean>(false);
  const [selectedOfficialSchedule, setSelectedOfficialSchedule] = useState<HydratedSchedule | null>(null);

  // Lecturer Mode Filters
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(() => {
    if (currentRole === 'LECTURER' && myLecturerProfile) {
      return myLecturerProfile.id;
    }
    return lecturers[0]?.id || '1';
  });

  // Extract session configuration per academic period
  const periodTimeSlotDefinitions = useMemo(() => {
    return availablePeriods.map(p => {
      const slot = timeSlots.find(t => t.period === p) || timeSlots[0];
      const s1 = getSessionTimes(slot, 1);
      const s2 = getSessionTimes(slot, 2);
      const breakStart12 = formatTime12h(slot.break_start || '19:00:00');
      const breakEnd12 = formatTime12h(slot.break_end || '19:10:00');
      const breakDuration = slot.break_duration_minutes || calculateDurationMinutes(slot.break_start, slot.break_end) || 10;
      return {
        period: p,
        slot,
        session1: s1,
        session2: s2,
        breakStart12,
        breakEnd12,
        breakDuration
      };
    });
  }, [availablePeriods, timeSlots]);

  // Dependent cascading lists based strictly on selected Campus (selectedBranchId)
  const availableDepartments = useMemo(() => {
    if (selectedBranchId === 'all') return departments;
    return departments.filter(d => {
      // Direct campus mapping
      if (d.branch_id && d.branch_id === selectedBranchId) return true;
      // University-wide / unassigned branch
      if (!d.branch_id) return true;
      // Indirect association through academic majors offered at this campus
      return majors.some(m => m.department_id === d.id && m.branch_id === selectedBranchId);
    });
  }, [departments, majors, selectedBranchId]);

  const availableBatches = useMemo(() => {
    if (selectedBranchId === 'all') return batches;
    return batches.filter(b => b.branch_id === selectedBranchId);
  }, [batches, selectedBranchId]);

  const availableMajors = useMemo(() => {
    return majors.filter(m => {
      if (selectedBranchId !== 'all' && m.branch_id !== selectedBranchId) return false;
      if (selectedDepartmentId !== 'all' && m.department_id !== selectedDepartmentId) return false;
      return true;
    });
  }, [majors, selectedBranchId, selectedDepartmentId]);

  const availableSections = useMemo(() => {
    return classSections.filter(s => {
      if (selectedBranchId !== 'all' && s.branch_id !== selectedBranchId) return false;
      if (selectedBatchId !== 'all' && s.batch_id !== selectedBatchId) return false;
      if (selectedMajorId !== 'all' && s.major_id !== selectedMajorId) return false;
      if (selectedDepartmentId !== 'all') {
        const m = majors.find(maj => maj.id === s.major_id);
        if (m && m.department_id !== selectedDepartmentId) return false;
      }
      return true;
    });
  }, [classSections, selectedBranchId, selectedBatchId, selectedMajorId, selectedDepartmentId, majors]);

  const availableLecturers = useMemo(() => {
    if (selectedBranchId === 'all') return lecturers;
    const validLecturerIds = new Set(
      lecturerBranches
        .filter(lb => lb.branch_id === selectedBranchId)
        .map(lb => lb.lecturer_id)
    );
    return lecturers.filter(l => validLecturerIds.has(l.id));
  }, [lecturers, lecturerBranches, selectedBranchId]);

  // Robust Campus Switch handler with immediate state refresh and dependent filter cascade
  const handleCampusChange = (newBranchId: string) => {
    setIsLoadingCampus(true);
    setSelectedBranchId(newBranchId);

    // 1. Department Reset if not valid for new campus (keep locked for Deans)
    if (currentRole === 'DEAN' && userDeanDept) {
      setSelectedDepartmentId(userDeanDept.id);
    } else {
      setSelectedDepartmentId('all');
    }

    // 2. Batch Reset if not valid for new campus
    const newValidBatches = newBranchId === 'all'
      ? batches
      : batches.filter(b => b.branch_id === newBranchId);
    if (selectedBatchId !== 'all' && !newValidBatches.some(b => b.id === selectedBatchId)) {
      setSelectedBatchId(newValidBatches[0]?.id || 'all');
    }

    // 3. Major Reset if not valid for new campus
    const newValidMajors = newBranchId === 'all'
      ? majors
      : majors.filter(m => m.branch_id === newBranchId);
    if (selectedMajorId !== 'all' && !newValidMajors.some(m => m.id === selectedMajorId)) {
      setSelectedMajorId(newValidMajors[0]?.id || 'all');
    }

    // 4. Section Reset if not valid for new campus
    const newValidSections = classSections.filter(s => newBranchId === 'all' || s.branch_id === newBranchId);
    if (selectedSectionId !== 'all' && !newValidSections.some(s => s.id === selectedSectionId)) {
      setSelectedSectionId(newValidSections[0]?.id || 'all');
    }

    // 5. Lecturer Reset in Lecturer mode (if user is Admin or Dean viewing lecturer)
    if (scheduleMode === 'lecturer' && currentRole !== 'LECTURER') {
      const newValidLecturers = newBranchId === 'all'
        ? lecturers
        : lecturers.filter(l => lecturerBranches.some(lb => lb.lecturer_id === l.id && lb.branch_id === newBranchId));
      if (!newValidLecturers.some(l => l.id === selectedLecturerId)) {
        setSelectedLecturerId(newValidLecturers[0]?.id || lecturers[0]?.id || '');
      }
    }

    // Clear stale official schedule target
    setSelectedOfficialSchedule(null);

    // Simulated short async transition to avoid UI flickering and guarantee clean data rendering
    setTimeout(() => {
      setIsLoadingCampus(false);
    }, 220);
  };

  // Active Target Information
  const activeYear = academicYears.find(y => y.id === selectedYearId);
  const activeSemester = semesters.find(s => s.id === selectedSemesterId);
  const activeBatch = batches.find(b => b.id === selectedBatchId);
  const activeSection = classSections.find(s => s.id === selectedSectionId);
  const activeMajor = activeSection ? majors.find(m => m.id === activeSection.major_id) : majors.find(m => m.id === selectedMajorId);
  const activeBranch = branches.find(b => b.id === selectedBranchId);
  const effectiveDeptId = (currentRole === 'DEAN' && userDeanDept) ? userDeanDept.id : selectedDepartmentId;
  const activeDepartment = departments.find(d => d.id === effectiveDeptId);

  // Active Lecturer in Lecturer Mode
  const effectiveLecturerId = currentRole === 'LECTURER' && myLecturerProfile ? myLecturerProfile.id : selectedLecturerId;
  const activeLecturer = lecturers.find(l => l.id === effectiveLecturerId);

  // Cross-campus check for lecturer
  const lecturerAssignedBranches = useMemo(() => {
    if (!activeLecturer) return [];
    const branchIds = lecturerBranches
      .filter(lb => lb.lecturer_id === activeLecturer.id)
      .map(lb => lb.branch_id);
    return branches.filter(b => branchIds.includes(b.id));
  }, [activeLecturer, lecturerBranches, branches]);

  // Lecturer teaching breakdown by period and branch
  const lecturerPeriodSummary = useMemo(() => {
    if (scheduleMode !== 'lecturer' || !activeLecturer) return null;
    const lecturerAllSchedules = hydratedSchedules.filter(
      s => s.lecturer_id === effectiveLecturerId && s.semester_id === selectedSemesterId
    );
    const periodsUsed = Array.from(new Set(lecturerAllSchedules.map(s => s.timeSlotPeriod).filter(Boolean)));
    const branchMap = new Map<string, Set<string>>();
    lecturerAllSchedules.forEach(s => {
      const bName = s.branchName || 'Campus';
      const p = s.timeSlotPeriod || 'Morning';
      if (!branchMap.has(bName)) branchMap.set(bName, new Set());
      branchMap.get(bName)!.add(p);
    });
    return {
      periodsUsed,
      totalSessions: lecturerAllSchedules.length,
      branchBreakdown: Array.from(branchMap.entries()).map(([branch, perSet]) => ({
        branch,
        periods: Array.from(perSet)
      }))
    };
  }, [scheduleMode, activeLecturer, hydratedSchedules, effectiveLecturerId, selectedSemesterId]);

  // Schedules filtered according to selected mode, academic year, campus, department, period, session, and batch
  const filteredSchedules = useMemo(() => {
    return hydratedSchedules.filter(s => {
      // Academic Year filter
      if (selectedYearId !== 'all') {
        const schedYear = s.academic_year_id || s.academicYearId;
        if (schedYear && schedYear !== selectedYearId) return false;
      }

      // Semester filter
      if (s.semester_id !== selectedSemesterId) return false;

      // 1. Campus / Branch filter - Direct relationship
      if (selectedBranchId !== 'all') {
        const directBranchMatch = s.branch_id === selectedBranchId;
        const sectionBranchMatch = scheduleClassSections.some(link => {
          if (link.schedule_id !== s.id) return false;
          const sec = classSections.find(c => c.id === link.class_section_id);
          return sec?.branch_id === selectedBranchId;
        });
        if (!directBranchMatch && !sectionBranchMatch) return false;
      }

      // 2. Department filter (Role-Enforced)
      if (currentRole === 'DEAN' && userDeanDept) {
        const directDeptMatch = s.departmentId === userDeanDept.id || s.department_id === userDeanDept.id;
        const courseDeptMatch = (() => {
          const cr = courses.find(c => c.id === s.course_id);
          return cr?.department_id === userDeanDept.id;
        })();
        const majorDeptMatch = scheduleClassSections.some(link => {
          if (link.schedule_id !== s.id) return false;
          const sec = classSections.find(c => c.id === link.class_section_id);
          if (!sec) return false;
          const m = majors.find(maj => maj.id === sec.major_id);
          return m?.department_id === userDeanDept.id;
        });
        if (!directDeptMatch && !courseDeptMatch && !majorDeptMatch) return false;
      } else if (selectedDepartmentId !== 'all') {
        const directDeptMatch = s.departmentId === selectedDepartmentId || s.department_id === selectedDepartmentId;
        const courseDeptMatch = (() => {
          const cr = courses.find(c => c.id === s.course_id);
          return cr?.department_id === selectedDepartmentId;
        })();
        const majorDeptMatch = scheduleClassSections.some(link => {
          if (link.schedule_id !== s.id) return false;
          const sec = classSections.find(c => c.id === link.class_section_id);
          if (!sec) return false;
          const m = majors.find(maj => maj.id === sec.major_id);
          return m?.department_id === selectedDepartmentId;
        });
        if (!directDeptMatch && !courseDeptMatch && !majorDeptMatch) return false;
      }

      // 3. Time Window / Period filter
      if (selectedPeriod !== 'all' && s.timeSlotPeriod !== selectedPeriod) {
        return false;
      }

      // 4. Class Session filter (Session 1 vs Session 2 vs Dual Session 3)
      if (selectedSession !== 'all') {
        const targetSessionNum = parseInt(selectedSession, 10);
        if (targetSessionNum === 3) {
          if (s.sessionNumber !== 3 && (!s.selected_sessions || s.selected_sessions.length !== 2)) return false;
        } else {
          const sSessions = (s.selected_sessions && s.selected_sessions.length > 0)
            ? s.selected_sessions
            : (s.sessionNumber === 3 ? [1, 2] : [s.sessionNumber || 1]);
          if (!sSessions.includes(targetSessionNum as 1 | 2)) {
            return false;
          }
        }
      }

      // 5. Academic Batch filter
      if (selectedBatchId !== 'all') {
        const directMatch = s.batchId === selectedBatchId || s.batch_id === selectedBatchId;
        const sectionMatch = scheduleClassSections.some(link => {
          if (link.schedule_id !== s.id) return false;
          const sec = classSections.find(c => c.id === link.class_section_id);
          return sec?.batch_id === selectedBatchId;
        });
        if (!directMatch && !sectionMatch) {
          return false;
        }
      }

      // 6. Mode-specific filters
      if (scheduleMode === 'student') {
        if (selectedSectionId !== 'all') {
          // Must be linked to the selected class section
          const isLinkedToSection = scheduleClassSections.some(
            link => link.schedule_id === s.id && link.class_section_id === selectedSectionId
          );
          return isLinkedToSection;
        } else if (selectedMajorId !== 'all') {
          // If All Sections selected, filter by Major
          const isLinkedToMajor = scheduleClassSections.some(link => {
            if (link.schedule_id !== s.id) return false;
            const sec = classSections.find(c => c.id === link.class_section_id);
            return sec?.major_id === selectedMajorId;
          });
          return isLinkedToMajor;
        }
        return true;
      } else {
        // Lecturer mode: Must be assigned to the selected lecturer
        return s.lecturer_id === effectiveLecturerId;
      }
    });
  }, [
    hydratedSchedules,
    selectedSemesterId,
    selectedBranchId,
    selectedDepartmentId,
    selectedPeriod,
    selectedSession,
    selectedBatchId,
    scheduleMode,
    selectedSectionId,
    selectedMajorId,
    effectiveLecturerId,
    scheduleClassSections,
    classSections,
    courses,
    majors
  ]);

  // Extract representative approval metadata from current filtered schedules or selected official schedule
  const activeApprovalMeta = useMemo(() => {
    if (filteredSchedules.length === 0 && !selectedOfficialSchedule) return null;

    // Target specific selected schedule if viewing official modal, or representative schedule from filtered items
    const fullyApproved = filteredSchedules.find(s => s.status === 'FULLY_APPROVED');
    const adminApproved = filteredSchedules.find(s => s.status === 'ADMIN_APPROVED');
    const rep = selectedOfficialSchedule || fullyApproved || adminApproved || filteredSchedules[0];

    if (!rep) return null;

    const hasAdminApproval = Boolean(rep.admin_signature_url && rep.admin_stamp_url);
    const hasDeanVerification = Boolean(
      (rep.status === 'FULLY_APPROVED' || rep.status === 'DEAN_CHECKED') && rep.dean_signature_url
    );
    const isFullyApproved = rep.status === 'FULLY_APPROVED' && hasAdminApproval && hasDeanVerification;

    return {
      schedule: rep,
      status: rep.status,
      isFullyApproved,
      hasAdminApproval,
      hasDeanVerification,
      departmentName: rep.departmentName || 'Department of Computer Science & Information Technology',
      departmentCode: rep.departmentCode || 'CSIT',
      facultyName: rep.facultyName || 'Faculty of Science and Technology',
      adminName: rep.adminApproverName || 'Dr. Sarah Sterling',
      adminRole: rep.adminApproverRole || 'Administrator',
      adminApprovedAt: rep.admin_approved_at,
      adminSignatureUrl: rep.admin_signature_url,
      adminStampUrl: rep.admin_stamp_url,
      adminRemarks: rep.admin_remarks,
      deanName: rep.deanCheckerName || rep.departmentDeanName || 'Assigned Department Dean',
      deanRole: rep.deanCheckerRole || 'Dean',
      deanCheckedAt: rep.dean_checked_at,
      deanSignatureUrl: rep.dean_signature_url,
      deanRemarks: rep.dean_remarks,
      rejectionReason: rep.rejection_reason,
      revisionRequestedReason: rep.revision_requested_reason
    };
  }, [filteredSchedules, selectedOfficialSchedule]);

  // Metadata for export and print
  const exportMeta: ScheduleExportMeta = useMemo(() => {
    const isStudent = scheduleMode === 'student';
    const target = isStudent
      ? (activeSection?.display_name || activeSection?.section_name || (selectedSectionId === 'all' ? 'All Cohort Sections' : 'Cohort Section'))
      : (activeLecturer ? `${activeLecturer.name} (${activeLecturer.lecturer_code})` : 'Faculty Member');

    const totalHours = filteredSchedules.length * 1.5;

    return {
      type: isStudent ? 'student' : 'lecturer',
      title: isStudent ? 'Official Student Cohort Schedule' : 'Official Faculty Teaching Schedule',
      targetName: target,
      academicYear: activeYear?.name || '2026-2027',
      semester: activeSemester?.name || 'Semester 1',
      periodName: selectedPeriod === 'all' ? 'All Periods' : selectedPeriod,
      sessionName: selectedSession === 'all' ? 'All Sessions (1 & 2)' : `Session ${selectedSession}`,
      sessionNumber: selectedSession !== 'all' ? parseInt(selectedSession, 10) : undefined,
      batchName: activeBatch ? activeBatch.batch_name : (selectedBatchId === 'all' ? 'All Batches' : undefined),
      batchCode: activeBatch ? activeBatch.batch_code : undefined,
      departmentName: activeApprovalMeta?.departmentName,
      departmentCode: activeApprovalMeta?.departmentCode,
      facultyName: activeApprovalMeta?.facultyName,
      branchName: activeBranch
        ? activeBranch.name
        : (selectedBranchId === 'all'
            ? 'All Campuses'
            : (lecturerAssignedBranches.map(b => b.name).join(' & ') || 'Campus Branch')),
      majorName: isStudent ? activeMajor?.name : activeLecturer?.specialization,
      headcountOrQuota: isStudent
        ? `${activeSection?.student_count || 0} Students Enrolled`
        : `${totalHours}h / ${activeLecturer?.max_hours_per_week || 20}h Quota`,
      generatedBy: currentUser.name,
      generatedAt: new Date().toISOString(),
      approvalStatus: activeApprovalMeta?.status,
      isFullyApproved: activeApprovalMeta?.isFullyApproved,
      adminName: activeApprovalMeta?.adminName,
      adminRole: activeApprovalMeta?.adminRole,
      adminApprovedAt: activeApprovalMeta?.adminApprovedAt,
      adminSignatureUrl: activeApprovalMeta?.adminSignatureUrl,
      adminStampUrl: activeApprovalMeta?.adminStampUrl,
      adminRemarks: activeApprovalMeta?.adminRemarks,
      deanName: activeApprovalMeta?.deanName,
      deanRole: activeApprovalMeta?.deanRole,
      deanCheckedAt: activeApprovalMeta?.deanCheckedAt,
      deanSignatureUrl: activeApprovalMeta?.deanSignatureUrl,
      deanRemarks: activeApprovalMeta?.deanRemarks
    };
  }, [
    scheduleMode,
    selectedPeriod,
    selectedSession,
    selectedBatchId,
    activeBatch,
    activeSection,
    activeLecturer,
    activeYear,
    activeSemester,
    activeBranch,
    activeMajor,
    lecturerAssignedBranches,
    filteredSchedules,
    currentUser,
    activeApprovalMeta,
    selectedBranchId,
    selectedSectionId
  ]);

  // Handlers for Export Actions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    await exportScheduleToPDF(filteredSchedules, exportMeta);
  };

  const handleExportExcel = () => {
    exportScheduleToExcel(filteredSchedules, exportMeta);
  };

  const handleExportCSV = () => {
    exportScheduleToCSV(filteredSchedules, exportMeta);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const periods = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="space-y-6">
      {/* Page Title & Control Bar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-blue" />
            Schedule Preview, Printing & Export Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export official, read-only timetable documents for student cohorts and faculty teaching schedules.
          </p>
        </div>

        {/* Schedule Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold shadow-inner">
          <button
            onClick={() => setScheduleMode('student')}
            disabled={currentRole === 'LECTURER'}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              scheduleMode === 'student'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={currentRole === 'LECTURER' ? 'Lecturers can only view their own teaching schedules' : 'Preview Student Cohort Schedule'}
          >
            <Users2 className="w-4 h-4 text-brand-blue" />
            <span>Student Cohort Schedule</span>
          </button>

          <button
            onClick={() => setScheduleMode('lecturer')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              scheduleMode === 'lecturer'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>Lecturer Teaching Schedule</span>
          </button>
        </div>
      </div>

      {/* Filter and Action Bar (Hidden when printing) */}
      <div className="no-print card-enterprise p-5 bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter Document Scope
            </span>
            {scheduleMode === 'student' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue font-bold text-[10px]">
                Read-Only Student Preview
              </span>
            )}
            {scheduleMode === 'lecturer' && (
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[10px]">
                Faculty Timetable
              </span>
            )}
          </div>

          {/* Action Buttons: Print, PDF, Excel, CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Format Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs mr-2">
              <button
                onClick={() => setViewFormat('official')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                  viewFormat === 'official' ? 'bg-white text-brand-navy shadow-xs font-bold text-blue-900' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Official Western University Schedule Document layout (matching the Directorate format)"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Official Timetable</span>
              </button>
              <button
                onClick={() => setViewFormat('table')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
                  viewFormat === 'table' ? 'bg-white text-brand-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Operations list view with detailed session columns"
              >
                <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                <span>Operations Table</span>
              </button>
              <button
                onClick={() => setViewFormat('matrix')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
                  viewFormat === 'matrix' ? 'bg-white text-brand-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Weekly matrix view"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Matrix Grid</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedYearId('2');
                  setSelectedSemesterId('1');
                  setSelectedPeriod('Evening');
                  setSelectedSession('all');
                  handleCampusChange('1');
                  setSelectedDepartmentId('all');
                  setSelectedMajorId('1');
                  setSelectedBatchId('6');
                  setSelectedSectionId('8');
                  setViewFormat('official');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Quickly load the official Year 4 - Semester 1 - Batch 21 Computer Science timetable (Toul Kork Campus)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                <span>Toul Kork (Batch 21)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedYearId('2');
                  setSelectedSemesterId('1');
                  setSelectedPeriod('all');
                  setSelectedSession('all');
                  handleCampusChange('2');
                  setSelectedDepartmentId('all');
                  setSelectedBatchId('4');
                  setSelectedSectionId('5');
                  setViewFormat('table');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Quickly load Metro Center Operations Branch"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-200" />
                <span>Metro Center (Campus 2)</span>
              </button>
            </div>

            {/* View Official Document Action */}
            <button
              onClick={() => {
                const rep = filteredSchedules.find(s => s.status === 'FULLY_APPROVED') ||
                            filteredSchedules.find(s => s.status === 'ADMIN_APPROVED') ||
                            filteredSchedules[0] || null;
                setSelectedOfficialSchedule(rep);
                setIsOfficialDocModalOpen(true);
              }}
              disabled={filteredSchedules.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Inspect official signed & stamped approval document"
            >
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>View Official Document</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Open browser print dialog (A4 landscape preview)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Print Schedule</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy hover:bg-brand-navyHover text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Generate and download official PDF document"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Export structured Excel (.xlsx) file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Export CSV document"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 text-xs">
          {/* Campus Branch Filter (Applies to both Student & Lecturer modes) */}
          <div className="sm:col-span-1">
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-brand-blue" />
              <span>Campus Branch *</span>
            </label>
            <select
              value={selectedBranchId}
              onChange={e => handleCampusChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-blue-50/60 border border-brand-blue/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue font-bold text-brand-navy"
            >
              <option value="all">All Campuses</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Academic Department Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>Department</span>
              </span>
              {currentRole === 'DEAN' && (
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded font-bold border border-indigo-200">
                  Dean Assigned
                </span>
              )}
            </label>
            <select
              value={currentRole === 'DEAN' && userDeanDept ? userDeanDept.id : selectedDepartmentId}
              disabled={currentRole === 'DEAN'}
              onChange={e => setSelectedDepartmentId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium text-slate-800 disabled:opacity-85 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
            >
              {currentRole !== 'DEAN' && <option value="all">All Departments ({departments.length})</option>}
              {availableDepartments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name} {currentRole === 'DEAN' && userDeanDept?.id === d.id ? '★ (Your Assigned Dept)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Academic Year</label>
            <select
              value={selectedYearId}
              onChange={e => setSelectedYearId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name} {y.is_active ? '(Active)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Operating Semester</label>
            <select
              value={selectedSemesterId}
              onChange={e => setSelectedSemesterId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Academic Batch Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Academic Batch</span>
            </label>
            <select
              value={selectedBatchId}
              onChange={e => {
                const newBatchId = e.target.value;
                setSelectedBatchId(newBatchId);
                if (newBatchId !== 'all') {
                  const matchSec = availableSections.find(s => s.batch_id === newBatchId);
                  if (matchSec) setSelectedSectionId(matchSec.id);
                }
              }}
              className="w-full px-2.5 py-1.5 bg-purple-50/50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold text-purple-900"
            >
              <option value="all">All Batches (Cohorts)</option>
              {availableBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batch_code} - {b.batch_name} {!b.is_active ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Period Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              <span>Time Window</span>
            </label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-semibold text-brand-navy"
            >
              <option value="all">All Windows (Full Day)</option>
              {availablePeriods.map(p => (
                <option key={p} value={p}>{p} Window</option>
              ))}
            </select>
          </div>

          {/* Class Session Filter (Session 1, Session 2, or Dual Session) */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Class Session</span>
            </label>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-blue-50/60 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue font-bold text-brand-navy"
            >
              <option value="all">All Sessions (1 & 2)</option>
              <option value="1">Session 1</option>
              <option value="2">Session 2</option>
              <option value="3">Dual Session (1 & 2)</option>
            </select>
          </div>

          {/* MODE-SPECIFIC FILTERS */}
          {scheduleMode === 'student' ? (
            <>
              {/* Major / Program */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Major / Program</label>
                <select
                  value={selectedMajorId}
                  onChange={e => setSelectedMajorId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium text-slate-800"
                >
                  <option value="all">All Programs</option>
                  {availableMajors.map(m => (
                    <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>

              {/* Class Section */}
              <div className="xl:col-span-1">
                <label className="block font-semibold text-slate-600 mb-1">Cohort Section *</label>
                <select
                  value={selectedSectionId}
                  onChange={e => setSelectedSectionId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-semibold text-brand-navy"
                >
                  <option value="all">All Cohort Sections</option>
                  {availableSections.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.section_name} ({sec.student_count} Students)
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* LECTURER MODE FILTERS */
            <div className="xl:col-span-2">
              <label className="block font-semibold text-slate-600 mb-1">
                Faculty Lecturer {currentRole === 'LECTURER' ? '(Locked to Your Profile)' : '*'}
              </label>
              <select
                value={effectiveLecturerId}
                onChange={e => setSelectedLecturerId(e.target.value)}
                disabled={currentRole === 'LECTURER' && !!myLecturerProfile}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-semibold text-brand-navy disabled:bg-slate-100"
              >
                {availableLecturers.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.lecturer_code}) — {l.specialization}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Lecturer Assigned Periods and Multi-Branch Summary */}
      {scheduleMode === 'lecturer' && lecturerPeriodSummary && (
        <div className="no-print p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700 shrink-0" />
            <span>
              <strong>Assigned Teaching Periods:</strong>{' '}
              {lecturerPeriodSummary.periodsUsed.length > 0
                ? lecturerPeriodSummary.periodsUsed.map(p => `${p} Period`).join(', ')
                : 'None currently scheduled'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lecturerPeriodSummary.branchBreakdown.map((item, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-white border border-purple-200 text-[10px] font-semibold text-purple-800">
                {item.branch}: {item.periods.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Campus Notification for Multi-Branch Lecturers */}
      {scheduleMode === 'lecturer' && lecturerAssignedBranches.length > 1 && (
        <div className="no-print p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-brand-navy flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-brand-blue shrink-0" />
          <span>
            <strong>Multi-Campus Assignment:</strong> This faculty member is appointed across{' '}
            <strong>{lecturerAssignedBranches.map(b => b.name).join(' and ')}</strong>. Teaching sessions are distinguished by campus below.
          </span>
        </div>
      )}

      {/* Institutional Authorization Status Banner */}
      {activeApprovalMeta && (
        <div
          className="no-print p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs transition-all mb-2"
          style={{
            backgroundColor: activeApprovalMeta.isFullyApproved
              ? '#ecfdf5'
              : activeApprovalMeta.hasAdminApproval
              ? '#fffbeb'
              : activeApprovalMeta.status === 'REJECTED'
              ? '#fef2f2'
              : activeApprovalMeta.status === 'RETURNED_FOR_REVISION'
              ? '#fff7ed'
              : '#f8fafc',
            borderColor: activeApprovalMeta.isFullyApproved
              ? '#a7f3d0'
              : activeApprovalMeta.hasAdminApproval
              ? '#fde68a'
              : activeApprovalMeta.status === 'REJECTED'
              ? '#fecaca'
              : activeApprovalMeta.status === 'RETURNED_FOR_REVISION'
              ? '#fed7aa'
              : '#e2e8f0'
          }}
        >
          <div className="flex items-center gap-2.5">
            {activeApprovalMeta.isFullyApproved ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : activeApprovalMeta.hasAdminApproval ? (
              <Stamp className="w-5 h-5 text-amber-600 shrink-0" />
            ) : activeApprovalMeta.status === 'REJECTED' ? (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : activeApprovalMeta.status === 'RETURNED_FOR_REVISION' ? (
              <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <div>
              <span className="font-bold text-slate-900 block">
                {activeApprovalMeta.isFullyApproved
                  ? 'Official Institutional Status: Fully Approved Timetable'
                  : activeApprovalMeta.hasAdminApproval
                  ? 'Stage 1 Completed: Administrator Approved & Stamped • Awaiting Dean Verification'
                  : activeApprovalMeta.status === 'REJECTED'
                  ? 'Schedule Status: Rejected by Reviewer'
                  : activeApprovalMeta.status === 'RETURNED_FOR_REVISION'
                  ? 'Schedule Status: Returned for Revision'
                  : 'Timetable Status: Pending Administrator Review & Official Stamp'}
              </span>
              <span className="text-[11px] text-slate-600">
                {activeApprovalMeta.isFullyApproved
                  ? `Authorized under APDO Governance with Administrator signature, official round stamp (${activeApprovalMeta.adminName}), and verified Dean signature (${activeApprovalMeta.deanName}).`
                  : activeApprovalMeta.hasAdminApproval
                  ? `Administrator (${activeApprovalMeta.adminName}) has approved and stamped this schedule. Dean verification (${activeApprovalMeta.deanName}) is required for final issuance.`
                  : activeApprovalMeta.status === 'REJECTED'
                  ? `Rejection Reason: ${activeApprovalMeta.rejectionReason || activeApprovalMeta.adminRemarks || 'Classroom / lecturer conflict detected.'}`
                  : activeApprovalMeta.status === 'RETURNED_FOR_REVISION'
                  ? `Requested Revision: ${activeApprovalMeta.revisionRequestedReason || activeApprovalMeta.deanRemarks || 'Please recheck session times.'}`
                  : 'This schedule requires formal Administrator approval with signature and official stamp, followed by Dean verification.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedOfficialSchedule(activeApprovalMeta.schedule);
                setIsOfficialDocModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>View Official Document</span>
            </button>
            <StatusBadge status={activeApprovalMeta.status} size="sm" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE PRINT-READY SCHEDULE DOCUMENT CONTAINER                               */}
      {/* Visible on screen AND perfectly formatted during window.print()            */}
      {/* ========================================================================= */}
      {/* Loading state indicator during campus filter transition */}
      {isLoadingCampus ? (
        <div className="no-print bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center my-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue animate-spin">
            <Loader2 className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-navy">Updating Campus Schedule View</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Refreshing academic schedule records, cohort sections, and faculty assignments for{' '}
              <strong className="text-slate-800">{activeBranch?.name || 'Selected Campus'}</strong>...
            </p>
          </div>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center my-6 max-w-[1100px] mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Schedules Found for {activeBranch ? activeBranch.name : (selectedBranchId === 'all' ? 'All Campuses' : 'Selected Campus')}
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
            There are currently no active schedule records matching your selected filters for this campus.
            You can reset the filters, switch to an active campus branch, or generate new schedules in the Operations Generator.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => {
                setSelectedDepartmentId('all');
                setSelectedPeriod('all');
                setSelectedSession('all');
                setSelectedBatchId('all');
                if (scheduleMode === 'student') setSelectedSectionId('all');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters for this Campus</span>
            </button>
            <button
              onClick={() => {
                setSelectedYearId('2');
                setSelectedSemesterId('1');
                setSelectedPeriod('Evening');
                setSelectedSession('all');
                handleCampusChange('1');
                setSelectedDepartmentId('all');
                setSelectedBatchId('6');
                setSelectedSectionId('8');
                setViewFormat('official');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch to Toul Kork (Batch 21 Active)</span>
            </button>
            <button
              onClick={() => {
                setSelectedYearId('2');
                setSelectedSemesterId('1');
                setSelectedPeriod('all');
                setSelectedSession('all');
                handleCampusChange('2');
                setSelectedDepartmentId('all');
                setSelectedBatchId('4');
                setSelectedSectionId('5');
                setViewFormat('table');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-200" />
              <span>Switch to Metro Center (Downtown Active)</span>
            </button>
          </div>
        </div>
      ) : viewFormat === 'official' ? (
        <div className="print-document bg-white border border-slate-300 shadow-md p-6 sm:p-10 max-w-[1100px] mx-auto text-black print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
          {/* Top Institutional Header: Khmer | Academic Year | English */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-serif font-bold uppercase tracking-wider pb-1.5 border-b-2 border-black text-black">
            <span>សាកលវិទ្យាល័យ វេស្ទើន</span>
            <span className="font-sans font-bold">ACADEMIC YEAR {activeYear?.name || '2025-2026'}</span>
            <span className="font-sans font-bold">WESTERN UNIVERSITY</span>
          </div>

          {/* Sub-Header: Crest/Logo + Khmer/English (Left) | Faculty & Campus (Right) */}
          <div className="flex items-start justify-between mt-3 mb-2">
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="Western University Crest" className="w-16 h-16 object-contain" />
              <span className="text-xs font-bold text-[#1e3a8a] mt-1 font-serif">សាកលវិទ្យាល័យ វេស្ទើន</span>
              <span className="text-[10px] font-extrabold text-[#1e3a8a] uppercase tracking-wider">WESTERN UNIVERSITY</span>
            </div>

            <div className="text-right text-[#8B1E1E]">
              <div className="text-base sm:text-lg font-bold font-serif leading-tight">
                Faculty of Science and Technology
              </div>
              <div className="text-sm font-serif italic font-semibold mt-0.5">
                ({activeBranch?.name || 'Toul Kork Campus'})
              </div>
            </div>
          </div>

          {/* Centered Document Title Block */}
          <div className="text-center my-4 space-y-1 text-black">
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide font-sans">
              SCHEDULE OF YEAR {activeSection?.year_level || '4'}– SEMESTER {activeSemester?.name?.replace(/Semester\s*/i, '') || '1'} - {activeBatch?.batch_name || 'Batch 21'}
            </h1>
            <div className="text-base font-bold">
              Bachelor Degree
            </div>
            <div className="text-sm sm:text-base font-bold">
              Major: {activeMajor?.name || 'Computer Science (CSE402) and Computer Network and Technology'}
            </div>
            <div className="text-base font-bold">
              Shift: {selectedPeriod === 'all' ? 'Evening' : selectedPeriod}
            </div>
          </div>

          {/* Official Timetable Table Grid */}
          {(() => {
            const activeSlotDef = periodTimeSlotDefinitions.find(
              d => d.period === (selectedPeriod === 'all' ? 'Evening' : selectedPeriod)
            ) || periodTimeSlotDefinitions[2];

            const cleanTime = (t?: string) => {
              if (!t) return '';
              const parts = t.split(':');
              let h = parseInt(parts[0], 10);
              if (h > 12) h -= 12;
              return `${h}:${parts[1]}`;
            };

            const s1Time = activeSlotDef
              ? `${cleanTime(activeSlotDef.slot.start_time)}-${cleanTime(activeSlotDef.slot.break_start || '19:00:00')}`
              : '5:30-7:00';
            const s2Time = activeSlotDef
              ? `${cleanTime(activeSlotDef.slot.break_end || '19:10:00')}-${cleanTime(activeSlotDef.slot.end_time || '20:40:00')}`
              : '7:10-8:40';

            const officialDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

            const dayConfigs = officialDays.map(day => {
              const daySchedules = filteredSchedules.filter(
                s => s.timeSlotDay === day && (selectedPeriod === 'all' || s.timeSlotPeriod === selectedPeriod)
              );
              const s1 = daySchedules.find(s => (s.sessionNumber || 1) === 1);
              const s2 = daySchedules.find(s => (s.sessionNumber || 1) === 2);
              const isSplit = !!(s1 && s2 && s1.id !== s2.id);
              return {
                day,
                daySchedules,
                s1: s1 || daySchedules[0],
                s2: s2 || daySchedules[0],
                isSplit
              };
            });

            const renderOfficialCell = (sched?: HydratedSchedule, isFriday = false, rowSpan = 2) => {
              if (isFriday && !sched) {
                return (
                  <td rowSpan={rowSpan} className="border border-black p-3 text-center align-middle bg-white">
                    <span className="font-serif italic text-base text-black">Self-study</span>
                  </td>
                );
              }
              if (!sched) {
                return (
                  <td rowSpan={rowSpan} className="border border-black p-3 text-center align-middle bg-white">
                    <span className="font-serif italic text-sm text-slate-400">Self-study</span>
                  </td>
                );
              }

              return (
                <td rowSpan={rowSpan} className="border border-black p-2.5 text-center align-middle bg-white">
                  <div className="font-bold text-black text-xs sm:text-[13px] leading-snug">
                    {sched.courseName}
                  </div>
                  <div className="mt-2 text-[11px] text-black leading-relaxed">
                    <div>Code: {sched.courseCode}</div>
                    <div>{sched.lecturerName}</div>
                    <div>Tel: {sched.lecturerPhone || '077 426 333'}</div>
                    <div className="font-semibold">Room:{sched.classroomNumber?.replace(/^Room\s*/i, '')}</div>
                  </div>
                </td>
              );
            };

            return (
              <div className="overflow-x-auto my-3">
                <table className="w-full border-collapse border-2 border-black official-table">
                  <thead>
                    <tr className="bg-[#cfe2f3] text-black">
                      <th className="border border-black px-4 py-2.5 text-center font-bold text-xs sm:text-sm w-[13%]">
                        Date
                      </th>
                      {officialDays.map(d => (
                        <th key={d} className="border border-black px-4 py-2.5 text-center font-bold text-xs sm:text-sm w-[17.4%]">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Session 1 Hours + Classes */}
                    <tr>
                      <td className="border border-black px-3 py-6 text-center font-bold text-xs sm:text-sm text-black whitespace-nowrap bg-white">
                        {s1Time}
                      </td>
                      {dayConfigs.map(dc => {
                        if (dc.isSplit) {
                          return <React.Fragment key={dc.day}>{renderOfficialCell(dc.s1, dc.day === 'Friday', 1)}</React.Fragment>;
                        }
                        return <React.Fragment key={dc.day}>{renderOfficialCell(dc.s1, dc.day === 'Friday', 2)}</React.Fragment>;
                      })}
                    </tr>

                    {/* Row 2: Session 2 Hours + Split Classes (if any) */}
                    <tr>
                      <td className="border border-black px-3 py-6 text-center font-bold text-xs sm:text-sm text-black whitespace-nowrap bg-white">
                        {s2Time}
                      </td>
                      {dayConfigs.map(dc => {
                        if (dc.isSplit) {
                          return <React.Fragment key={dc.day}>{renderOfficialCell(dc.s2, dc.day === 'Friday', 1)}</React.Fragment>;
                        }
                        return null;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Academic Term Notes Block */}
          <div className="flex flex-wrap items-start justify-between text-xs text-black mt-2 leading-relaxed">
            <div className="space-y-0.5">
              <div>Term starts on July 20, 2026-Term ends on October 30, 2026</div>
              <div className="italic">Start Make up on November 02, 2026-End Course work on November 13, 2026</div>
            </div>
            <div className="text-right space-y-0.5 mt-1 sm:mt-0">
              <div>This schedule is subject to change.</div>
              <div>Phnom Penh, June 11, 2026</div>
            </div>
          </div>

          {/* Official Signatures & Seal Stamp Section (Two-Stage Formal Governance) */}
          <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center sm:items-start justify-between px-4 sm:px-12 gap-8 text-black">
            {/* Stage 1: Approved by Administrator with Official Stamp */}
            <div className="flex flex-col items-center text-center relative w-72">
              <div className="text-xs sm:text-sm font-serif font-bold text-black leading-snug">
                <div>Approved by Administrator</div>
                <div className="text-[11px] font-sans font-normal text-slate-600">APDO Operations Directorate</div>
              </div>

              {/* Stamp and Admin Signature Container */}
              <div className="relative my-2 w-56 h-36 flex items-center justify-center">
                {activeApprovalMeta?.adminStampUrl ? (
                  <img
                    src={activeApprovalMeta.adminStampUrl}
                    alt="Official APDO Stamp"
                    className="w-32 h-32 object-contain select-none opacity-95 transform -rotate-3 filter drop-shadow-2xs"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                ) : (
                  <div className="w-40 h-28 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50 flex flex-col items-center justify-center p-2 text-amber-800">
                    <Stamp className="w-6 h-6 text-amber-600 mb-1" />
                    <span className="text-[11px] font-bold">Pending Official Stamp</span>
                    <span className="text-[9px] text-amber-600">Awaiting Administrator Review</span>
                  </div>
                )}

                {activeApprovalMeta?.adminSignatureUrl && (
                  <img
                    src={activeApprovalMeta.adminSignatureUrl}
                    alt="Administrator Signature"
                    className="w-36 h-20 object-contain absolute top-8 left-8 select-none pointer-events-none"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                )}
              </div>

              {/* Administrator Signatory Name & Role */}
              <div className="font-serif font-bold text-black text-sm sm:text-base mt-1">
                {activeApprovalMeta?.adminName || 'Dr. Sarah Sterling'}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {activeApprovalMeta?.adminRole || 'Administrator'} •{' '}
                {activeApprovalMeta?.hasAdminApproval
                  ? `Approved ${activeApprovalMeta.adminApprovedAt ? new Date(activeApprovalMeta.adminApprovedAt).toLocaleDateString() : ''}`
                  : 'Pending Stage 1 Authorization'}
              </div>
            </div>

            {/* Stage 2: Checked & Verified by Dean with Dean Signature */}
            <div className="flex flex-col items-center text-center relative w-72">
              <div className="text-xs sm:text-sm font-serif font-bold text-black leading-snug">
                <div>Checked &amp; Verified by</div>
                <div className="text-[11px] font-sans font-normal text-slate-600">
                  {activeApprovalMeta?.departmentName || 'Department Dean'}
                </div>
              </div>

              {/* Dean Signature Container */}
              <div className="relative my-2 w-56 h-36 flex items-center justify-center">
                {activeApprovalMeta?.isFullyApproved && activeApprovalMeta?.deanSignatureUrl ? (
                  <img
                    src={activeApprovalMeta.deanSignatureUrl}
                    alt="Dean Signature"
                    className="w-44 h-24 object-contain select-none pointer-events-none"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                ) : activeApprovalMeta?.hasAdminApproval ? (
                  <div className="w-40 h-28 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 flex flex-col items-center justify-center p-2 text-blue-900">
                    <PenTool className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-[11px] font-bold">Pending Dean Verification</span>
                    <span className="text-[9px] text-blue-600">Stage 1 Completed; Awaiting Dean</span>
                  </div>
                ) : (
                  <div className="w-40 h-28 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-2 text-slate-400">
                    <span className="text-[10px] font-semibold text-center">
                      Locked: Awaiting Administrator Approval First
                    </span>
                  </div>
                )}
              </div>

              {/* Dean Signatory Name & Role */}
              <div className="font-serif font-bold text-black text-sm sm:text-base mt-1">
                {activeApprovalMeta?.deanName || 'Assigned Department Dean'}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {activeApprovalMeta?.deanRole || 'Dean'} ({activeApprovalMeta?.departmentCode || 'Faculty'}) •{' '}
                {activeApprovalMeta?.isFullyApproved
                  ? `Verified ${activeApprovalMeta.deanCheckedAt ? new Date(activeApprovalMeta.deanCheckedAt).toLocaleDateString() : ''}`
                  : 'Pending Stage 2 Verification'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="print-document card-enterprise p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative">
          {/* Document Institutional Header */}
          <div className="flex items-start justify-between pb-5 border-b-2 border-brand-navy gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/logo.png" alt="Western University" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-brand-navy tracking-tight uppercase">
                  Western University
                </div>
                <div className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                  APDO Operations Management Directorate &bull; Official Timetable
                </div>
                <div className="text-sm font-bold text-brand-blue uppercase mt-1">
                  {exportMeta.title} &bull; {selectedBatchId === 'all' ? 'ALL BATCHES' : (activeBatch?.batch_code || activeBatch?.batch_name)} &bull; {selectedPeriod === 'all' ? 'ALL TIME WINDOWS' : `${selectedPeriod.toUpperCase()} WINDOW`} &bull; {exportMeta.sessionName?.toUpperCase() || 'ALL SESSIONS'}
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-mono text-slate-400">DOC-REF: #{Date.now().toString().slice(-6)}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                OFFICIALLY ISSUED
              </div>
            </div>
          </div>

          {/* Schedule Metadata Banner Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Period:</span>
              <span className="font-bold text-slate-800">{exportMeta.academicYear} &bull; {exportMeta.semester}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Batch:</span>
              <span className="font-bold text-purple-900 flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-600 shrink-0" />
                {activeBatch ? `${activeBatch.batch_code} (${activeBatch.batch_name})` : 'All Cohorts'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Window:</span>
              <span className="font-bold text-brand-navy flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-blue shrink-0" />
                {selectedPeriod === 'all' ? 'All Windows' : `${selectedPeriod} Window`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Session:</span>
              <span className="font-bold text-blue-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                {exportMeta.sessionName || 'All Sessions (1 & 2)'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {scheduleMode === 'student' ? 'Cohort Section:' : 'Faculty Instructor:'}
              </span>
              <span className="font-bold text-slate-800 truncate block">{exportMeta.targetName}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus Branch:</span>
              <span className="font-bold text-slate-800">{exportMeta.branchName}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {scheduleMode === 'student' ? 'Enrolment:' : 'Teaching Load:'}
              </span>
              <span className="font-bold text-brand-blue">{exportMeta.headcountOrQuota}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TIME WINDOW & CLASS SESSIONS REFERENCE BREAKDOWN                          */}
          {/* Displays the two class sessions and break for the active Time Window(s)   */}
          {/* ========================================================================= */}
          <div className="my-4 p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-brand-navy text-white flex items-center justify-center font-bold text-[10px]">
                  2S
                </div>
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Time Window & Class Sessions Structure Reference
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Each academic window contains exactly two configurable class sessions with transition recess
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {periodTimeSlotDefinitions.map(({ period, slot, session1, session2, breakStart12, breakEnd12, breakDuration }) => {
                const isSelected = selectedPeriod === 'all' || selectedPeriod === period;
                if (!isSelected) return null;

                return (
                  <div
                    key={period}
                    className={`rounded-lg border p-2.5 bg-white shadow-2xs ${
                      period === 'Evening'
                        ? 'border-indigo-200 ring-1 ring-indigo-100'
                        : period === 'Afternoon'
                        ? 'border-amber-200 ring-1 ring-amber-100'
                        : 'border-blue-200 ring-1 ring-blue-100'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                      <span className="font-bold text-xs text-brand-navy flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                        {period} Time Window
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {session1.start12h} – {session2.end12h}
                      </span>
                    </div>

                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 text-[9px] uppercase font-bold">
                          <th className="py-1">Session</th>
                          <th className="py-1">Start Time</th>
                          <th className="py-1">End Time</th>
                          <th className="py-1 text-right">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        <tr className={`${selectedSession === '1' ? 'bg-blue-50/80 font-bold text-brand-blue' : ''}`}>
                          <td className="py-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            Session 1
                          </td>
                          <td className="py-1 font-mono font-semibold">{session1.start12h}</td>
                          <td className="py-1 font-mono font-semibold">{session1.end12h}</td>
                          <td className="py-1 text-right font-mono text-slate-500">{session1.durationMinutes}m</td>
                        </tr>
                        <tr className="bg-amber-50/60 text-[10px] text-amber-900">
                          <td className="py-0.5 italic font-medium" colSpan={2}>
                            ☕ Transition Break
                          </td>
                          <td className="py-0.5 font-mono font-medium">{breakStart12} – {breakEnd12}</td>
                          <td className="py-0.5 text-right font-mono font-medium">{breakDuration}m</td>
                        </tr>
                        <tr className={`${selectedSession === '2' ? 'bg-purple-50/80 font-bold text-purple-800' : ''}`}>
                          <td className="py-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                            Session 2
                          </td>
                          <td className="py-1 font-mono font-semibold">{session2.start12h}</td>
                          <td className="py-1 font-mono font-semibold">{session2.end12h}</td>
                          <td className="py-1 text-right font-mono text-slate-500">{session2.durationMinutes}m</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIEW 1: TABLE VIEW                                                       */}
          {/* ========================================================================= */}
          {viewFormat === 'table' && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#17365D] text-white text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-3 border-r border-slate-600">Day</th>
                    <th className="px-3 py-3 border-r border-slate-600">Time Window</th>
                    <th className="px-3 py-3 border-r border-slate-600">Class Session</th>
                    <th className="px-3 py-3 border-r border-slate-600">Session Hours</th>
                    <th className="px-3 py-3 border-r border-slate-600">Course Code</th>
                    <th className="px-3 py-3 border-r border-slate-600">Course Title</th>
                    <th className="px-3 py-3 border-r border-slate-600">
                      {scheduleMode === 'student' ? 'Assigned Faculty' : 'Cohort Sections'}
                    </th>
                    <th className="px-3 py-3 border-r border-slate-600">Classroom / Lab</th>
                    <th className="px-3 py-3 border-r border-slate-600">Campus</th>
                    <th className="px-3 py-3 border-r border-slate-600">Status</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-slate-400">
                        No operational sessions currently scheduled for the selected criteria (
                        {selectedPeriod === 'all' ? 'All Windows' : `${selectedPeriod} Window`}
                        {selectedSession !== 'all' ? ` • Session ${selectedSession}` : ''}
                        ).
                      </td>
                    </tr>
                  ) : (
                    (selectedPeriod === 'all' ? availablePeriods : [selectedPeriod as 'Morning' | 'Afternoon' | 'Evening']).map(period => {
                      const periodSchedules = filteredSchedules.filter(s => s.timeSlotPeriod === period);
                      if (periodSchedules.length === 0) return null;

                      const slotDef = periodTimeSlotDefinitions.find(d => d.period === period);
                      const s1Schedules = periodSchedules.filter(s => (s.sessionNumber || 1) === 1);
                      const s2Schedules = periodSchedules.filter(s => (s.sessionNumber || 1) === 2);

                      const showS1 = selectedSession === 'all' || selectedSession === '1';
                      const showS2 = selectedSession === 'all' || selectedSession === '2';

                      const renderTableRow = (s: HydratedSchedule, idx: number, sessionNum: number) => (
                        <tr
                          key={s.id}
                          className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/60 hover:bg-slate-50'}
                        >
                          <td className="px-3.5 py-2.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                            {s.timeSlotDay}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-200 font-medium whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[10px]">
                              {s.timeSlotPeriod}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-200 font-bold whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                (s.sessionNumber || sessionNum) === 2
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              Session {s.sessionNumber || sessionNum}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-200 font-mono font-bold whitespace-nowrap">
                            <span className="text-slate-900">
                              {s.effectiveStartTime12h} – {s.effectiveEndTime12h}
                            </span>
                            <span className="block text-[10px] font-normal text-slate-400">
                              ({s.effectiveStartTime?.slice(0, 5)} – {s.effectiveEndTime?.slice(0, 5)})
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-brand-blue border-r border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span>{s.courseCode}</span>
                              {s.batchCode && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-sans text-[10px] font-bold border border-purple-200" title={s.batchName}>
                                  {s.batchCode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-900 border-r border-slate-200">
                            {s.courseName}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-200">
                            {scheduleMode === 'student' ? (
                              <div>
                                <span className="font-semibold text-slate-800">{s.lecturerName}</span>
                                <span className="text-[10px] text-slate-400 block">{s.lecturerCode}</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {s.linkedSectionNames.map((sec, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-mono">
                                    {sec}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                            {s.classroomNumber}
                            <span className="text-[10px] text-slate-400 block font-normal">Cap: {s.classroomCapacity}</span>
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-200 text-slate-600">
                            <span className="inline-flex items-center gap-1 font-medium">
                              {s.branchName}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-200 whitespace-nowrap">
                            <StatusBadge status={s.status} size="sm" />
                          </td>
                          <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOfficialSchedule(s);
                                setIsOfficialDocModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 text-brand-blue border border-blue-200 hover:border-blue-300 rounded-md text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                              title="Open official signed and stamped approval document for this schedule"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Doc</span>
                            </button>
                          </td>
                        </tr>
                      );

                      return (
                        <React.Fragment key={period}>
                          {/* Prominent Period Header Row */}
                          <tr className="bg-slate-800 text-white border-t-2 border-b border-slate-700">
                            <td colSpan={11} className="px-3.5 py-2">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0"></span>
                                  <span className="uppercase tracking-wider">{period} Time Window</span>
                                  <span className="text-[11px] font-mono font-normal text-slate-300">
                                    ({slotDef ? `${slotDef.session1.start12h} – ${slotDef.session2.end12h}` : 'Configured Window'})
                                  </span>
                                </div>
                                <div className="text-[10px] font-semibold text-slate-200 bg-slate-700 px-2 py-0.5 rounded">
                                  {periodSchedules.length} Class Session{periodSchedules.length !== 1 ? 's' : ''} Scheduled
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* SESSION 1 SECTION */}
                          {showS1 && (
                            <>
                              <tr className="bg-blue-50/90 border-b border-blue-200">
                                <td colSpan={11} className="px-3.5 py-1.5">
                                  <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                        Session 1
                                      </span>
                                      <span className="font-mono text-blue-900">
                                        {slotDef?.session1.start12h} – {slotDef?.session1.end12h}
                                      </span>
                                      <span className="text-[10px] text-blue-700 font-normal">
                                        ({slotDef?.session1.durationMinutes} min Duration)
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-blue-800">
                                      {s1Schedules.length} class{s1Schedules.length !== 1 ? 'es' : ''} in Session 1
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {s1Schedules.length === 0 ? (
                                <tr>
                                  <td colSpan={11} className="px-4 py-2 text-center text-xs text-slate-400 italic bg-blue-50/20">
                                    No classes scheduled in Session 1 for {period} Window.
                                  </td>
                                </tr>
                              ) : (
                                s1Schedules.map((s, idx) => renderTableRow(s, idx, 1))
                              )}
                            </>
                          )}

                          {/* INTER-SESSION BREAK DIVIDER */}
                          {selectedSession === 'all' && (
                            <tr className="bg-amber-50/70 border-t border-b border-amber-200 text-amber-900">
                              <td colSpan={11} className="px-3.5 py-1.5">
                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                  <div className="flex items-center gap-2">
                                    <span>☕</span>
                                    <span className="uppercase tracking-wide font-bold text-[10px] text-amber-800">
                                      Inter-Session Transition Break:
                                    </span>
                                    <span className="font-mono font-bold text-amber-950">
                                      {slotDef?.breakStart12} – {slotDef?.breakEnd12}
                                    </span>
                                    <span className="text-[10px] text-amber-700">
                                      ({slotDef?.breakDuration} min intermission)
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-amber-700 font-normal italic">
                                    Classrooms cleared for Session 2 cohort transition
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* SESSION 2 SECTION */}
                          {showS2 && (
                            <>
                              <tr className="bg-purple-50/90 border-b border-purple-200">
                                <td colSpan={11} className="px-3.5 py-1.5">
                                  <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                        Session 2
                                      </span>
                                      <span className="font-mono text-purple-900">
                                        {slotDef?.session2.start12h} – {slotDef?.session2.end12h}
                                      </span>
                                      <span className="text-[10px] text-purple-700 font-normal">
                                        ({slotDef?.session2.durationMinutes} min Duration)
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-purple-800">
                                      {s2Schedules.length} class{s2Schedules.length !== 1 ? 'es' : ''} in Session 2
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {s2Schedules.length === 0 ? (
                                <tr>
                                  <td colSpan={11} className="px-4 py-2 text-center text-xs text-slate-400 italic bg-purple-50/20">
                                    No classes scheduled in Session 2 for {period} Window.
                                  </td>
                                </tr>
                              ) : (
                                s2Schedules.map((s, idx) => renderTableRow(s, idx, 2))
                              )}
                            </>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: WEEKLY MATRIX TIMETABLE VIEW                                      */}
          {/* ========================================================================= */}
          {viewFormat === 'matrix' && (
            <div className="overflow-x-auto mt-4">
              <div className="min-w-[850px] border border-slate-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-8 gap-1 bg-[#17365D] text-white p-2 text-xs font-bold uppercase text-center">
                  <div className="py-1">Time Window</div>
                  {daysOfWeek.map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                {(selectedPeriod === 'all' ? periods : [selectedPeriod]).map(period => {
                  const slotDef = periodTimeSlotDefinitions.find(d => d.period === period);

                  return (
                    <div key={period} className="grid grid-cols-8 gap-1 p-1 border-t border-slate-200 min-h-[110px]">
                      <div className="flex flex-col items-center justify-center bg-slate-100 rounded p-1.5 text-center text-xs">
                        <span className="font-bold text-brand-navy">{period}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">
                          {slotDef ? `${slotDef.session1.start12h} – ${slotDef.session2.end12h}` : 'Hours'}
                        </span>
                        <div className="mt-1 flex flex-col gap-0.5 text-[8px] font-mono text-slate-400">
                          <span>S1: {slotDef?.session1.start12h}</span>
                          <span>S2: {slotDef?.session2.start12h}</span>
                        </div>
                      </div>

                      {daysOfWeek.map(day => {
                        const cellSchedules = filteredSchedules.filter(
                          s => s.timeSlotDay === day && s.timeSlotPeriod === period
                        );

                        return (
                          <div
                            key={day}
                            className="p-1 rounded bg-slate-50/80 border border-slate-100 flex flex-col gap-1 overflow-hidden"
                          >
                            {cellSchedules.map(cs => (
                              <div
                                key={cs.id}
                                className={`p-1.5 rounded border text-left text-[11px] ${
                                  (cs.sessionNumber || 1) === 2
                                    ? 'border-purple-200 bg-purple-50/90'
                                    : 'border-blue-200 bg-blue-50/90'
                                }`}
                              >
                                <div className="font-bold text-brand-navy flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    {cs.courseCode}
                                    {cs.batchCode && (
                                      <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-800 text-[8px] font-bold">
                                        {cs.batchCode}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-500">{cs.classroomNumber}</span>
                                </div>
                                <div className="text-[10px] text-slate-600 truncate mt-0.5">{cs.courseName}</div>
                                <div className="mt-1 flex items-center justify-between gap-1">
                                  <span
                                    className={`px-1 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                      cs.sessionNumber === 3 || (cs.selected_sessions && cs.selected_sessions.length === 2)
                                        ? 'bg-indigo-200 text-indigo-900 border border-indigo-300'
                                        : (cs.sessionNumber || 1) === 2
                                        ? 'bg-purple-200 text-purple-900'
                                        : 'bg-blue-200 text-blue-900'
                                    }`}
                                  >
                                    {cs.sessionNumber === 3 || (cs.selected_sessions && cs.selected_sessions.length === 2)
                                      ? 'Dual (1&2)'
                                      : `S${cs.sessionNumber || 1}`} ({cs.effectiveStartTime12h ? cs.effectiveStartTime12h.replace(':00 ', ' ') : ''})
                                  </span>
                                  <span className="font-mono text-[8px] bg-white px-1 py-0.2 rounded border">
                                    {cs.branchCode}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                                  {scheduleMode === 'student' ? cs.lecturerName : (cs.linkedSectionNames[0] || 'Sec')}
                                </div>
                              </div>
                            ))}

                            {cellSchedules.length === 0 && (
                              <div className="h-full flex items-center justify-center text-[10px] text-slate-300">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Document Footer (Dual-Stage Signatures & Verification) */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Document Prepared By:
              </span>
              <p className="font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400">{currentUser.role} • APDO Operations Directorate</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Exported: {new Date().toLocaleString()}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Stage 1: Administrator Approval &amp; Official Stamp
              </span>
              <p className="font-bold text-slate-800">{activeApprovalMeta?.adminName || 'Dr. Sarah Sterling'}</p>
              <p className="text-[11px] text-slate-500">{activeApprovalMeta?.adminRole || 'Administrator'}</p>
              {activeApprovalMeta?.adminStampUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={activeApprovalMeta.adminStampUrl} alt="Stamp" className="w-8 h-8 object-contain" />
                  {activeApprovalMeta.adminSignatureUrl && (
                    <img src={activeApprovalMeta.adminSignatureUrl} alt="Admin Sig" className="h-6 max-w-[80px] object-contain" />
                  )}
                  <span className="text-[10px] font-bold text-emerald-700">Official Stamp Applied</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Stage 2: Dean Verification &amp; Final Signature
              </span>
              <p className="font-bold text-slate-800">{activeApprovalMeta?.deanName || 'Assigned Department Dean'}</p>
              <p className="text-[11px] text-slate-500">
                {activeApprovalMeta?.deanRole || 'Dean'} {activeApprovalMeta?.departmentName ? `• ${activeApprovalMeta.departmentName}` : ''}
              </p>
              {activeApprovalMeta?.isFullyApproved && activeApprovalMeta?.deanSignatureUrl ? (
                <div className="mt-2 flex items-center gap-2">
                  <img src={activeApprovalMeta.deanSignatureUrl} alt="Dean Sig" className="h-6 max-w-[100px] object-contain" />
                  <span className="text-[10px] font-bold text-emerald-700">Dean Signature Verified</span>
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-amber-700 font-semibold">
                  {activeApprovalMeta?.hasAdminApproval ? 'Awaiting Dean verification' : 'Awaiting Administrator approval'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL APPROVAL DOCUMENT MODAL                                          */}
      {/* Connected directly to persisted schedules, admin & dean signatures/stamps */}
      {/* ========================================================================= */}
      {isOfficialDocModalOpen && (
        <Modal
          isOpen={isOfficialDocModalOpen}
          onClose={() => {
            setIsOfficialDocModalOpen(false);
            setSelectedOfficialSchedule(null);
          }}
          title="Official Schedule Document & Institutional Approval"
          description="Western University APDO Operations Directorate • Verified Signatures & Stamp"
          maxWidth="4xl"
        >
          {(() => {
            const targetSchedule: HydratedSchedule | null =
              selectedOfficialSchedule || activeApprovalMeta?.schedule || filteredSchedules[0] || null;

            if (!targetSchedule) {
              return (
                <div className="p-8 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p>No schedule selected or available to display.</p>
                </div>
              );
            }

            const hasAdminApproval = Boolean(targetSchedule.admin_signature_url && targetSchedule.admin_stamp_url);
            const hasDeanVerification = Boolean(
              (targetSchedule.status === 'FULLY_APPROVED' || targetSchedule.status === 'DEAN_CHECKED') &&
              targetSchedule.dean_signature_url
            );
            const isFullyApproved = targetSchedule.status === 'FULLY_APPROVED' && hasAdminApproval && hasDeanVerification;

            // Audit history events for this specific schedule
            const scheduleHistory = approvalHistory
              .filter(h => h.schedule_id === targetSchedule.id)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            const targetSection = classSections.find(c => targetSchedule.linkedSectionIds?.includes(c.id));
            const targetMajor = targetSection ? majors.find(m => m.id === targetSection.major_id) : activeMajor;
            const targetMajorName = targetMajor?.name || 'Computer Science';

            return (
              <div className="space-y-6 text-slate-900">
                {/* Action & Status Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={targetSchedule.status} size="md" />
                    <span className="text-xs font-semibold text-slate-600">
                      {isFullyApproved
                        ? 'Official Institution Document • Fully Signed & Stamped'
                        : hasAdminApproval
                        ? 'Admin Approved • Pending Department Dean Verification'
                        : targetSchedule.status === 'REJECTED'
                        ? 'Rejected Schedule'
                        : targetSchedule.status === 'RETURNED_FOR_REVISION'
                        ? 'Returned for Revision'
                        : 'Draft / In Review Timetable Document'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Document</span>
                    </button>
                    <button
                      onClick={() => {
                        exportScheduleToPDF([targetSchedule], {
                          type: scheduleMode === 'student' ? 'student' : 'lecturer',
                          title: 'Official Academic Timetable Document',
                          targetName: targetSchedule.courseName || 'Official Schedule',
                          academicYear: targetSchedule.academicYearName || activeYear?.name || '2026-2027',
                          semester: activeSemester?.name || 'Semester 1',
                          branchName: targetSchedule.branchName || activeBranch?.name || 'Western University Campus',
                          periodName: targetSchedule.timeSlotPeriod,
                          sessionName: targetSchedule.sessionLabel || `Session ${targetSchedule.sessionNumber || 1}`,
                          batchName: targetSchedule.batchName || activeBatch?.batch_name,
                          batchCode: targetSchedule.batchCode || activeBatch?.batch_code,
                          departmentName: targetSchedule.departmentName,
                          departmentCode: targetSchedule.departmentCode,
                          facultyName: targetSchedule.facultyName,
                          generatedBy: currentUser.name,
                          generatedAt: new Date().toISOString(),
                          approvalStatus: targetSchedule.status,
                          isFullyApproved,
                          adminName: targetSchedule.adminApproverName || 'Dr. Sarah Sterling',
                          adminRole: targetSchedule.adminApproverRole || 'Administrator',
                          adminApprovedAt: targetSchedule.admin_approved_at,
                          adminSignatureUrl: targetSchedule.admin_signature_url,
                          adminStampUrl: targetSchedule.admin_stamp_url,
                          adminRemarks: targetSchedule.admin_remarks,
                          deanName: targetSchedule.deanCheckerName || targetSchedule.departmentDeanName || 'Assigned Department Dean',
                          deanRole: targetSchedule.deanCheckerRole || 'Dean',
                          deanCheckedAt: targetSchedule.dean_checked_at,
                          deanSignatureUrl: targetSchedule.dean_signature_url,
                          deanRemarks: targetSchedule.dean_remarks
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed PDF</span>
                    </button>
                  </div>
                </div>

                {/* Rejection / Revision Banner if applicable */}
                {targetSchedule.status === 'REJECTED' && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Schedule Rejected</strong>
                      <p className="mt-0.5 text-red-800">
                        {targetSchedule.rejection_reason || 'This schedule submission was rejected during the approval review.'}
                      </p>
                    </div>
                  </div>
                )}

                {targetSchedule.status === 'RETURNED_FOR_REVISION' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Returned for Revision</strong>
                      <p className="mt-0.5 text-amber-800">
                        {targetSchedule.revision_requested_reason || 'Revisions were requested by the reviewer before final approval can proceed.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* THE FORMAL INSTITUTIONAL DOCUMENT PREVIEW */}
                <div className="border border-slate-300 rounded-xl p-6 sm:p-8 bg-white shadow-xs">
                  {/* Western University Document Header */}
                  <div className="flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider pb-2 border-b-2 border-black text-black">
                    <span>សាកលវិទ្យាល័យ វេស្ទើន</span>
                    <span className="font-sans font-bold">ACADEMIC YEAR {targetSchedule.academicYearName || activeYear?.name || '2026-2027'}</span>
                    <span className="font-sans font-bold">WESTERN UNIVERSITY</span>
                  </div>

                  <div className="flex items-start justify-between mt-3 mb-4">
                    <div className="flex flex-col items-center">
                      <img src="/logo.png" alt="Western University Crest" className="w-16 h-16 object-contain" />
                      <span className="text-xs font-bold text-[#1e3a8a] mt-1 font-serif">សាកលវិទ្យាល័យ វេស្ទើន</span>
                      <span className="text-[10px] font-extrabold text-[#1e3a8a] uppercase tracking-wider">WESTERN UNIVERSITY</span>
                    </div>

                    <div className="text-right text-[#8B1E1E]">
                      <div className="text-base font-bold font-serif leading-tight">
                        {targetSchedule.facultyName || 'Faculty of Science and Technology'}
                      </div>
                      <div className="text-sm font-serif font-semibold mt-0.5 text-slate-800">
                        {targetSchedule.departmentName || 'Department of Computer Science & Information Technology'}
                      </div>
                      <div className="text-xs font-serif italic font-semibold text-slate-600 mt-0.5">
                        ({targetSchedule.branchName || activeBranch?.name || 'Campus Branch'})
                      </div>
                    </div>
                  </div>

                  {/* Centered Document Title */}
                  <div className="text-center my-4 space-y-1 text-black">
                    <h2 className="text-lg font-extrabold uppercase tracking-wide font-sans text-brand-navy">
                      OFFICIAL COURSE SCHEDULE • SEMESTER {activeSemester?.name?.replace(/Semester\s*/i, '') || '1'}
                    </h2>
                    <div className="text-sm font-bold text-slate-700">
                      Cohort: {targetSchedule.batchName || 'Batch 21'} • Major: {targetMajorName}
                    </div>
                  </div>

                  {/* Schedule Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Course:</span>
                      <span className="font-mono font-bold text-brand-blue">{targetSchedule.courseCode}</span>
                      <span className="block font-semibold text-slate-800">{targetSchedule.courseName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Faculty Lecturer:</span>
                      <span className="font-semibold text-slate-800 block">{targetSchedule.lecturerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{targetSchedule.lecturerCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Class Window & Session:</span>
                      <span className="font-bold text-slate-800 block">
                        {targetSchedule.timeSlotDay} • {targetSchedule.timeSlotPeriod} Window
                      </span>
                      <span className="text-[10px] font-semibold text-purple-700">
                        Session {targetSchedule.sessionNumber || 1} ({targetSchedule.effectiveStartTime12h} – {targetSchedule.effectiveEndTime12h})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Classroom & Campus:</span>
                      <span className="font-bold text-slate-800 block">{targetSchedule.classroomNumber}</span>
                      <span className="text-[10px] text-slate-600 block">{targetSchedule.branchName}</span>
                    </div>
                  </div>

                  {/* DUAL-STAGE INSTITUTIONAL APPROVAL SECTION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t-2 border-slate-300">
                    {/* Stage 1: Administrator Approval & Official Stamp */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 relative">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Stamp className="w-4 h-4 text-blue-800" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy">
                            Stage 1: Administrator Approval & Stamp
                          </span>
                        </div>
                        {hasAdminApproval ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Pending Admin
                          </span>
                        )}
                      </div>

                      <div className="min-h-[90px] flex items-center justify-center relative my-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                        {targetSchedule.admin_stamp_url ? (
                          <img
                            src={targetSchedule.admin_stamp_url}
                            alt="Western University Official Stamp"
                            className="w-20 h-20 object-contain absolute opacity-85 rotate-[-5deg]"
                          />
                        ) : null}
                        {targetSchedule.admin_signature_url ? (
                          <img
                            src={targetSchedule.admin_signature_url}
                            alt="Admin Signature"
                            className="h-12 max-w-[150px] object-contain relative z-10"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">No signature or stamp applied yet</span>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200">
                        <div className="font-serif font-bold text-slate-900 text-sm">
                          {targetSchedule.adminApproverName || 'Dr. Sarah Sterling'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          {targetSchedule.adminApproverRole || 'Administrator'} • APDO Operations Directorate
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {targetSchedule.admin_approved_at
                            ? `Approved: ${new Date(targetSchedule.admin_approved_at).toLocaleString()}`
                            : 'Pending Stage 1 Approval'}
                        </div>
                        {targetSchedule.admin_remarks && (
                          <div className="mt-2 p-2 rounded bg-blue-50 text-[11px] text-blue-900 italic">
                            &ldquo;{targetSchedule.admin_remarks}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage 2: Department-Specific Dean Verification */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 relative">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                        <div className="flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-purple-700" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-950">
                            Stage 2: Department Dean Verification
                          </span>
                        </div>
                        {isFullyApproved || hasDeanVerification ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Dean Checked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Pending Dean
                          </span>
                        )}
                      </div>

                      <div className="min-h-[90px] flex items-center justify-center relative my-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                        {targetSchedule.dean_signature_url ? (
                          <img
                            src={targetSchedule.dean_signature_url}
                            alt="Department Dean Signature"
                            className="h-12 max-w-[160px] object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {hasAdminApproval
                              ? 'Awaiting Dean review and verification'
                              : 'Pending Stage 1 Admin approval first'}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200">
                        <div className="font-serif font-bold text-slate-900 text-sm">
                          {targetSchedule.deanCheckerName || targetSchedule.departmentDeanName || 'Assigned Department Dean'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          {targetSchedule.deanCheckerRole || 'Dean'} • {targetSchedule.departmentName || 'Academic Department'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {targetSchedule.dean_checked_at
                            ? `Verified: ${new Date(targetSchedule.dean_checked_at).toLocaleString()}`
                            : 'Pending Stage 2 Verification'}
                        </div>
                        {targetSchedule.dean_remarks && (
                          <div className="mt-2 p-2 rounded bg-purple-50 text-[11px] text-purple-900 italic">
                            &ldquo;{targetSchedule.dean_remarks}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Persisted Audit Trail Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Persisted Approval Audit Trail & History
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Schedule ID: #{targetSchedule.id} • {scheduleHistory.length} Recorded Action{scheduleHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {scheduleHistory.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-2">No history records logged yet for this schedule.</p>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {scheduleHistory.map(h => {
                        const reviewer = users.find(u => u.id === h.reviewer_id);
                        return (
                          <div key={h.id} className="py-2.5 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                              <div>
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span>{h.action.replace(/_/g, ' ')}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-[10px] font-normal text-slate-700">
                                    {h.status}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[11px] mt-0.5">
                                  {reviewer ? `${reviewer.name} (${reviewer.role})` : `User #${h.reviewer_id}`}: &ldquo;{h.comments || 'No remarks provided'}&rdquo;
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                              {new Date(h.created_at).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsOfficialDocModalOpen(false);
                      setSelectedOfficialSchedule(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close Document Preview
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
