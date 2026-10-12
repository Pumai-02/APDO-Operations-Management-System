import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AcademicYear, Semester, Branch, Major, Course, CourseMajor,
  Lecturer, LecturerBranch, LecturerCourse, Classroom, TimeSlot,
  LecturerAvailability, ClassSection, Schedule, ScheduleClassSection,
  ScheduleConflict, ScheduleApprovalHistory, ScheduleChangeLog,
  SystemSetting, User, HydratedSchedule, ScheduleStatus, Batch, Department
} from '../types/database';
import {
  initialAcademicYears, initialSemesters, initialBranches, initialMajors,
  initialCourses, initialCourseMajors, initialLecturers, initialLecturerBranches,
  initialLecturerCourses, initialClassrooms, initialTimeSlots,
  initialLecturerAvailabilities, initialClassSections, initialSchedules,
  initialScheduleClassSections, initialScheduleConflicts,
  initialScheduleApprovalHistory, initialScheduleChangeLogs,
  initialSystemSettings, initialUsers, initialBatches, initialDepartments
} from '../data/mockData';
import { formatTime12h, calculateDurationMinutes } from '../utils/timeFormat';

interface OperationsContextType {
  // State
  departments: Department[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  branches: Branch[];
  majors: Major[];
  courses: Course[];
  courseMajors: CourseMajor[];
  lecturers: Lecturer[];
  lecturerBranches: LecturerBranch[];
  lecturerCourses: LecturerCourse[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  lecturerAvailabilities: LecturerAvailability[];
  classSections: ClassSection[];
  batches: Batch[];
  schedules: Schedule[];
  scheduleClassSections: ScheduleClassSection[];
  conflicts: ScheduleConflict[];
  approvalHistory: ScheduleApprovalHistory[];
  changeLogs: ScheduleChangeLog[];
  systemSettings: SystemSetting[];
  users: User[];

  // Hydrated data
  hydratedSchedules: HydratedSchedule[];

  // Operational Actions
  addSchedule: (data: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>, sectionIds: string[]) => Schedule;
  updateSchedule: (id: string, data: Partial<Schedule>, sectionIds?: string[]) => void;
  deleteSchedule: (id: string) => void;
  submitSchedule: (id: string, userId: string) => void;
  startReviewSchedule: (id: string, reviewerId: string) => void;
  approveSchedule: (id: string, reviewerId: string, comments: string) => void;
  adminApproveSchedule: (id: string, adminId: string, signatureUrl: string, stampUrl: string, remarks?: string) => void;
  deanCheckSchedule: (id: string, deanId: string, signatureUrl: string, remarks?: string) => void;
  returnScheduleForRevision: (id: string, userId: string, reason: string) => void;
  rejectSchedule: (id: string, reviewerId: string, comments: string) => void;

  // Conflict Actions
  resolveConflict: (conflictId: string, resolutionNotes: string, resolvedBy: string) => void;

  // Management CRUD
  addBranch: (data: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBranch: (id: string, data: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;

  addMajor: (data: Omit<Major, 'id' | 'created_at' | 'updated_at'>) => void;
  updateMajor: (id: string, data: Partial<Major>) => void;
  deleteMajor: (id: string) => void;

  addCourse: (data: Omit<Course, 'id' | 'created_at' | 'updated_at'>, majorIds?: string[]) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addClassroom: (data: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>) => void;
  updateClassroom: (id: string, data: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;

  addLecturer: (data: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLecturer: (id: string, data: Partial<Lecturer>) => void;
  deleteLecturer: (id: string) => void;

  addClassSection: (data: Omit<ClassSection, 'id' | 'created_at' | 'updated_at'>) => void;
  updateClassSection: (id: string, data: Partial<ClassSection>) => void;
  deleteClassSection: (id: string) => void;

  addBatch: (data: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => Batch;
  updateBatch: (id: string, data: Partial<Batch>) => void;
  deleteBatch: (id: string) => { success: boolean; message?: string };
  toggleBatchStatus: (id: string) => void;

  // Academic Year Management
  addAcademicYear: (data: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) => { success: boolean; year?: AcademicYear; message?: string };
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => { success: boolean; message?: string };
  deleteAcademicYear: (id: string) => { success: boolean; message?: string };
  toggleAcademicYearStatus: (id: string) => { success: boolean; message?: string };
  setActiveAcademicYear: (id: string) => { success: boolean; message?: string };

  // Department Management
  addDepartment: (data: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => Department;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => { success: boolean; message?: string };
  assignDeanToDepartment: (departmentId: string, deanUserId: string | null) => void;

  addUser: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  updateSystemSetting: (key: string, value: string, userId: string) => void;
  updateLecturerAvailability: (avail: Omit<LecturerAvailability, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTimeSlotSessions: (
    slotId: string,
    config: {
      session_1_start: string;
      session_1_end: string;
      break_start?: string;
      break_end?: string;
      session_2_start: string;
      session_2_end: string;
    },
    applyToPeriod?: boolean
  ) => void;

  resetDemoData: () => void;
  checkLecturerAvailabilityForWindow: (
    lecturerId: string,
    branchId: string,
    timeSlotId: string,
    options?: {
      requiredSessions?: (1 | 2)[];
      excludeScheduleId?: string;
      combinedLecturerIds?: string[];
      targetDate?: string;
    }
  ) => WindowAvailabilityResult;
  getAvailableTimeWindowsForLecturer: (
    lecturerId: string,
    branchId: string,
    options?: {
      requiredSessions?: (1 | 2)[];
      excludeScheduleId?: string;
      combinedLecturerIds?: string[];
      targetDate?: string;
    }
  ) => {
    compatibleSlots: TimeSlot[];
    slotResults: Record<string, WindowAvailabilityResult>;
  };
}

export interface WindowAvailabilityResult {
  slot: TimeSlot;
  isAvailable: boolean;
  session1Available: boolean;
  session2Available: boolean;
  bothAvailable: boolean;
  session1Reason?: string;
  session2Reason?: string;
  reasons: string[];
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load persisted state or fallback
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const s = localStorage.getItem('apdo_years');
    if (!s) return initialAcademicYears;
    try {
      const parsed: AcademicYear[] = JSON.parse(s);
      const merged = [...parsed];
      for (const init of initialAcademicYears) {
        if (!merged.some(m => m.id === init.id)) {
          merged.push(init);
        }
      }
      return merged;
    } catch {
      return initialAcademicYears;
    }
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const s = localStorage.getItem('apdo_semesters');
    return s ? JSON.parse(s) : initialSemesters;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const s = localStorage.getItem('apdo_branches');
    return s ? JSON.parse(s) : initialBranches;
  });

  const [majors, setMajors] = useState<Major[]>(() => {
    const s = localStorage.getItem('apdo_majors');
    return s ? JSON.parse(s) : initialMajors;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const s = localStorage.getItem('apdo_courses');
    return s ? JSON.parse(s) : initialCourses;
  });

  const [courseMajors, setCourseMajors] = useState<CourseMajor[]>(() => {
    const s = localStorage.getItem('apdo_course_majors');
    return s ? JSON.parse(s) : initialCourseMajors;
  });

  const [lecturers, setLecturers] = useState<Lecturer[]>(() => {
    const s = localStorage.getItem('apdo_lecturers');
    return s ? JSON.parse(s) : initialLecturers;
  });

  const [lecturerBranches, setLecturerBranches] = useState<LecturerBranch[]>(() => {
    const s = localStorage.getItem('apdo_lecturer_branches');
    return s ? JSON.parse(s) : initialLecturerBranches;
  });

  const [lecturerCourses, setLecturerCourses] = useState<LecturerCourse[]>(() => {
    const s = localStorage.getItem('apdo_lecturer_courses');
    return s ? JSON.parse(s) : initialLecturerCourses;
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const s = localStorage.getItem('apdo_classrooms');
    return s ? JSON.parse(s) : initialClassrooms;
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const s = localStorage.getItem('apdo_timeslots');
    return s ? JSON.parse(s) : initialTimeSlots;
  });

  const [lecturerAvailabilities, setLecturerAvailabilities] = useState<LecturerAvailability[]>(() => {
    const s = localStorage.getItem('apdo_availabilities');
    return s ? JSON.parse(s) : initialLecturerAvailabilities;
  });

  const [classSections, setClassSections] = useState<ClassSection[]>(() => {
    const s = localStorage.getItem('apdo_sections');
    return s ? JSON.parse(s) : initialClassSections;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const s = localStorage.getItem('apdo_batches');
    return s ? JSON.parse(s) : initialBatches;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const s = localStorage.getItem('apdo_departments');
    return s ? JSON.parse(s) : initialDepartments;
  });

  useEffect(() => {
    localStorage.setItem('apdo_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('apdo_departments', JSON.stringify(departments));
  }, [departments]);

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const s = localStorage.getItem('apdo_schedules');
    if (!s) return initialSchedules;
    try {
      const parsed: Schedule[] = JSON.parse(s);
      const merged = [...parsed];
      for (const init of initialSchedules) {
        const idx = merged.findIndex(m => m.id === init.id);
        if (idx === -1) {
          merged.push(init);
        } else {
          if (!merged[idx].branch_id && init.branch_id) {
            merged[idx].branch_id = init.branch_id;
          }
          if (!merged[idx].batch_id && init.batch_id) {
            merged[idx].batch_id = init.batch_id;
          }
          if (!merged[idx].department_id && init.department_id) {
            merged[idx].department_id = init.department_id;
          }
          if (!merged[idx].admin_signature_url && init.admin_signature_url) {
            merged[idx].admin_signature_url = init.admin_signature_url;
            merged[idx].admin_stamp_url = init.admin_stamp_url;
            merged[idx].admin_approved_by = init.admin_approved_by;
            merged[idx].admin_approved_at = init.admin_approved_at;
            merged[idx].admin_remarks = init.admin_remarks;
          }
          if (!merged[idx].dean_signature_url && init.dean_signature_url) {
            merged[idx].dean_signature_url = init.dean_signature_url;
            merged[idx].dean_checked_by = init.dean_checked_by;
            merged[idx].dean_checked_at = init.dean_checked_at;
            merged[idx].dean_remarks = init.dean_remarks;
          }
        }
      }
      return merged;
    } catch {
      return initialSchedules;
    }
  });

  const [scheduleClassSections, setScheduleClassSections] = useState<ScheduleClassSection[]>(() => {
    const s = localStorage.getItem('apdo_sched_sections');
    if (!s) return initialScheduleClassSections;
    try {
      const parsed: ScheduleClassSection[] = JSON.parse(s);
      const merged = [...parsed];
      for (const init of initialScheduleClassSections) {
        if (!merged.some(m => m.schedule_id === init.schedule_id && m.class_section_id === init.class_section_id)) {
          merged.push(init);
        }
      }
      return merged;
    } catch {
      return initialScheduleClassSections;
    }
  });

  const [conflicts, setConflicts] = useState<ScheduleConflict[]>(() => {
    const s = localStorage.getItem('apdo_conflicts');
    return s ? JSON.parse(s) : initialScheduleConflicts;
  });

  const [approvalHistory, setApprovalHistory] = useState<ScheduleApprovalHistory[]>(() => {
    const s = localStorage.getItem('apdo_approvals');
    if (!s) return initialScheduleApprovalHistory;
    try {
      const parsed: ScheduleApprovalHistory[] = JSON.parse(s);
      const merged = [...parsed];
      for (const init of initialScheduleApprovalHistory) {
        if (!merged.some(m => m.id === init.id)) {
          merged.push(init);
        }
      }
      return merged;
    } catch {
      return initialScheduleApprovalHistory;
    }
  });

  const [changeLogs, setChangeLogs] = useState<ScheduleChangeLog[]>(() => {
    const s = localStorage.getItem('apdo_changelogs');
    return s ? JSON.parse(s) : initialScheduleChangeLogs;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>(() => {
    const s = localStorage.getItem('apdo_settings');
    return s ? JSON.parse(s) : initialSystemSettings;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem('apdo_users');
    return s ? JSON.parse(s) : initialUsers;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('apdo_schedules', JSON.stringify(schedules));
  }, [schedules]);
  useEffect(() => {
    localStorage.setItem('apdo_sched_sections', JSON.stringify(scheduleClassSections));
  }, [scheduleClassSections]);
  useEffect(() => {
    localStorage.setItem('apdo_conflicts', JSON.stringify(conflicts));
  }, [conflicts]);
  useEffect(() => {
    localStorage.setItem('apdo_approvals', JSON.stringify(approvalHistory));
  }, [approvalHistory]);
  useEffect(() => {
    localStorage.setItem('apdo_changelogs', JSON.stringify(changeLogs));
  }, [changeLogs]);
  useEffect(() => {
    localStorage.setItem('apdo_branches', JSON.stringify(branches));
  }, [branches]);
  useEffect(() => {
    localStorage.setItem('apdo_majors', JSON.stringify(majors));
  }, [majors]);
  useEffect(() => {
    localStorage.setItem('apdo_courses', JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem('apdo_lecturers', JSON.stringify(lecturers));
  }, [lecturers]);
  useEffect(() => {
    localStorage.setItem('apdo_classrooms', JSON.stringify(classrooms));
  }, [classrooms]);
  useEffect(() => {
    localStorage.setItem('apdo_sections', JSON.stringify(classSections));
  }, [classSections]);
  useEffect(() => {
    localStorage.setItem('apdo_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);
  useEffect(() => {
    localStorage.setItem('apdo_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('apdo_years', JSON.stringify(academicYears));
  }, [academicYears]);
  useEffect(() => {
    localStorage.setItem('apdo_availabilities', JSON.stringify(lecturerAvailabilities));
  }, [lecturerAvailabilities]);

  // Lecturer availability checker for an operational time window
  const checkLecturerAvailabilityForWindow = (
    lecturerId: string,
    branchId: string,
    timeSlotId: string,
    options?: {
      requiredSessions?: (1 | 2)[];
      excludeScheduleId?: string;
      combinedLecturerIds?: string[];
      targetDate?: string;
    }
  ): WindowAvailabilityResult => {
    const slot = timeSlots.find(t => t.id === timeSlotId);
    if (!slot) {
      return {
        slot: {} as TimeSlot,
        isAvailable: false,
        session1Available: false,
        session2Available: false,
        bothAvailable: false,
        reasons: ['Time slot not found.'],
        session1Reason: 'Time slot not found.',
        session2Reason: 'Time slot not found.'
      };
    }

    const allLecturerIds = Array.from(new Set([lecturerId, ...(options?.combinedLecturerIds || [])])).filter(Boolean);
    const reasons: string[] = [];
    let session1Avail = true;
    let session2Avail = true;
    let s1Reason: string | undefined;
    let s2Reason: string | undefined;

    for (const lid of allLecturerIds) {
      const lec = lecturers.find(l => l.id === lid);
      const lecName = lec?.name || `Lecturer #${lid}`;

      // 1. Check employment status
      if (!lec || !lec.is_active || lec.employment_status !== 'ACTIVE') {
        const msg = `${lecName} is currently ${lec?.employment_status || 'INACTIVE'}.`;
        session1Avail = false;
        session2Avail = false;
        reasons.push(msg);
        s1Reason = s1Reason || msg;
        s2Reason = s2Reason || msg;
        continue;
      }

      // 2. Check campus assignment
      const assignedBranches = lecturerBranches.filter(lb => lb.lecturer_id === lid);
      if (assignedBranches.length > 0 && !assignedBranches.some(lb => lb.branch_id === branchId)) {
        const branchObj = branches.find(b => b.id === branchId);
        const msg = `${lecName} is not assigned to teach at ${branchObj?.name || 'this campus'}.`;
        session1Avail = false;
        session2Avail = false;
        reasons.push(msg);
        s1Reason = s1Reason || msg;
        s2Reason = s2Reason || msg;
      }

      // 3. Check lecturer availability table
      const availRecord = lecturerAvailabilities.find(
        a => a.lecturer_id === lid && a.branch_id === branchId && a.time_slot_id === slot.id
      );
      if (availRecord) {
        if (!availRecord.is_available || availRecord.availability_status === 'UNAVAILABLE') {
          const msg = `${lecName} has marked this time window as UNAVAILABLE${availRecord.note ? ` (${availRecord.note})` : ''}.`;
          session1Avail = false;
          session2Avail = false;
          reasons.push(msg);
          s1Reason = s1Reason || msg;
          s2Reason = s2Reason || msg;
        } else {
          if (availRecord.session_1_available === false) {
            const msg = `${lecName} is marked unavailable for Session 1.`;
            session1Avail = false;
            reasons.push(msg);
            s1Reason = s1Reason || msg;
          }
          if (availRecord.session_2_available === false) {
            const msg = `${lecName} is marked unavailable for Session 2.`;
            session2Avail = false;
            reasons.push(msg);
            s2Reason = s2Reason || msg;
          }
        }
      }

      // 4. Check schedule conflicts across ALL campuses
      for (const sched of schedules) {
        if (sched.id === options?.excludeScheduleId || sched.status === 'REJECTED') {
          continue;
        }
        if (sched.lecturer_id !== lid) {
          continue;
        }

        const schedSlot = timeSlots.find(t => t.id === sched.time_slot_id);
        if (!schedSlot) continue;

        // Check if on same day of week
        if (schedSlot.day_of_week !== slot.day_of_week) continue;

        // Which sessions does sched occupy?
        const schedSessions = (sched.selected_sessions && sched.selected_sessions.length > 0)
          ? sched.selected_sessions
          : (sched.session_number === 3 ? [1, 2] : [sched.session_number || 1]);

        const schedBranch = branches.find(b => b.id === sched.branch_id);
        const schedLocation = schedBranch ? schedBranch.name : 'another campus';
        const isDiffCampus = sched.branch_id !== branchId;

        // If same slot:
        if (schedSlot.id === slot.id) {
          if (schedSessions.includes(1)) {
            const msg = `${lecName} has a scheduled class (Schedule #${sched.id}) in Session 1${isDiffCampus ? ` at ${schedLocation}` : ''}.`;
            session1Avail = false;
            if (!reasons.includes(msg)) reasons.push(msg);
            s1Reason = s1Reason || msg;
          }
          if (schedSessions.includes(2)) {
            const msg = `${lecName} has a scheduled class (Schedule #${sched.id}) in Session 2${isDiffCampus ? ` at ${schedLocation}` : ''}.`;
            session2Avail = false;
            if (!reasons.includes(msg)) reasons.push(msg);
            s2Reason = s2Reason || msg;
          }
        } else {
          // Check time overlap on the same day
          const s1Start = slot.session_1_start || slot.start_time;
          const s1End = slot.session_1_end || '09:30:00';
          const s2Start = slot.session_2_start || '09:45:00';
          const s2End = slot.session_2_end || slot.end_time;

          const schedStart = schedSessions.includes(1)
            ? (schedSlot.session_1_start || schedSlot.start_time)
            : (schedSlot.session_2_start || '09:45:00');
          const schedEnd = schedSessions.includes(2)
            ? (schedSlot.session_2_end || schedSlot.end_time)
            : (schedSlot.session_1_end || '09:30:00');

          if (s1Start < schedEnd && s1End > schedStart) {
            const msg = `${lecName} has an overlapping scheduled class (Schedule #${sched.id}) during Session 1${isDiffCampus ? ` at ${schedLocation}` : ''}.`;
            session1Avail = false;
            if (!reasons.includes(msg)) reasons.push(msg);
            s1Reason = s1Reason || msg;
          }
          if (s2Start < schedEnd && s2End > schedStart) {
            const msg = `${lecName} has an overlapping scheduled class (Schedule #${sched.id}) during Session 2${isDiffCampus ? ` at ${schedLocation}` : ''}.`;
            session2Avail = false;
            if (!reasons.includes(msg)) reasons.push(msg);
            s2Reason = s2Reason || msg;
          }
        }
      }
    }

    const bothAvailable = session1Avail && session2Avail;
    let isAvailable = bothAvailable;
    if (options?.requiredSessions && options.requiredSessions.length > 0) {
      isAvailable = true;
      if (options.requiredSessions.includes(1) && !session1Avail) isAvailable = false;
      if (options.requiredSessions.includes(2) && !session2Avail) isAvailable = false;
    }

    return {
      slot,
      isAvailable,
      session1Available: session1Avail,
      session2Available: session2Avail,
      bothAvailable,
      session1Reason: s1Reason,
      session2Reason: s2Reason,
      reasons
    };
  };

  const getAvailableTimeWindowsForLecturer = (
    lecturerId: string,
    branchId: string,
    options?: {
      requiredSessions?: (1 | 2)[];
      excludeScheduleId?: string;
      combinedLecturerIds?: string[];
      targetDate?: string;
    }
  ) => {
    const slotResults: Record<string, WindowAvailabilityResult> = {};
    const compatibleSlots: TimeSlot[] = [];

    for (const slot of timeSlots) {
      if (!slot.is_active) continue;
      const res = checkLecturerAvailabilityForWindow(lecturerId, branchId, slot.id, options);
      slotResults[slot.id] = res;
      // Operational rule: Window is compatible if genuinely available
      if (res.isAvailable) {
        compatibleSlots.push(slot);
      }
    }

    return { compatibleSlots, slotResults };
  };

  // Conflict Checking Engine
  const runConflictCheck = (newSched: Schedule, currentSchedules: Schedule[]) => {
    const detected: ScheduleConflict[] = [];
    const now = new Date().toISOString();

    const newSessions = (newSched.selected_sessions && newSched.selected_sessions.length > 0)
      ? newSched.selected_sessions
      : (newSched.session_number === 3 ? [1, 2] : [newSched.session_number || 1]);
    const newSlot = timeSlots.find(t => t.id === newSched.time_slot_id);

    // 1. Check classroom double booking on same time slot/time and session number
    const conflictingRoom = currentSchedules.find(s => {
      if (s.id === newSched.id || s.status === 'REJECTED' || s.classroom_id !== newSched.classroom_id) return false;
      const sSlot = timeSlots.find(t => t.id === s.time_slot_id);
      if (!sSlot || !newSlot || sSlot.day_of_week !== newSlot.day_of_week) return false;

      const sSessions = (s.selected_sessions && s.selected_sessions.length > 0)
        ? s.selected_sessions
        : (s.session_number === 3 ? [1, 2] : [s.session_number || 1]);

      if (s.time_slot_id === newSched.time_slot_id) {
        return newSessions.some(sess => sSessions.includes(sess));
      }

      const newStart = newSessions.includes(1) ? (newSlot.session_1_start || newSlot.start_time) : (newSlot.session_2_start || '09:45:00');
      const newEnd = newSessions.includes(2) ? (newSlot.session_2_end || newSlot.end_time) : (newSlot.session_1_end || '09:30:00');
      const sStart = sSessions.includes(1) ? (sSlot.session_1_start || sSlot.start_time) : (sSlot.session_2_start || '09:45:00');
      const sEnd = sSessions.includes(2) ? (sSlot.session_2_end || sSlot.end_time) : (sSlot.session_1_end || '09:30:00');
      return newStart < sEnd && newEnd > sStart;
    });

    if (conflictingRoom) {
      const room = classrooms.find(c => c.id === newSched.classroom_id);
      detected.push({
        id: (Date.now() + Math.random()).toString(),
        schedule_id: newSched.id,
        conflicting_schedule_id: conflictingRoom.id,
        conflict_type: 'CLASSROOM_CONFLICT',
        severity: 'CRITICAL',
        description: `Classroom ${room?.room_number || 'Room'} is already booked for Schedule #${conflictingRoom.id} during overlapping sessions (${newSessions.join(', ')}).`,
        resolved: false,
        resolution_status: 'OPEN',
        resolved_by: null,
        resolved_at: null,
        detected_at: now,
        created_at: now,
        updated_at: now
      });
    }

    // 2. Check lecturer double booking across all campuses
    const conflictingLec = currentSchedules.find(s => {
      if (s.id === newSched.id || s.status === 'REJECTED' || s.lecturer_id !== newSched.lecturer_id) return false;
      const sSlot = timeSlots.find(t => t.id === s.time_slot_id);
      if (!sSlot || !newSlot || sSlot.day_of_week !== newSlot.day_of_week) return false;

      const sSessions = (s.selected_sessions && s.selected_sessions.length > 0)
        ? s.selected_sessions
        : (s.session_number === 3 ? [1, 2] : [s.session_number || 1]);

      if (s.time_slot_id === newSched.time_slot_id) {
        return newSessions.some(sess => sSessions.includes(sess));
      }

      const newStart = newSessions.includes(1) ? (newSlot.session_1_start || newSlot.start_time) : (newSlot.session_2_start || '09:45:00');
      const newEnd = newSessions.includes(2) ? (newSlot.session_2_end || newSlot.end_time) : (newSlot.session_1_end || '09:30:00');
      const sStart = sSessions.includes(1) ? (sSlot.session_1_start || sSlot.start_time) : (sSlot.session_2_start || '09:45:00');
      const sEnd = sSessions.includes(2) ? (sSlot.session_2_end || sSlot.end_time) : (sSlot.session_1_end || '09:30:00');
      return newStart < sEnd && newEnd > sStart;
    });

    if (conflictingLec) {
      const lec = lecturers.find(l => l.id === newSched.lecturer_id);
      const confBranch = branches.find(b => b.id === conflictingLec.branch_id);
      const isCrossCampus = conflictingLec.branch_id !== newSched.branch_id;
      const locText = isCrossCampus ? ` at ${confBranch?.name || 'another campus'}` : '';
      detected.push({
        id: (Date.now() + Math.random() + 1).toString(),
        schedule_id: newSched.id,
        conflicting_schedule_id: conflictingLec.id,
        conflict_type: 'LECTURER_CONFLICT',
        severity: 'CRITICAL',
        description: `Lecturer ${lec?.name || 'Faculty'} is already scheduled to teach Schedule #${conflictingLec.id}${locText} during overlapping time window / sessions.`,
        resolved: false,
        resolution_status: 'OPEN',
        resolved_by: null,
        resolved_at: null,
        detected_at: now,
        created_at: now,
        updated_at: now
      });
    }

    // 3. Check lecturer availability or status
    const assignedLec = lecturers.find(l => l.id === newSched.lecturer_id);
    if (assignedLec && (assignedLec.employment_status !== 'ACTIVE' || !assignedLec.is_active)) {
      detected.push({
        id: (Date.now() + Math.random() + 2).toString(),
        schedule_id: newSched.id,
        conflicting_schedule_id: null,
        conflict_type: 'AVAILABILITY',
        severity: 'ERROR',
        description: `Lecturer ${assignedLec.name} is currently flagged as ${assignedLec.employment_status} and cannot be assigned.`,
        resolved: false,
        resolution_status: 'OPEN',
        resolved_by: null,
        resolved_at: null,
        detected_at: now,
        created_at: now,
        updated_at: now
      });
    }

    // 4. Check faculty availability matrix
    const availRecord = lecturerAvailabilities.find(
      a => a.lecturer_id === newSched.lecturer_id &&
           a.branch_id === newSched.branch_id &&
           a.time_slot_id === newSched.time_slot_id
    );
    if (availRecord) {
      if (!availRecord.is_available || availRecord.availability_status === 'UNAVAILABLE') {
        detected.push({
          id: (Date.now() + Math.random() + 3).toString(),
          schedule_id: newSched.id,
          conflicting_schedule_id: null,
          conflict_type: 'AVAILABILITY',
          severity: 'ERROR',
          description: `Lecturer ${assignedLec?.name || 'Faculty'} has marked this time window as UNAVAILABLE in their availability matrix.`,
          resolved: false,
          resolution_status: 'OPEN',
          resolved_by: null,
          resolved_at: null,
          detected_at: now,
          created_at: now,
          updated_at: now
        });
      } else {
        if (newSessions.includes(1) && availRecord.session_1_available === false) {
          detected.push({
            id: (Date.now() + Math.random() + 4).toString(),
            schedule_id: newSched.id,
            conflicting_schedule_id: null,
            conflict_type: 'AVAILABILITY',
            severity: 'ERROR',
            description: `Lecturer is flagged as unavailable for Session 1 of this time window.`,
            resolved: false,
            resolution_status: 'OPEN',
            resolved_by: null,
            resolved_at: null,
            detected_at: now,
            created_at: now,
            updated_at: now
          });
        }
        if (newSessions.includes(2) && availRecord.session_2_available === false) {
          detected.push({
            id: (Date.now() + Math.random() + 5).toString(),
            schedule_id: newSched.id,
            conflicting_schedule_id: null,
            conflict_type: 'AVAILABILITY',
            severity: 'ERROR',
            description: `Lecturer is flagged as unavailable for Session 2 of this time window.`,
            resolved: false,
            resolution_status: 'OPEN',
            resolved_by: null,
            resolved_at: null,
            detected_at: now,
            created_at: now,
            updated_at: now
          });
        }
      }
    }

    // 5. Check branch assignment
    const assignedBranches = lecturerBranches.filter(lb => lb.lecturer_id === newSched.lecturer_id);
    if (assignedBranches.length > 0 && !assignedBranches.some(lb => lb.branch_id === newSched.branch_id)) {
      const br = branches.find(b => b.id === newSched.branch_id);
      detected.push({
        id: (Date.now() + Math.random() + 6).toString(),
        schedule_id: newSched.id,
        conflicting_schedule_id: null,
        conflict_type: 'AVAILABILITY',
        severity: 'ERROR',
        description: `Lecturer ${assignedLec?.name || 'Faculty'} is not assigned to teach at ${br?.name || 'this campus'}.`,
        resolved: false,
        resolution_status: 'OPEN',
        resolved_by: null,
        resolved_at: null,
        detected_at: now,
        created_at: now,
        updated_at: now
      });
    }

    return detected;
  };

  // Helper to resolve the department for any schedule
  const resolveScheduleDepartment = (s: Schedule): Department | undefined => {
    if (s.department_id) {
      const d = departments.find(dept => dept.id === s.department_id);
      if (d) return d;
    }
    const cr = courses.find(c => c.id === s.course_id);
    if (cr?.department_id) {
      const d = departments.find(dept => dept.id === cr.department_id);
      if (d) return d;
    }
    // Check courseMajors -> majors -> department_id
    const cmLinks = courseMajors.filter(cm => cm.course_id === s.course_id);
    for (const link of cmLinks) {
      const m = majors.find(maj => maj.id === link.major_id);
      if (m?.department_id) {
        const d = departments.find(dept => dept.id === m.department_id);
        if (d) return d;
      }
    }
    // Check sections -> major -> department_id
    const secLinks = scheduleClassSections.filter(sc => sc.schedule_id === s.id);
    for (const sl of secLinks) {
      const sec = classSections.find(cs => cs.id === sl.class_section_id);
      if (sec?.major_id) {
        const m = majors.find(maj => maj.id === sec.major_id);
        if (m?.department_id) {
          const d = departments.find(dept => dept.id === m.department_id);
          if (d) return d;
        }
      }
    }
    return departments.find(d => d.is_active) || departments[0];
  };

  // Hydrated Schedules
  const hydratedSchedules: HydratedSchedule[] = useMemo(() => {
    return schedules.map(s => {
      const sem = semesters.find(item => item.id === s.semester_id);
      const br = branches.find(item => item.id === s.branch_id);
      const cr = courses.find(item => item.id === s.course_id);
      const lec = lecturers.find(item => item.id === s.lecturer_id);
      const room = classrooms.find(item => item.id === s.classroom_id);
      const slot = timeSlots.find(item => item.id === s.time_slot_id);

      const links = scheduleClassSections.filter(l => l.schedule_id === s.id);
      const secIds = links.map(l => l.class_section_id);
      const secNames = secIds.map(id => {
        const sec = classSections.find(c => c.id === id);
        return sec ? sec.section_name : id;
      });

      const schedConflicts = conflicts.filter(c => c.schedule_id === s.id && !c.resolved);

      const batch = s.batch_id ? batches.find(b => b.id === s.batch_id) : undefined;
      const sectionBatch = !batch && secIds.length > 0
        ? (() => {
            const secWithBatch = classSections.find(c => secIds.includes(c.id) && c.batch_id);
            return secWithBatch?.batch_id ? batches.find(b => b.id === secWithBatch.batch_id) : undefined;
          })()
        : undefined;
      const activeBatch = batch || sectionBatch;

      // Department & Dean resolution
      const targetDept = (() => {
        if (s.department_id) {
          const d = departments.find(dept => dept.id === s.department_id);
          if (d) return d;
        }
        if (cr?.department_id) {
          const d = departments.find(dept => dept.id === cr.department_id);
          if (d) return d;
        }
        const cmLinks = courseMajors.filter(cm => cm.course_id === s.course_id);
        for (const link of cmLinks) {
          const m = majors.find(maj => maj.id === link.major_id);
          if (m?.department_id) {
            const d = departments.find(dept => dept.id === m.department_id);
            if (d) return d;
          }
        }
        for (const id of secIds) {
          const sec = classSections.find(c => c.id === id);
          if (sec?.major_id) {
            const m = majors.find(maj => maj.id === sec.major_id);
            if (m?.department_id) {
              const d = departments.find(dept => dept.id === m.department_id);
              if (d) return d;
            }
          }
        }
        return departments[0];
      })();

      const assignedDeanId = s.dean_assigned_to || targetDept?.dean_user_id;
      const assignedDeanUser = users.find(u => u.id === assignedDeanId);
      const adminApprover = users.find(u => u.id === s.admin_approved_by);
      const deanChecker = users.find(u => u.id === s.dean_checked_by);

      const schedYearId = s.academic_year_id || sem?.academic_year_id || academicYears.find(y => y.is_active)?.id || '2';
      const acadYear = academicYears.find(y => y.id === schedYearId);

      return {
          ...s,
          academic_year_id: schedYearId,
          academicYearId: schedYearId,
          academicYearName: acadYear?.name || '2026-2027',
          isAcademicYearActive: Boolean(acadYear?.is_active),
          semesterName: sem?.name || 'Semester 1',
          branchName: br?.name || 'Branch',
          branchCode: br?.code || 'BR',
          courseCode: cr?.code || 'CRS',
          courseName: cr?.name || 'Course',
          lecturerName: lec?.name || 'Lecturer',
          lecturerCode: lec?.lecturer_code || 'LEC',
          lecturerPhone: lec?.phone || '077 426 333',
          classroomNumber: room?.room_number || 'Room',
          classroomCapacity: room?.capacity || 0,
          timeSlotDay: (typeof slot?.day_of_week === 'string' ? slot.day_of_week : 'Monday') as any,
          timeSlotPeriod: slot?.period || 'Morning',
          timeSlotStart: slot?.start_time || '08:00',
          timeSlotEnd: slot?.end_time || '11:15',
          sessionNumber: (s.session_number || (s.selected_sessions?.length === 2 ? 3 : 1)) as any,
          selected_sessions: s.selected_sessions || (s.session_number === 3 ? [1, 2] : [((s.session_number || 1) as 1 | 2)]),
          sessionLabel: (() => {
            if (s.session_number === 3 || (s.selected_sessions && s.selected_sessions.length === 2)) {
              return 'Dual Session (1 & 2)';
            }
            return `Session ${s.session_number || 1}`;
          })(),
          effectiveStartTime: (() => {
            if (!slot) return '08:00';
            const isDual = s.session_number === 3 || (s.selected_sessions && s.selected_sessions.length === 2);
            if (isDual) {
              return (slot.session_1_start || slot.start_time || '08:00').slice(0, 5);
            }
            return (s.session_number === 2)
              ? (slot.session_2_start ? slot.session_2_start.slice(0, 5) : '09:45')
              : (slot.session_1_start ? slot.session_1_start.slice(0, 5) : slot.start_time.slice(0, 5));
          })(),
          effectiveEndTime: (() => {
            if (!slot) return '09:30';
            const isDual = s.session_number === 3 || (s.selected_sessions && s.selected_sessions.length === 2);
            if (isDual) {
              return (slot.session_2_end || slot.end_time || '11:15').slice(0, 5);
            }
            return (s.session_number === 2)
              ? (slot.session_2_end ? slot.session_2_end.slice(0, 5) : slot.end_time.slice(0, 5))
              : (slot.session_1_end ? slot.session_1_end.slice(0, 5) : '09:30');
          })(),
          effectiveStartTime12h: (() => {
            if (!slot) return '8:00 AM';
            const isDual = s.session_number === 3 || (s.selected_sessions && s.selected_sessions.length === 2);
            if (isDual) {
              return formatTime12h(slot.session_1_start || slot.start_time || '08:00:00');
            }
            const t = (s.session_number === 2)
              ? (slot.session_2_start || '09:45:00')
              : (slot.session_1_start || slot.start_time || '08:00:00');
            return formatTime12h(t);
          })(),
          effectiveEndTime12h: (() => {
            if (!slot) return '9:30 AM';
            const isDual = s.session_number === 3 || (s.selected_sessions && s.selected_sessions.length === 2);
            if (isDual) {
              return formatTime12h(slot.session_2_end || slot.end_time || '11:15:00');
            }
            const t = (s.session_number === 2)
              ? (slot.session_2_end || slot.end_time || '11:15:00')
              : (slot.session_1_end || '09:30:00');
            return formatTime12h(t);
          })(),
          linkedSectionIds: secIds,
          linkedSectionNames: secNames,
          conflictsCount: schedConflicts.length,
          batchId: activeBatch?.id,
          batchName: activeBatch?.batch_name,
          batchCode: activeBatch?.batch_code,
          departmentId: targetDept?.id,
          departmentName: targetDept?.name || 'Department of Computer Science & IT',
          departmentCode: targetDept?.code || 'CSIT',
          facultyName: targetDept?.faculty_name || 'Faculty of Science & Technology',
          departmentDeanUserId: targetDept?.dean_user_id,
          departmentDeanName: assignedDeanUser?.name,
          departmentDeanEmail: assignedDeanUser?.email,
          dean_assigned_to: assignedDeanId,
          adminApproverName: adminApprover?.name,
          adminApproverRole: adminApprover?.role,
          deanCheckerName: deanChecker?.name,
          deanCheckerRole: deanChecker?.role
        };
      });
    }, [schedules, semesters, branches, courses, lecturers, classrooms, timeSlots, scheduleClassSections, conflicts, classSections, batches, users, departments, academicYears]);

  // Operational Actions
  const addSchedule = (data: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>, sectionIds: string[]): Schedule => {
    // Check inactive academic year permission: non-admins cannot create under inactive academic year
    const creatorUser = users.find(u => u.id === data.created_by);
    if (data.academic_year_id) {
      const targetYear = academicYears.find(y => y.id === data.academic_year_id);
      if (targetYear && !targetYear.is_active && creatorUser?.role !== 'ADMIN') {
        throw new Error(`Academic year "${targetYear.name}" is inactive. Creating schedules under inactive academic years requires Administrator privileges.`);
      }
    }

    // Role-based Department Access check: Deans may only create schedules in their assigned department
    if (creatorUser?.role === 'DEAN') {
      const deanDepts = departments.filter(d => d.dean_user_id === creatorUser.id).map(d => d.id);
      const schedDept = data.department_id || resolveScheduleDepartment(data as any)?.id;
      if (schedDept && !deanDepts.includes(schedDept)) {
        throw new Error('Unauthorized: Deans may only create schedules belonging to their assigned department.');
      }
    }

    // Lecturer availability validation on creation
    const requiredSess = (data.selected_sessions && data.selected_sessions.length > 0)
      ? data.selected_sessions
      : (data.session_number === 3 ? ([1, 2] as (1 | 2)[]) : [((data.session_number || 1) as 1 | 2)]);
    const availCheck = checkLecturerAvailabilityForWindow(
      data.lecturer_id,
      data.branch_id,
      data.time_slot_id,
      { requiredSessions: requiredSess }
    );
    if (!availCheck.isAvailable) {
      throw new Error(`Selected Operational Time Window is not compatible with lecturer availability: ${availCheck.reasons.join('; ')}`);
    }

    const id = (schedules.length > 0 ? Math.max(...schedules.map(s => parseInt(s.id) || 0)) + 1 : 1).toString();
    const now = new Date().toISOString();
    const newSched: Schedule = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };

    // Update schedules
    const updatedSchedules = [newSched, ...schedules];
    setSchedules(updatedSchedules);

    // Update schedule class sections
    const newLinks: ScheduleClassSection[] = sectionIds.map(sid => ({
      schedule_id: id,
      class_section_id: sid
    }));
    setScheduleClassSections(prev => [...prev, ...newLinks]);

    // Check conflicts
    const detected = runConflictCheck(newSched, schedules);
    if (detected.length > 0) {
      setConflicts(prev => [...detected, ...prev]);
    }

    // Add change log
    const log: ScheduleChangeLog = {
      id: (Date.now()).toString(),
      schedule_id: id,
      changed_by: data.created_by,
      action: 'CREATED',
      change_description: `Created schedule #${id} for course ID ${data.course_id} with ${sectionIds.length} sections.`,
      old_values: null,
      new_values: { schedule_id: id, course_id: data.course_id, status: data.status },
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);

    return newSched;
  };

  const updateSchedule = (id: string, data: Partial<Schedule>, sectionIds?: string[]) => {
    const existing = schedules.find(s => s.id === id);
    if (!existing) return;

    // Role-based Department Access check: Deans may only edit schedules in their assigned department
    const updaterUser = users.find(u => u.id === (data.created_by || '1'));
    if (updaterUser?.role === 'DEAN') {
      const deanDepts = departments.filter(d => d.dean_user_id === updaterUser.id).map(d => d.id);
      const existingDept = existing.department_id || resolveScheduleDepartment(existing)?.id;
      if (existingDept && !deanDepts.includes(existingDept)) {
        throw new Error('Unauthorized: Deans may only modify schedules belonging to their assigned department.');
      }
    }

    // Re-validate lecturer availability if core parameters change
    if (data.lecturer_id || data.branch_id || data.time_slot_id || data.session_number !== undefined || data.selected_sessions) {
      const targetLecId = data.lecturer_id || existing.lecturer_id;
      const targetBranchId = data.branch_id || existing.branch_id;
      const targetSlotId = data.time_slot_id || existing.time_slot_id;
      const targetSessions = (data.selected_sessions && data.selected_sessions.length > 0)
        ? data.selected_sessions
        : (data.session_number === 3 ? ([1, 2] as (1 | 2)[]) : [(data.session_number || existing.session_number || 1) as 1 | 2]);
      const availCheck = checkLecturerAvailabilityForWindow(
        targetLecId,
        targetBranchId,
        targetSlotId,
        { requiredSessions: targetSessions, excludeScheduleId: id }
      );
      if (!availCheck.isAvailable) {
        throw new Error(`Selected Operational Time Window is not compatible with lecturer availability: ${availCheck.reasons.join('; ')}`);
      }
    }

    const now = new Date().toISOString();

    // Check if an already approved schedule is having its scheduling parameters modified
    const isApprovedStatus = existing.status === 'FULLY_APPROVED' || existing.status === 'ADMIN_APPROVED' || existing.status === 'APPROVED';
    const isExplicitApprovalAction = data.status === 'ADMIN_APPROVED' || data.status === 'FULLY_APPROVED' || data.status === 'DEAN_CHECKED';
    const isCoreSchedulingChange = Boolean(
      (data.course_id && data.course_id !== existing.course_id) ||
      (data.lecturer_id && data.lecturer_id !== existing.lecturer_id) ||
      (data.classroom_id && data.classroom_id !== existing.classroom_id) ||
      (data.time_slot_id && data.time_slot_id !== existing.time_slot_id) ||
      (data.session_number !== undefined && data.session_number !== existing.session_number) ||
      (data.semester_id && data.semester_id !== existing.semester_id) ||
      (data.branch_id && data.branch_id !== existing.branch_id) ||
      (data.batch_id !== undefined && data.batch_id !== existing.batch_id) ||
      sectionIds !== undefined
    );

    const shouldInvalidate = isApprovedStatus && !isExplicitApprovalAction && isCoreSchedulingChange;

    const updated: Schedule = {
      ...existing,
      ...data,
      ...(shouldInvalidate ? {
        status: 'PENDING_ADMIN_APPROVAL',
        admin_approved_by: null,
        admin_approved_at: null,
        admin_signature_url: null,
        admin_stamp_url: null,
        admin_remarks: null,
        dean_checked_by: null,
        dean_checked_at: null,
        dean_signature_url: null,
        dean_remarks: null,
        revision_requested_reason: 'Schedule modified after approval. All prior approvals invalidated; re-approval required.'
      } : {}),
      updated_at: now
    };

    setSchedules(prev => prev.map(s => s.id === id ? updated : s));

    if (sectionIds) {
      setScheduleClassSections(prev => {
        const filtered = prev.filter(l => l.schedule_id !== id);
        const added = sectionIds.map(sid => ({ schedule_id: id, class_section_id: sid }));
        return [...filtered, ...added];
      });
    }

    // Re-check conflicts
    const detected = runConflictCheck(updated, schedules.filter(s => s.id !== id));
    if (detected.length > 0) {
      setConflicts(prev => [...detected, ...prev]);
    }

    // Audit log
    const log: ScheduleChangeLog = {
      id: (Date.now()).toString(),
      schedule_id: id,
      changed_by: data.created_by || '1',
      action: shouldInvalidate ? 'APPROVAL_INVALIDATED' : 'UPDATED',
      change_description: shouldInvalidate
        ? `Updated schedule #${id} parameters. Prior approvals invalidated; schedule returned to PENDING_ADMIN_APPROVAL.`
        : `Updated schedule #${id} parameters.`,
      old_values: { ...existing },
      new_values: { ...updated },
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);

    if (shouldInvalidate) {
      const invHistory: ScheduleApprovalHistory = {
        id: (Date.now() + 2).toString(),
        schedule_id: id,
        reviewer_id: data.created_by || '1',
        action: 'APPROVAL_INVALIDATED',
        status: 'PENDING_ADMIN_APPROVAL',
        comments: 'Schedule details were updated after approval. Approvals have been invalidated and schedule returned for re-approval.',
        reviewed_at: now,
        created_at: now
      };
      setApprovalHistory(prev => [invHistory, ...prev]);
    }
  };

  const deleteSchedule = (id: string) => {
    const target = schedules.find(s => s.id === id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    setScheduleClassSections(prev => prev.filter(l => l.schedule_id !== id));
    setConflicts(prev => prev.filter(c => c.schedule_id !== id));

    const now = new Date().toISOString();
    const log: ScheduleChangeLog = {
      id: (Date.now()).toString(),
      schedule_id: id,
      changed_by: '1',
      action: 'DELETED',
      change_description: `Deleted operational schedule #${id} (${target?.remarks || ''}).`,
      old_values: target ? { ...target } : null,
      new_values: null,
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);
  };

  const submitSchedule = (id: string, userId: string) => {
    const now = new Date().toISOString();
    updateSchedule(id, { status: 'PENDING_ADMIN_APPROVAL' });

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: userId,
      action: 'SUBMITTED',
      status: 'PENDING_ADMIN_APPROVAL',
      comments: 'Submitted for Administrator review and official stamp.',
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);
  };

  const startReviewSchedule = (id: string, reviewerId: string) => {
    const now = new Date().toISOString();
    updateSchedule(id, { status: 'UNDER_REVIEW' });

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: reviewerId,
      action: 'REVIEW_STARTED',
      status: 'UNDER_REVIEW',
      comments: 'Review initiated.',
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);
  };

  const approveSchedule = (id: string, reviewerId: string, comments: string) => {
    const now = new Date().toISOString();
    updateSchedule(id, {
      status: 'APPROVED',
      approved_by: reviewerId,
      approved_at: now
    });

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: reviewerId,
      action: 'APPROVED',
      status: 'APPROVED',
      comments: comments || 'Operational schedule approved.',
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);
  };

  const adminApproveSchedule = (
    id: string,
    adminId: string,
    signatureUrl: string,
    stampUrl: string,
    remarks?: string
  ) => {
    const existing = schedules.find(s => s.id === id);
    if (!existing) return;

    // Automatic schedule routing to department Dean
    const targetDept = resolveScheduleDepartment(existing);
    const assignedDeanId = targetDept?.dean_user_id || null;
    const now = new Date().toISOString();

    const updated: Schedule = {
      ...existing,
      department_id: targetDept?.id || existing.department_id,
      dean_assigned_to: assignedDeanId,
      status: 'ADMIN_APPROVED',
      admin_approved_by: adminId,
      admin_approved_at: now,
      admin_signature_url: signatureUrl,
      admin_stamp_url: stampUrl,
      admin_remarks: remarks || '',
      rejection_reason: null,
      revision_requested_reason: null,
      updated_at: now
    };

    setSchedules(prev => prev.map(s => s.id === id ? updated : s));

    const deanUser = users.find(u => u.id === assignedDeanId);
    const routingNote = targetDept
      ? ` [Auto-routed to ${targetDept.name} -> Dean ${deanUser?.name || 'Assigned Dean'}]`
      : '';

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: adminId,
      action: 'ADMIN_APPROVED',
      status: 'ADMIN_APPROVED',
      comments: remarks
        ? `Admin approved: ${remarks}.${routingNote}`
        : `Approved by Administrator with signature and official stamp.${routingNote} Awaiting verification by assigned department Dean.`,
      signature_url: signatureUrl,
      stamp_url: stampUrl,
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);

    const log: ScheduleChangeLog = {
      id: (Date.now() + 1).toString(),
      schedule_id: id,
      changed_by: adminId,
      action: 'ADMIN_APPROVED',
      change_description: `Administrator approved schedule #${id} with official signature and stamp.${routingNote}`,
      old_values: { status: existing.status },
      new_values: { status: 'ADMIN_APPROVED', admin_approved_at: now, dean_assigned_to: assignedDeanId },
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);
  };

  const deanCheckSchedule = (
    id: string,
    deanId: string,
    signatureUrl: string,
    remarks?: string
  ) => {
    const existing = schedules.find(s => s.id === id);
    if (!existing) return;

    // The Dean must not be able to complete the final approval before the Administrator has approved the schedule.
    if (existing.status !== 'ADMIN_APPROVED') {
      console.error('Cannot complete Dean verification: Schedule must be Admin Approved first.');
      return;
    }

    // Permission enforcement: Dean must be authorized for this department
    const targetDept = resolveScheduleDepartment(existing);
    const actingUser = users.find(u => u.id === deanId);
    const isAuthorized = actingUser?.role === 'ADMIN' ||
      (targetDept && targetDept.dean_user_id === deanId) ||
      existing.dean_assigned_to === deanId;

    if (!isAuthorized) {
      const err = `Unauthorized: Schedule #${id} belongs to "${targetDept?.name || 'Department'}" and can only be approved by its assigned Dean (${targetDept?.dean_user_id ? users.find(u => u.id === targetDept.dean_user_id)?.name : 'Assigned Dean'}).`;
      console.error(err);
      throw new Error(err);
    }

    const now = new Date().toISOString();
    const updated: Schedule = {
      ...existing,
      department_id: targetDept?.id || existing.department_id,
      dean_assigned_to: existing.dean_assigned_to || targetDept?.dean_user_id || deanId,
      status: 'FULLY_APPROVED',
      dean_checked_by: deanId,
      dean_checked_at: now,
      dean_signature_url: signatureUrl,
      dean_remarks: remarks || '',
      updated_at: now
    };

    setSchedules(prev => prev.map(s => s.id === id ? updated : s));

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: deanId,
      action: 'FULLY_APPROVED',
      status: 'FULLY_APPROVED',
      comments: remarks
        ? `Dean verified (${targetDept?.name}): ${remarks}`
        : `Dean verified schedule for ${targetDept?.name || 'Department'} and affixed official signature. Final approval granted.`,
      signature_url: signatureUrl,
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);

    const log: ScheduleChangeLog = {
      id: (Date.now() + 1).toString(),
      schedule_id: id,
      changed_by: deanId,
      action: 'FULLY_APPROVED',
      change_description: `Dean ${actingUser?.name || ''} verified schedule #${id} with signature for ${targetDept?.name || 'Department'}. Schedule is now fully approved.`,
      old_values: { status: existing.status },
      new_values: { status: 'FULLY_APPROVED', dean_checked_at: now },
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);
  };

  const returnScheduleForRevision = (
    id: string,
    userId: string,
    reason: string
  ) => {
    const existing = schedules.find(s => s.id === id);
    if (!existing) return;

    // Check Dean permission if acting as Dean
    const actingUser = users.find(u => u.id === userId);
    const targetDept = resolveScheduleDepartment(existing);
    if (actingUser?.role === 'DEAN') {
      const isAuthorized = (targetDept && targetDept.dean_user_id === userId) || existing.dean_assigned_to === userId;
      if (!isAuthorized) {
        throw new Error(`Unauthorized: You are not authorized to return schedules for ${targetDept?.name || 'this department'}.`);
      }
    }

    const now = new Date().toISOString();
    const updated: Schedule = {
      ...existing,
      status: 'RETURNED_FOR_REVISION',
      revision_requested_reason: reason,
      updated_at: now
    };

    setSchedules(prev => prev.map(s => s.id === id ? updated : s));

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: userId,
      action: 'RETURNED_FOR_REVISION',
      status: 'RETURNED_FOR_REVISION',
      comments: reason,
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);

    const log: ScheduleChangeLog = {
      id: (Date.now() + 1).toString(),
      schedule_id: id,
      changed_by: userId,
      action: 'RETURNED_FOR_REVISION',
      change_description: `Schedule #${id} returned for revision: ${reason}`,
      old_values: { status: existing.status },
      new_values: { status: 'RETURNED_FOR_REVISION', revision_requested_reason: reason },
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);
  };

  const rejectSchedule = (id: string, reviewerId: string, comments: string) => {
    const existing = schedules.find(s => s.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const updated: Schedule = {
      ...existing,
      status: 'REJECTED',
      rejection_reason: comments || 'Operational schedule rejected.',
      approved_by: reviewerId,
      approved_at: now,
      updated_at: now
    };

    setSchedules(prev => prev.map(s => s.id === id ? updated : s));

    const history: ScheduleApprovalHistory = {
      id: (Date.now()).toString(),
      schedule_id: id,
      reviewer_id: reviewerId,
      action: 'REJECTED',
      status: 'REJECTED',
      comments: comments || 'Operational schedule rejected.',
      reviewed_at: now,
      created_at: now
    };
    setApprovalHistory(prev => [history, ...prev]);

    const log: ScheduleChangeLog = {
      id: (Date.now() + 1).toString(),
      schedule_id: id,
      changed_by: reviewerId,
      action: 'REJECTED',
      change_description: `Schedule #${id} rejected: ${comments || 'No comment'}`,
      old_values: { status: existing.status },
      new_values: { status: 'REJECTED', rejection_reason: comments },
      created_at: now
    };
    setChangeLogs(prev => [log, ...prev]);
  };

  const resolveConflict = (conflictId: string, resolutionNotes: string, resolvedBy: string) => {
    const now = new Date().toISOString();
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return {
          ...c,
          resolved: true,
          resolution_status: 'RESOLVED',
          resolution_notes: resolutionNotes,
          resolved_by: resolvedBy,
          resolved_at: now,
          updated_at: now
        };
      }
      return c;
    }));
  };

  // CRUD for Branches
  const addBranch = (data: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
    const id = (branches.length + 1).toString();
    const now = new Date().toISOString();
    setBranches(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
  };
  const updateBranch = (id: string, data: Partial<Branch>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...data, updated_at: new Date().toISOString() } : b));
  };
  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  // CRUD for Majors
  const addMajor = (data: Omit<Major, 'id' | 'created_at' | 'updated_at'>) => {
    const id = (majors.length + 1).toString();
    const now = new Date().toISOString();
    setMajors(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
  };
  const updateMajor = (id: string, data: Partial<Major>) => {
    setMajors(prev => prev.map(m => m.id === id ? { ...m, ...data, updated_at: new Date().toISOString() } : m));
  };
  const deleteMajor = (id: string) => {
    setMajors(prev => prev.filter(m => m.id !== id));
  };

  // CRUD for Courses
  const addCourse = (data: Omit<Course, 'id' | 'created_at' | 'updated_at'>, majorIds: string[] = []) => {
    const id = (courses.length + 1).toString();
    const now = new Date().toISOString();
    setCourses(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
    if (majorIds.length > 0) {
      const links = majorIds.map(mid => ({ course_id: id, major_id: mid, created_at: now }));
      setCourseMajors(prev => [...prev, ...links]);
    }
  };
  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c));
  };
  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setCourseMajors(prev => prev.filter(cm => cm.course_id !== id));
  };

