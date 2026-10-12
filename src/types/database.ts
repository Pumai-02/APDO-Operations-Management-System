/**
 * APDO Operations Management System
 * Database Types & Models (PostgreSQL & DBML Schema Representation)
 * 
 * Note: BIGINT primary and foreign keys are represented as strings
 * for safe transmission over JSON REST APIs without precision loss.
 */

export type UserRole = 'ADMIN' | 'DEAN' | 'LECTURER';

export type ScheduleType = 'NORMAL' | 'COMBINED';

export type ScheduleStatus = 
  | 'DRAFT' 
  | 'PENDING_ADMIN_APPROVAL' 
  | 'SUBMITTED' 
  | 'ADMIN_APPROVED' 
  | 'PENDING_DEAN_VERIFICATION' 
  | 'DEAN_CHECKED' 
  | 'FULLY_APPROVED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'RETURNED_FOR_REVISION' 
  | 'UNDER_REVIEW';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type TimePeriod = 'Morning' | 'Afternoon' | 'Evening';

export type ConflictType = 
  | 'LECTURER_CONFLICT' 
  | 'CLASSROOM_CONFLICT' 
  | 'CLASS_SECTION_CONFLICT' 
  | 'BRANCH_CONFLICT' 
  | 'TIMESLOT_CONFLICT'
  | 'AVAILABILITY';

export type ConflictSeverity = 'WARNING' | 'ERROR' | 'CRITICAL';

export type ResolutionStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED';

export type ApprovalAction = 
  | 'SUBMITTED' 
  | 'REVIEW_STARTED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'RESUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'ADMIN_APPROVED'
  | 'DEAN_CHECKED'
  | 'FULLY_APPROVED'
  | 'RETURNED_FOR_REVISION'
  | 'APPROVAL_INVALIDATED'
  | 'SIGNATURE_UPLOADED'
  | 'STAMP_UPLOADED';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export type RoomType = 'CLASSROOM' | 'LECTURE_HALL' | 'COMPUTER_LAB' | 'SEMINAR_ROOM' | 'WORKSHOP';

// --- Database Table Entities ---