  // CRUD for Classrooms
  const addClassroom = (data: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>) => {
    const id = (classrooms.length + 1).toString();
    const now = new Date().toISOString();
    setClassrooms(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
  };
  const updateClassroom = (id: string, data: Partial<Classroom>) => {
    setClassrooms(prev => prev.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c));
  };
  const deleteClassroom = (id: string) => {
    setClassrooms(prev => prev.filter(c => c.id !== id));
  };

  // CRUD for Lecturers
  const addLecturer = (data: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>) => {
    const id = (lecturers.length + 1).toString();
    const now = new Date().toISOString();
    setLecturers(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
  };
  const updateLecturer = (id: string, data: Partial<Lecturer>) => {
    setLecturers(prev => prev.map(l => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l));
  };
  const deleteLecturer = (id: string) => {
    setLecturers(prev => prev.filter(l => l.id !== id));
  };

  // CRUD for Class Sections
  const addClassSection = (data: Omit<ClassSection, 'id' | 'created_at' | 'updated_at'>) => {
    const id = (classSections.length + 1).toString();
    const now = new Date().toISOString();
    setClassSections(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
  };
  const updateClassSection = (id: string, data: Partial<ClassSection>) => {
    setClassSections(prev => prev.map(s => s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s));
  };
  const deleteClassSection = (id: string) => {
    setClassSections(prev => prev.filter(s => s.id !== id));
  };

  // CRUD for Batches
  const addBatch = (data: Omit<Batch, 'id' | 'created_at' | 'updated_at'>): Batch => {
    const id = (batches.length > 0 ? Math.max(...batches.map(b => parseInt(b.id) || 0)) + 1 : 1).toString();
    const now = new Date().toISOString();
    const newBatch: Batch = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };
    setBatches(prev => [newBatch, ...prev]);
    return newBatch;
  };

  const updateBatch = (id: string, data: Partial<Batch>) => {
    const now = new Date().toISOString();
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...data, updated_at: now } : b));
  };

  const deleteBatch = (id: string): { success: boolean; message?: string } => {
    const schedRefs = schedules.filter(s => s.batch_id === id);
    if (schedRefs.length > 0) {
      return {
        success: false,
        message: `Cannot delete batch. It is currently referenced by ${schedRefs.length} operational schedule(s).`
      };
    }
    const secRefs = classSections.filter(c => c.batch_id === id);
    if (secRefs.length > 0) {
      return {
        success: false,
        message: `Cannot delete batch. It is currently linked to ${secRefs.length} cohort class section(s).`
      };
    }
    setBatches(prev => prev.filter(b => b.id !== id));
    return { success: true };
  };

  const toggleBatchStatus = (id: string) => {
    const now = new Date().toISOString();
    setBatches(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active, updated_at: now } : b));
  };

  // CRUD for Academic Years
  const addAcademicYear = (data: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>): { success: boolean; year?: AcademicYear; message?: string } => {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, message: 'Academic year name is required.' };
    }
    if (academicYears.some(y => y.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, message: `Academic year "${trimmedName}" already exists. Duplicate names are not permitted.` };
    }
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      return { success: false, message: 'End date must be strictly after start date.' };
    }

    const id = (academicYears.length > 0 ? Math.max(...academicYears.map(y => parseInt(y.id) || 0)) + 1 : 1).toString();
    const now = new Date().toISOString();
    const newYear: AcademicYear = {
      ...data,
      name: trimmedName,
      id,
      created_at: now,
      updated_at: now
    };

    setAcademicYears(prev => {
      let updated = [...prev];
      if (newYear.is_active) {
        updated = updated.map(y => ({ ...y, is_active: false }));
      }
      return [newYear, ...updated];
    });

    return { success: true, year: newYear };
  };

  const updateAcademicYear = (id: string, data: Partial<AcademicYear>): { success: boolean; message?: string } => {
    const current = academicYears.find(y => y.id === id);
    if (!current) {
      return { success: false, message: 'Academic year not found.' };
    }

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (!trimmed) {
        return { success: false, message: 'Academic year name cannot be empty.' };
      }
      if (academicYears.some(y => y.id !== id && y.name.trim().toLowerCase() === trimmed.toLowerCase())) {
        return { success: false, message: `Academic year "${trimmed}" already exists. Duplicate names are not permitted.` };
      }
    }

    const effectiveStart = data.start_date ?? current.start_date;
    const effectiveEnd = data.end_date ?? current.end_date;
    if (new Date(effectiveEnd) <= new Date(effectiveStart)) {
      return { success: false, message: 'End date must be strictly after start date.' };
    }

    const now = new Date().toISOString();
    setAcademicYears(prev => {
      return prev.map(y => {
        if (y.id === id) {
          return {
            ...y,
            ...data,
            name: data.name !== undefined ? data.name.trim() : y.name,
            updated_at: now
          };
        }
        if (data.is_active) {
          return { ...y, is_active: false };
        }
        return y;
      });
    });

    return { success: true };
  };

  const deleteAcademicYear = (id: string): { success: boolean; message?: string } => {
    const target = academicYears.find(y => y.id === id);
    if (!target) return { success: false, message: 'Academic year not found.' };

    if (target.is_active) {
      return { success: false, message: 'Cannot delete the currently active academic year. Please activate another academic year first.' };
    }

    const schedRefs = schedules.filter(s => s.academic_year_id === id);
    if (schedRefs.length > 0) {
      return {
        success: false,
        message: `Cannot delete academic year. It is referenced by ${schedRefs.length} schedule(s). Historical schedules and approval records must be preserved.`
      };
    }

    const batchRefs = batches.filter(b => b.academic_year_id === id);
    if (batchRefs.length > 0) {
      return {
        success: false,
        message: `Cannot delete academic year. It is linked to ${batchRefs.length} student cohort batch(es).`
      };
    }

    setAcademicYears(prev => prev.filter(y => y.id !== id));
    return { success: true };
  };

  const toggleAcademicYearStatus = (id: string): { success: boolean; message?: string } => {
    const target = academicYears.find(y => y.id === id);
    if (!target) return { success: false, message: 'Academic year not found.' };

    const now = new Date().toISOString();
    if (!target.is_active) {
      // Activating this one -> set all others inactive
      setAcademicYears(prev => prev.map(y => ({
        ...y,
        is_active: y.id === id,
        updated_at: y.id === id ? now : y.updated_at
      })));
    } else {
      // Deactivating this one
      setAcademicYears(prev => prev.map(y => y.id === id ? { ...y, is_active: false, updated_at: now } : y));
    }
    return { success: true };
  };

  const setActiveAcademicYear = (id: string): { success: boolean; message?: string } => {
    const target = academicYears.find(y => y.id === id);
    if (!target) return { success: false, message: 'Academic year not found.' };

    const now = new Date().toISOString();
    setAcademicYears(prev => prev.map(y => ({
      ...y,
      is_active: y.id === id,
      updated_at: y.id === id ? now : y.updated_at
    })));
    return { success: true };
  };

  // CRUD for Users
  const addUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const id = (users.length + 1).toString();
    const now = new Date().toISOString();
    setUsers(prev => [...prev, { ...data, id, created_at: now, updated_at: now }]);
  };
  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data, updated_at: new Date().toISOString() } : u));
  };
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // System Setting update
  const updateSystemSetting = (key: string, value: string, userId: string) => {
    const now = new Date().toISOString();
    setSystemSettings(prev => prev.map(s => {
      if (s.setting_key === key) {
        return { ...s, setting_value: value, updated_by: userId, updated_at: now };
      }
      return s;
    }));
  };

  // Update lecturer availability
  const updateLecturerAvailability = (avail: Omit<LecturerAvailability, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    setLecturerAvailabilities(prev => {
      const exists = prev.find(a => a.lecturer_id === avail.lecturer_id && a.branch_id === avail.branch_id && a.time_slot_id === avail.time_slot_id);
      if (exists) {
        return prev.map(a => a.id === exists.id ? { ...a, ...avail, updated_at: now } : a);
      } else {
        const id = (prev.length + 1).toString();
        return [...prev, { ...avail, id, created_at: now, updated_at: now }];
      }
    });
  };

  // Update Time Slot Sessions Configuration
  const updateTimeSlotSessions = (
    slotId: string,
    config: {
      session_1_start: string;
      session_1_end: string;
      break_start?: string;
      break_end?: string;
      session_2_start: string;
      session_2_end: string;
    },
    applyToPeriod: boolean = false
  ) => {
    setTimeSlots(prev => {
      const target = prev.find(s => s.id === slotId);
      if (!target) return prev;

      const now = new Date().toISOString();
      const s1Duration = calculateDurationMinutes(config.session_1_start, config.session_1_end) || 90;
      const bDuration = config.break_start && config.break_end
        ? calculateDurationMinutes(config.break_start, config.break_end)
        : 10;

      const updated = prev.map(s => {
        const shouldUpdate = applyToPeriod
          ? s.period === target.period
          : s.id === slotId;

        if (!shouldUpdate) return s;

        return {
          ...s,
          start_time: config.session_1_start,
          end_time: config.session_2_end,
          session_1_start: config.session_1_start,
          session_1_end: config.session_1_end,
          break_start: config.break_start,
          break_end: config.break_end,
          session_2_start: config.session_2_start,
          session_2_end: config.session_2_end,
          session_duration_minutes: s1Duration,
          break_duration_minutes: bDuration,
          updated_at: now
        };
      });

      return updated;
    });
  };

  // Department CRUD
  const addDepartment = (data: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Department => {
    const id = (departments.length > 0 ? Math.max(...departments.map(d => parseInt(d.id) || 0)) + 1 : 1).toString();
    const now = new Date().toISOString();
    const newDept: Department = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };
    setDepartments(prev => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    const now = new Date().toISOString();
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data, updated_at: now } : d));

    // If Dean assignment changed, update pending schedules for this department
    if (data.dean_user_id !== undefined) {
      setSchedules(prev => prev.map(s => {
        if (s.department_id === id && s.status === 'ADMIN_APPROVED') {
          return { ...s, dean_assigned_to: data.dean_user_id, updated_at: now };
        }
        return s;
      }));
    }
  };

  const deleteDepartment = (id: string): { success: boolean; message?: string } => {
    const hasMajors = majors.some(m => m.department_id === id);
    const hasSchedules = schedules.some(s => s.department_id === id);
    if (hasMajors || hasSchedules) {
      return {
        success: false,
        message: `Cannot delete department: It is currently linked to ${hasMajors ? 'academic majors' : ''}${hasMajors && hasSchedules ? ' and ' : ''}${hasSchedules ? 'operational schedules' : ''}.`
      };
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
    return { success: true };
  };

  const assignDeanToDepartment = (departmentId: string, deanUserId: string | null) => {
    updateDepartment(departmentId, { dean_user_id: deanUserId });
  };

  // Reset demo
  const resetDemoData = () => {
    localStorage.clear();
    setAcademicYears(initialAcademicYears);
    setSemesters(initialSemesters);
    setBranches(initialBranches);
    setMajors(initialMajors);
    setCourses(initialCourses);
    setCourseMajors(initialCourseMajors);
    setLecturers(initialLecturers);
    setClassrooms(initialClassrooms);
    setTimeSlots(initialTimeSlots);
    setLecturerAvailabilities(initialLecturerAvailabilities);
    setClassSections(initialClassSections);
    setBatches(initialBatches);
    setDepartments(initialDepartments);
    setSchedules(initialSchedules);
    setScheduleClassSections(initialScheduleClassSections);
    setConflicts(initialScheduleConflicts);
    setApprovalHistory(initialScheduleApprovalHistory);
    setChangeLogs(initialScheduleChangeLogs);
    setSystemSettings(initialSystemSettings);
    setUsers(initialUsers);
  };

  return (
    <OperationsContext.Provider
      value={{
        academicYears,
        semesters,
        branches,
        majors,
        courses,
        courseMajors,
        lecturers,
        lecturerBranches,
        lecturerCourses,
        classrooms,
        timeSlots,
        lecturerAvailabilities,
        classSections,
        batches,
        departments,
        schedules,
        scheduleClassSections,
        conflicts,
        approvalHistory,
        changeLogs,
        systemSettings,
        users,
        hydratedSchedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        submitSchedule,
        startReviewSchedule,
        approveSchedule,
        adminApproveSchedule,
        deanCheckSchedule,
        returnScheduleForRevision,
        rejectSchedule,
        resolveConflict,
        addBranch,
        updateBranch,
        deleteBranch,
        addMajor,
        updateMajor,
        deleteMajor,
        addCourse,
        updateCourse,
        deleteCourse,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        addLecturer,
        updateLecturer,
        deleteLecturer,
        addClassSection,
        updateClassSection,
        deleteClassSection,
        addBatch,
        updateBatch,
        deleteBatch,
        toggleBatchStatus,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        toggleAcademicYearStatus,
        setActiveAcademicYear,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        assignDeanToDepartment,
        updateTimeSlotSessions,
        addUser,
        updateUser,
        deleteUser,
        updateSystemSetting,
        updateLecturerAvailability,
        checkLecturerAvailabilityForWindow,
        getAvailableTimeWindowsForLecturer,
        resetDemoData
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};