export interface User {
  id: string; // BIGINT
  role: UserRole; // ADMIN, DEAN, LECTURER
  name: string; // varchar(150)
  email: string; // varchar(255)
  password?: string; // hashed in backend
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string; // BIGINT
  name: string; // e.g. "2025-2026", "2026-2027"
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_active: boolean;
  description?: string; // Optional description/notes
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string; // BIGINT
  academic_year_id: string; // BIGINT FK
  name: string; // "Semester 1", "Semester 2"
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string; // BIGINT
  name: string; // varchar(150)
  code: string; // varchar(30) e.g. "MAIN-HQ", "WEST-CAMPUS"
  address: string; // text
  phone: string; // varchar(30)
  contact_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string; // BIGINT
  name: string; // varchar(150) e.g. "Department of Computer Science & Information Technology"
  code: string; // varchar(30) e.g. "CSIT", "BUS", "ENG"
  faculty_name?: string; // varchar(150) e.g. "Faculty of Science and Technology"
  branch_id?: string; // BIGINT FK to branches.id
  dean_user_id: string | null; // BIGINT FK to users.id (The assigned Dean)
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Major {
  id: string; // BIGINT
  branch_id: string; // BIGINT FK
  department_id?: string | null; // BIGINT FK to departments.id
  name: string; // varchar(150)
  code: string; // varchar(30) e.g. "CS", "SE", "BA"
  description: string; // text
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string; // BIGINT
  code: string; // varchar(30) e.g. "CS101", "SE302"
  name: string; // varchar(200)
  department_id?: string | null; // BIGINT FK to departments.id
  description: string;
  credits: number; // integer / credit_hours numeric(4,1)
  year_level?: number; // 1-8
  semester_id?: string; // BIGINT FK
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseMajor {
  course_id: string; // BIGINT FK
  major_id: string; // BIGINT FK
  created_at: string;
}

export interface Lecturer {
  id: string; // BIGINT
  user_id: string | null; // BIGINT FK to users.id
  lecturer_code: string; // varchar(30) e.g. "LEC-001"
  name: string; // full_name
  email: string;
  phone: string; // varchar(30)
  specialization: string; // varchar(150) e.g. "Artificial Intelligence", "Database Systems"
  max_hours_per_week: number; // integer e.g. 20
  employment_status: EmploymentStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LecturerBranch {
  lecturer_id: string; // BIGINT FK
  branch_id: string; // BIGINT FK
  created_at: string;
}

export interface LecturerCourse {
  lecturer_id: string; // BIGINT FK
  course_id: string; // BIGINT FK
  created_at: string;
}

export interface Classroom {
  id: string; // BIGINT
  branch_id: string; // BIGINT FK
  room_number: string; // varchar(50) e.g. "LH-101", "LAB-3"
  building?: string; // varchar(100)
  capacity: number; // integer
  room_type: RoomType; // varchar(50)
  equipment?: string; // text e.g. "Projector, Audio System, 40 Workstations"
  is_available: boolean; // boolean
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export type SessionNumber = 1 | 2 | 3; // 1 = Session 1, 2 = Session 2, 3 = Both Sessions (Dual Session)

export interface TimeSlot {
  id: string; // BIGINT
  day_of_week: DayOfWeek | number; // Monday..Sunday or 1..7
  period: TimePeriod; // Morning, Afternoon, Evening
  start_time: string; // HH:mm:ss e.g. "17:30:00" (Window start)
  end_time: string; // HH:mm:ss e.g. "20:40:00" (Window end)
  session_1_start: string; // HH:mm:ss e.g. "17:30:00"
  session_1_end: string; // HH:mm:ss e.g. "19:00:00"
  break_start?: string; // HH:mm:ss e.g. "19:00:00"
  break_end?: string; // HH:mm:ss e.g. "19:10:00"
  session_2_start: string; // HH:mm:ss e.g. "19:10:00"
  session_2_end: string; // HH:mm:ss e.g. "20:40:00"
  session_duration_minutes?: number; // e.g. 90
  break_duration_minutes?: number; // e.g. 10
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LecturerAvailability {
  id: string; // BIGINT
  lecturer_id: string; // BIGINT FK
  branch_id: string; // BIGINT FK
  time_slot_id: string; // BIGINT FK
  is_available: boolean;
  session_1_available?: boolean; // Specific availability for Session 1 within window
  session_2_available?: boolean; // Specific availability for Session 2 within window
  availability_status?: 'AVAILABLE' | 'UNAVAILABLE' | 'PREFERRED';
  note: string; // text
  confirmed_by_user_id?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string; // BIGINT
  batch_name: string; // varchar(150) e.g. "Batch 2026 (Computer Science)"
  batch_code: string; // varchar(50) e.g. "B2026-MAIN"
  academic_year_id: string; // BIGINT FK to academic_years.id
  branch_id: string; // BIGINT FK to branches.id
  major_id: string | null; // BIGINT FK to majors.id
  intake_period?: string; // varchar(50) e.g. "Fall 2026", "Spring 2026"
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ClassSection {
  id: string; // BIGINT
  branch_id: string; // BIGINT FK
  major_id: string; // BIGINT FK
  semester_id: string; // BIGINT FK
  batch_id?: string | null; // BIGINT FK to batches.id
  year_level: number; // integer 1-8
  section_name: string; // varchar(100) e.g. "Section A", "CS-Y2-A"
  display_name?: string;
  student_count: number; // integer
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string; // BIGINT
  semester_id: string; // BIGINT FK
  academic_year_id?: string; // BIGINT FK
  branch_id: string; // BIGINT FK
  course_id: string; // BIGINT FK
  lecturer_id: string; // BIGINT FK
  classroom_id: string; // BIGINT FK
  time_slot_id: string; // BIGINT FK
  session_number?: SessionNumber; // 1 | 2 | 3 (defaults to 1; 3 = Both Sessions)
  selected_sessions?: (1 | 2)[]; // [1], [2], or [1, 2]
  batch_id?: string | null; // BIGINT FK to batches.id
  schedule_type: ScheduleType; // NORMAL | COMBINED
  status: ScheduleStatus; // DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED
  duration_minutes: number; // integer e.g. 210
  scheduled_date: string; // YYYY-MM-DD
  created_by: string; // BIGINT FK to users.id
  approved_by?: string | null; // BIGINT FK to users.id
  approved_at?: string | null; // ISO timestamp
  remarks: string; // text
  created_at: string;
  updated_at: string;

  // --- Formal Two-Stage Approval & Stamp Fields ---
  // Stage 1: Admin Approval
  admin_approved_by?: string | null; // BIGINT FK to users.id
  admin_approved_at?: string | null; // ISO timestamp
  admin_signature_url?: string | null; // Data URL or image path
  admin_stamp_url?: string | null; // Data URL or image path
  admin_remarks?: string | null;

  // Stage 2: Dean Verification
  dean_checked_by?: string | null; // BIGINT FK to users.id
  dean_checked_at?: string | null; // ISO timestamp
  dean_signature_url?: string | null; // Data URL or image path
  dean_remarks?: string | null;

  // Department & Dean Routing
  department_id?: string | null; // BIGINT FK to departments.id
  dean_assigned_to?: string | null; // BIGINT FK to users.id (Specific department Dean routed for review)

  // Rejection & Revision Reasons
  rejection_reason?: string | null;
  revision_requested_reason?: string | null;
}

export interface ScheduleClassSection {
  schedule_id: string; // BIGINT FK
  class_section_id: string; // BIGINT FK
}

export interface ScheduleConflict {
  id: string; // BIGINT
  schedule_id: string; // BIGINT FK
  conflicting_schedule_id: string | null; // BIGINT FK
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  resolved: boolean;
  resolution_status: ResolutionStatus;
  resolution_notes?: string;
  resolved_by: string | null; // BIGINT FK
  resolved_at: string | null;
  detected_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleApprovalHistory {
  id: string; // BIGINT
  schedule_id: string; // BIGINT FK
  reviewer_id: string; // BIGINT FK to users.id
  action: ApprovalAction;
  status: ScheduleStatus;
  comments: string;
  signature_url?: string;
  stamp_url?: string;
  reviewed_at: string;
  created_at: string;
}

export interface ScheduleChangeLog {
  id: string; // BIGINT
  schedule_id: string; // BIGINT FK
  changed_by: string; // BIGINT FK to users.id
  action: string;
  change_description: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface SystemSetting {
  id: string; // BIGINT
  setting_key: string;
  setting_value: string; // stored as string / JSON text
  description: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- Joined / Hydrated Types for Rich Enterprise UI Display ---

export interface HydratedSchedule extends Schedule {
  academicYearId?: string;
  academicYearName?: string;
  isAcademicYearActive?: boolean;
  semesterName?: string;
  branchName?: string;
  branchCode?: string;
  courseCode?: string;
  courseName?: string;
  lecturerName?: string;
  lecturerCode?: string;
  lecturerPhone?: string;
  classroomNumber?: string;
  classroomCapacity?: number;
  timeSlotDay?: DayOfWeek;
  timeSlotPeriod?: TimePeriod;
  timeSlotStart?: string;
  timeSlotEnd?: string;
  sessionNumber?: SessionNumber;
  selected_sessions?: (1 | 2)[];
  sessionLabel?: string;
  effectiveStartTime?: string;
  effectiveEndTime?: string;
  effectiveStartTime12h?: string;
  effectiveEndTime12h?: string;
  linkedSectionIds: string[];
  linkedSectionNames: string[];
  conflictsCount: number;
  batchId?: string;
  batchName?: string;
  batchCode?: string;
  adminApproverName?: string;
  adminApproverRole?: string;
  deanCheckerName?: string;
  deanCheckerRole?: string;
  // Department & Assigned Dean Details
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  facultyName?: string;
  departmentDeanUserId?: string | null;
  departmentDeanName?: string;
  departmentDeanEmail?: string;
}
