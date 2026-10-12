import { 
  User, AcademicYear, Semester, Branch, Major, Course, CourseMajor,
  Lecturer, LecturerBranch, LecturerCourse, Classroom, TimeSlot,
  LecturerAvailability, ClassSection, Schedule, ScheduleClassSection,
  ScheduleConflict, ScheduleApprovalHistory, ScheduleChangeLog, SystemSetting,
  Batch, Department
} from '../types/database';
import {
  SAMPLE_OFFICIAL_STAMP_URL,
  SAMPLE_ADMIN_SIGNATURE_URL,
  SAMPLE_DEAN_SIGNATURE_URL,
  SAMPLE_DEAN_VANCE_SIGNATURE_URL,
  SAMPLE_DEAN_BRADLEY_SIGNATURE_URL,
  SAMPLE_DEAN_ROSTOVA_SIGNATURE_URL,
  SAMPLE_DEAN_MEAS_SIGNATURE_URL
} from '../utils/approvalAssets';

export const initialUsers: User[] = [
  {
    id: '1',
    role: 'ADMIN',
    name: 'Dr. Sarah Sterling',
    email: 'admin.sterling@apdo.org',
    is_active: true,
    email_verified_at: '2025-01-15T08:00:00Z',
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2026-02-11T14:30:00Z'
  },
  {
    id: '2',
    role: 'DEAN',
    name: 'Prof. Robert Vance',
    email: 'dean.vance@apdo.org',
    is_active: true,
    email_verified_at: '2025-01-16T10:00:00Z',
    created_at: '2025-01-12T11:00:00Z',
    updated_at: '2026-03-01T08:20:00Z'
  },
  {
    id: '3',
    role: 'LECTURER',
    name: 'Dr. Alexander Chen',
    email: 'alexander.chen@apdo.org',
    is_active: true,
    email_verified_at: '2025-02-01T12:00:00Z',
    created_at: '2025-02-01T12:00:00Z',
    updated_at: '2026-01-15T16:00:00Z'
  },
  {
    id: '4',
    role: 'LECTURER',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@apdo.org',
    is_active: true,
    email_verified_at: '2025-02-10T09:30:00Z',
    created_at: '2025-02-10T09:30:00Z',
    updated_at: '2026-01-20T10:15:00Z'
  },
  {
    id: '5',
    role: 'DEAN',
    name: 'Dr. Marcus Bradley',
    email: 'dean.bradley@apdo.org',
    is_active: true,
    email_verified_at: '2025-03-01T08:00:00Z',
    created_at: '2025-03-01T08:00:00Z',
    updated_at: '2026-02-14T11:00:00Z'
  },
  {
    id: '6',
    role: 'DEAN',
    name: 'Dr. Elena Rostova',
    email: 'dean.rostova@apdo.org',
    is_active: true,
    email_verified_at: '2025-03-15T09:00:00Z',
    created_at: '2025-03-15T09:00:00Z',
    updated_at: '2026-02-15T11:00:00Z'
  },
  {
    id: '7',
    role: 'DEAN',
    name: 'Dr. Sophal Meas',
    email: 'dean.meas@apdo.org',
    is_active: true,
    email_verified_at: '2025-03-20T09:00:00Z',
    created_at: '2025-03-20T09:00:00Z',
    updated_at: '2026-02-20T11:00:00Z'
  }
];

export const initialAcademicYears: AcademicYear[] = [
  {
    id: '1',
    name: '2025-2026',
    start_date: '2025-09-01',
    end_date: '2026-06-30',
    is_active: false,
    description: 'Previous Academic Cycle • Archived Timetables and Historical Approval Records',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '2026-2027',
    start_date: '2026-09-01',
    end_date: '2027-06-30',
    is_active: true,
    description: 'Current Operational University Academic Year • Western University Active Timetable',
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z'
  },
  {
    id: '3',
    name: '2027-2028',
    start_date: '2027-09-01',
    end_date: '2028-06-30',
    is_active: false,
    description: 'Upcoming Academic Cycle • Advance Curriculum & Scheduling Preparation',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z'
  }
];

export const initialSemesters: Semester[] = [
  {
    id: '1',
    academic_year_id: '2',
    name: 'Semester 1',
    start_date: '2026-09-01',
    end_date: '2027-01-25',
    is_active: true,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },
  {
    id: '2',
    academic_year_id: '2',
    name: 'Semester 2',
    start_date: '2027-02-10',
    end_date: '2027-06-30',
    is_active: false,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  }
];

export const initialBranches: Branch[] = [
  {
    id: '1',
    name: 'Toul Kork Campus',
    code: 'TK-01',
    address: 'Street 592, Toul Kork, Phnom Penh',
    phone: '+855 23 990 123',
    contact_email: 'toulkork.ops@western.edu.kh',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Metro Center Operations Branch',
    code: 'METRO-02',
    address: '450 Financial District Ave, Downtown',
    phone: '+1 (555) 876-5432',
    contact_email: 'metro.ops@apdo.org',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Innovation & Science Park Branch',
    code: 'INNO-03',
    address: '88 High-Tech Blvd, Science Park',
    phone: '+1 (555) 345-6789',
    contact_email: 'inno.ops@apdo.org',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialDepartments: Department[] = [
  {
    id: '1',
    name: 'Department of Computer Science & Information Technology',
    code: 'CSIT',
    faculty_name: 'Faculty of Science and Technology',
    branch_id: '1',
    dean_user_id: '2', // Prof. Robert Vance
    description: 'Core computing, software engineering, systems architecture, data analytics, and network infrastructure.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Department of Business Administration & Accounting',
    code: 'BUS',
    faculty_name: 'Faculty of Business and Tourism',
    branch_id: '1',
    dean_user_id: '5', // Dr. Marcus Bradley
    description: 'Corporate finance, managerial accounting, financial audits, strategic marketing, and enterprise management.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Department of Engineering & Architecture',
    code: 'ENG',
    faculty_name: 'Faculty of Engineering',
    branch_id: '1',
    dean_user_id: '6', // Dr. Elena Rostova
    description: 'Structural architecture, robotics engineering, telecommunications, and urban design.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Department of Foreign Languages & Humanities',
    code: 'LANG',
    faculty_name: 'Faculty of Arts, Humanities & Languages',
    branch_id: '1',
    dean_user_id: '7', // Dr. Sophal Meas
    description: 'Professional English, translation, intercultural communications, and international diplomacy.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialMajors: Major[] = [
  {
    id: '1',
    branch_id: '1',
    department_id: '1',
    name: 'Computer Science (CSE402) and Computer Network and Technology',
    code: 'CSE402',
    description: 'Foundational computing, algorithm engineering, and distributed systems.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    branch_id: '1',
    department_id: '1',
    name: 'Software Engineering',
    code: 'SE',
    description: 'Enterprise software architecture, lifecycle design, and quality assurance.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    branch_id: '2',
    department_id: '1',
    name: 'Information Technology',
    code: 'IT',
    description: 'Network infrastructure, cloud management, and systems administration.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    branch_id: '2',
    department_id: '1',
    name: 'Cyber Security Operations',
    code: 'CYB',
    description: 'Defensive architecture, digital forensics, and threat response.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    branch_id: '3',
    department_id: '1',
    name: 'Data Science & Intelligence',
    code: 'DSI',
    description: 'Applied machine learning, big data analytics, and operational intelligence.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    branch_id: '1',
    department_id: '2',
    name: 'Accounting & Financial Management',
    code: 'ACC',
    description: 'Auditing, corporate financial statements, taxation, and accounting software.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    branch_id: '1',
    department_id: '2',
    name: 'Business Administration & Management',
    code: 'BA',
    description: 'Strategic management, organizational leadership, marketing, and entrepreneurship.',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialCourses: Course[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Structured Programming & Algorithms',
    description: 'Core syntax, algorithmic reasoning, and problem solving paradigms.',
    credits: 3,
    year_level: 1,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'CS201',
    name: 'Data Structures & Algorithmic Complexity',
    description: 'Trees, graphs, dynamic programming, and computational performance analysis.',
    credits: 4,
    year_level: 2,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    code: 'SE302',
    name: 'Enterprise Architecture & Cloud Systems',
    description: 'Microservices, message queues, containerization, and RESTful service modeling.',
    credits: 4,
    year_level: 3,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    code: 'CS305',
    name: 'Relational Database Engineering & PostgreSQL',
    description: 'ACID transactions, relational normalization, query optimization, and DBML schemas.',
    credits: 4,
    year_level: 3,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    code: 'IT204',
    name: 'High-Availability Network Infrastructure',
    description: 'TCP/IP routing, VLANs, subnetting, and software-defined networks.',
    credits: 3,
    year_level: 2,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    code: 'CYB301',
    name: 'Cryptographic Protocols & Applied Defense',
    description: 'Symmetric and asymmetric encryption, PKI architectures, and security compliance.',
    credits: 3,
    year_level: 3,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    code: 'DSI401',
    name: 'Operational Machine Learning & Analytics',
    description: 'Predictive modeling, data pipelines, model deployment, and monitoring.',
    credits: 4,
    year_level: 4,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '8',
    code: 'STAM401',
    name: 'AI and Machine Learning',
    description: 'Artificial intelligence paradigms, heuristic search, neural architectures and machine learning systems.',
    credits: 4,
    year_level: 4,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '9',
    code: 'STLA401',
    name: 'Linux Server Administration',
    description: 'Enterprise Linux kernel tuning, systemd, storage management, security hardening and server orchestration.',
    credits: 3,
    year_level: 4,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '10',
    code: 'STSE401',
    name: 'Software Engineering SDLC',
    description: 'Modern software development lifecycle, requirements engineering, Agile frameworks and automated testing.',
    credits: 3,
    year_level: 4,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '11',
    code: 'STCA401',
    name: 'Cross-Plateform Application Development',
    description: 'Cross-platform mobile and web application architectures, reactive state management and native bridging.',
    credits: 3,
    year_level: 4,
    semester_id: '1',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialCourseMajors: CourseMajor[] = [
  { course_id: '1', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '1', major_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '8', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '9', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '10', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '11', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '2', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '2', major_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '3', major_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '4', major_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '4', major_id: '3', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '5', major_id: '3', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '6', major_id: '4', created_at: '2025-01-01T00:00:00Z' },
  { course_id: '7', major_id: '5', created_at: '2025-01-01T00:00:00Z' }
];

export const initialLecturers: Lecturer[] = [
  {
    id: '1',
    user_id: '3',
    lecturer_code: 'LEC-101',
    name: 'Dr. Alexander Chen',
    email: 'alexander.chen@apdo.org',
    phone: '+1 (555) 432-1098',
    specialization: 'Distributed Systems & Algorithms',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: '4',
    lecturer_code: 'LEC-102',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@apdo.org',
    phone: '+1 (555) 654-3210',
    specialization: 'Database Systems & Relational Architectures',
    max_hours_per_week: 18,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: null,
    lecturer_code: 'LEC-103',
    name: 'Prof. David Miller',
    email: 'david.miller@apdo.org',
    phone: '+1 (555) 789-0123',
    specialization: 'Software Architecture & Cloud Engineering',
    max_hours_per_week: 16,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    user_id: null,
    lecturer_code: 'LEC-104',
    name: 'Dr. Aisha Patel',
    email: 'aisha.patel@apdo.org',
    phone: '+1 (555) 890-1234',
    specialization: 'Cybersecurity & Infrastructure Protocols',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    user_id: null,
    lecturer_code: 'LEC-105',
    name: 'Dr. Lucas Thorne',
    email: 'lucas.thorne@apdo.org',
    phone: '+1 (555) 901-2345',
    specialization: 'Applied Machine Learning & Operational AI',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    user_id: null,
    lecturer_code: 'LEC-106',
    name: 'Dr. Rachel Adams',
    email: 'rachel.adams@apdo.org',
    phone: '+1 (555) 012-3456',
    specialization: 'Programming Fundamentals',
    max_hours_per_week: 15,
    employment_status: 'ON_LEAVE',
    is_active: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    user_id: null,
    lecturer_code: 'LEC-PANHRA',
    name: 'Mr. LEANG Panhra',
    email: 'leang.panhra@western.edu.kh',
    phone: '077 426 333',
    specialization: 'AI and Machine Learning',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '8',
    user_id: null,
    lecturer_code: 'LEC-SATIA',
    name: 'Mr. EAP Satia',
    email: 'eap.satia@western.edu.kh',
    phone: '070 549 456',
    specialization: 'Linux Server Administration',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '9',
    user_id: null,
    lecturer_code: 'LEC-MESA',
    name: 'Mr. ROEUN Mesa',
    email: 'roeun.mesa@western.edu.kh',
    phone: '081 542 219',
    specialization: 'Software Engineering SDLC',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '10',
    user_id: null,
    lecturer_code: 'LEC-CHUMKONGKEAR',
    name: 'Mr. SVAY Chumkongkear',
    email: 'svay.chumkongkear@western.edu.kh',
    phone: '095 240 003',
    specialization: 'Cross-Plateform Application Development',
    max_hours_per_week: 20,
    employment_status: 'ACTIVE',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialLecturerBranches: LecturerBranch[] = [
  { lecturer_id: '1', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '1', branch_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '2', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '2', branch_id: '3', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '3', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '4', branch_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '5', branch_id: '3', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '6', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '7', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '8', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '9', branch_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '10', branch_id: '1', created_at: '2025-01-01T00:00:00Z' }
];

export const initialLecturerCourses: LecturerCourse[] = [
  { lecturer_id: '1', course_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '1', course_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '2', course_id: '4', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '2', course_id: '1', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '3', course_id: '3', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '3', course_id: '2', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '4', course_id: '5', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '4', course_id: '6', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '5', course_id: '7', created_at: '2025-01-01T00:00:00Z' },
  { lecturer_id: '6', course_id: '1', created_at: '2025-01-01T00:00:00Z' }
];

export const initialClassrooms: Classroom[] = [
  {
    id: '1',
    branch_id: '1',
    room_number: 'LH-101',
    building: 'Turing Operational Hall',
    capacity: 120,
    room_type: 'LECTURE_HALL',
    equipment: 'Dual 4K Laser Projectors, Surround Mic, Smart Lectern',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    branch_id: '1',
    room_number: 'LAB-201',
    building: 'Computing Systems Block A',
    capacity: 45,
    room_type: 'COMPUTER_LAB',
    equipment: '45 High-Spec Linux Workstations, Enterprise Gigabit LAN',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    branch_id: '1',
    room_number: 'SR-301',
    building: 'Academic Affairs Wing',
    capacity: 35,
    room_type: 'SEMINAR_ROOM',
    equipment: 'Interactive Display Panel, Video Conferencing Rig',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    branch_id: '1',
    room_number: 'CR-102',
    building: 'Turing Operational Hall',
    capacity: 55,
    room_type: 'CLASSROOM',
    equipment: 'Ceiling Projector, Tiered Seating, Glass Whiteboard',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    branch_id: '2',
    room_number: 'METRO-LH1',
    building: 'Financial Center Tower 2',
    capacity: 90,
    room_type: 'LECTURE_HALL',
    equipment: 'Acoustic Wall Panels, Overhead Digital Audio Array',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    branch_id: '2',
    room_number: 'METRO-LAB2',
    building: 'Financial Center Tower 2',
    capacity: 40,
    room_type: 'COMPUTER_LAB',
    equipment: '40 Dual-Monitor Workstations, Cisco Switch Racks',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    branch_id: '3',
    room_number: 'INNO-LAB1',
    building: 'High-Tech Research Complex',
    capacity: 50,
    room_type: 'COMPUTER_LAB',
    equipment: 'GPU Accelerated Compute Cluster, Multi-Screen Matrix',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '8',
    branch_id: '3',
    room_number: 'INNO-CR1',
    building: 'High-Tech Research Complex',
    capacity: 40,
    room_type: 'CLASSROOM',
    equipment: 'Smart Interactive Board, Movable Modular Pods',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '9',
    branch_id: '1',
    room_number: '302',
    building: 'Building A',
    capacity: 45,
    room_type: 'CLASSROOM',
    equipment: 'Interactive Smart Board, Air Conditioning, Audio System',
    is_available: true,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialTimeSlots: TimeSlot[] = [
  // Monday (1)
  {
    id: '1', day_of_week: 'Monday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2', day_of_week: 'Monday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3', day_of_week: 'Monday', period: 'Evening',
    start_time: '17:30:00', end_time: '20:40:00',
    session_1_start: '17:30:00', session_1_end: '19:00:00',
    break_start: '19:00:00', break_end: '19:10:00',
    session_2_start: '19:10:00', session_2_end: '20:40:00',
    session_duration_minutes: 90, break_duration_minutes: 10,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  // Tuesday (2)
  {
    id: '4', day_of_week: 'Tuesday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5', day_of_week: 'Tuesday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6', day_of_week: 'Tuesday', period: 'Evening',
    start_time: '17:30:00', end_time: '20:40:00',
    session_1_start: '17:30:00', session_1_end: '19:00:00',
    break_start: '19:00:00', break_end: '19:10:00',
    session_2_start: '19:10:00', session_2_end: '20:40:00',
    session_duration_minutes: 90, break_duration_minutes: 10,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  // Wednesday (3)
  {
    id: '7', day_of_week: 'Wednesday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '8', day_of_week: 'Wednesday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '9', day_of_week: 'Wednesday', period: 'Evening',
    start_time: '17:30:00', end_time: '20:40:00',
    session_1_start: '17:30:00', session_1_end: '19:00:00',
    break_start: '19:00:00', break_end: '19:10:00',
    session_2_start: '19:10:00', session_2_end: '20:40:00',
    session_duration_minutes: 90, break_duration_minutes: 10,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  // Thursday (4)
  {
    id: '10', day_of_week: 'Thursday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '11', day_of_week: 'Thursday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '12', day_of_week: 'Thursday', period: 'Evening',
    start_time: '17:30:00', end_time: '20:40:00',
    session_1_start: '17:30:00', session_1_end: '19:00:00',
    break_start: '19:00:00', break_end: '19:10:00',
    session_2_start: '19:10:00', session_2_end: '20:40:00',
    session_duration_minutes: 90, break_duration_minutes: 10,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  // Friday (5)
  {
    id: '13', day_of_week: 'Friday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '14', day_of_week: 'Friday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '15', day_of_week: 'Friday', period: 'Evening',
    start_time: '17:30:00', end_time: '20:40:00',
    session_1_start: '17:30:00', session_1_end: '19:00:00',
    break_start: '19:00:00', break_end: '19:10:00',
    session_2_start: '19:10:00', session_2_end: '20:40:00',
    session_duration_minutes: 90, break_duration_minutes: 10,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  // Saturday (6)
  {
    id: '16', day_of_week: 'Saturday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '17', day_of_week: 'Saturday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  // Sunday (7)
  {
    id: '18', day_of_week: 'Sunday', period: 'Morning',
    start_time: '08:00:00', end_time: '11:15:00',
    session_1_start: '08:00:00', session_1_end: '09:30:00',
    break_start: '09:30:00', break_end: '09:45:00',
    session_2_start: '09:45:00', session_2_end: '11:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '19', day_of_week: 'Sunday', period: 'Afternoon',
    start_time: '13:00:00', end_time: '16:15:00',
    session_1_start: '13:00:00', session_1_end: '14:30:00',
    break_start: '14:30:00', break_end: '14:45:00',
    session_2_start: '14:45:00', session_2_end: '16:15:00',
    session_duration_minutes: 90, break_duration_minutes: 15,
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialBatches: Batch[] = [
  {
    id: '1',
    batch_name: 'Batch 2026 (Freshman Cohort)',
    batch_code: 'B2026-MAIN',
    academic_year_id: '2', // 2026-2027
    branch_id: '1', // Main Campus
    major_id: '1', // Computer Science
    intake_period: 'Fall Intake',
    start_date: '2026-09-01',
    end_date: '2030-06-30',
    is_active: true,
    description: 'Fall 2026 freshman admission intake for Computer Science & Engineering degree programs.',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z'
  },
  {
    id: '2',
    batch_name: 'Batch 2025 (Sophomore Cohort)',
    batch_code: 'B2025-MAIN',
    academic_year_id: '1', // 2025-2026
    branch_id: '1', // Main Campus
    major_id: '1', // Computer Science
    intake_period: 'Fall Intake',
    start_date: '2025-09-01',
    end_date: '2029-06-30',
    is_active: true,
    description: '2025 academic intake cohort currently enrolled in second year modules CS201/CS305.',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: '3',
    batch_name: 'Batch 2026 (Software Engineering)',
    batch_code: 'B2026-SE',
    academic_year_id: '2', // 2026-2027
    branch_id: '1', // Main Campus
    major_id: '2', // Software Engineering
    intake_period: 'Fall Intake',
    start_date: '2026-09-01',
    end_date: '2030-06-30',
    is_active: true,
    description: 'Software Engineering cohort focusing on enterprise architecture and cloud platforms.',
    created_at: '2026-01-12T08:00:00Z',
    updated_at: '2026-01-12T08:00:00Z'
  },
  {
    id: '4',
    batch_name: 'Batch 2026 (Downtown IT)',
    batch_code: 'B2026-TECH',
    academic_year_id: '2', // 2026-2027
    branch_id: '2', // Downtown Tech Center
    major_id: '3', // Information Technology
    intake_period: 'Spring Intake',
    start_date: '2026-02-01',
    end_date: '2030-01-31',
    is_active: true,
    description: 'Applied computing and cloud systems intake at the Downtown Tech Center campus.',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-01-15T08:00:00Z'
  },
  {
    id: '5',
    batch_name: 'Batch 2024 (Senior Intake)',
    batch_code: 'B2024-GRAD',
    academic_year_id: '1', // 2025-2026
    branch_id: '1', // Main Campus
    major_id: '1', // Computer Science
    intake_period: 'Fall Intake',
    start_date: '2024-09-01',
    end_date: '2028-06-30',
    is_active: false,
    description: 'Archived senior intake cohort approaching final capstone and graduation.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z'
  },
  {
    id: '6',
    batch_name: 'Batch 21',
    batch_code: 'Batch 21',
    academic_year_id: '2',
    branch_id: '1',
    major_id: '1',
    intake_period: 'Year 4 Senior Intake',
    start_date: '2026-07-20',
    end_date: '2026-10-30',
    is_active: true,
    description: 'Year 4 Semester 1 Batch 21 Senior Cohort.',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  }
];

export const initialClassSections: ClassSection[] = [
  {
    id: '1',
    branch_id: '1',
    major_id: '1',
    semester_id: '1',
    batch_id: '1',
    year_level: 1,
    section_name: 'CS-Y1-SecA',
    display_name: 'Computer Science Year 1 Section A',
    student_count: 38,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    branch_id: '1',
    major_id: '1',
    semester_id: '1',
    batch_id: '2',
    year_level: 2,
    section_name: 'CS-Y2-SecA',
    display_name: 'Computer Science Year 2 Section A',
    student_count: 42,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    branch_id: '1',
    major_id: '1',
    semester_id: '1',
    batch_id: '2',
    year_level: 2,
    section_name: 'CS-Y2-SecB',
    display_name: 'Computer Science Year 2 Section B',
    student_count: 36,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    branch_id: '1',
    major_id: '2',
    semester_id: '1',
    year_level: 3,
    section_name: 'SE-Y3-SecA',
    display_name: 'Software Engineering Year 3 Section A',
    student_count: 32,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    branch_id: '2',
    major_id: '3',
    semester_id: '1',
    batch_id: '4',
    year_level: 2,
    section_name: 'IT-Y2-SecA',
    display_name: 'Information Technology Year 2 Section A',
    student_count: 34,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    branch_id: '2',
    major_id: '4',
    semester_id: '1',
    batch_id: '4',
    year_level: 3,
    section_name: 'CYB-Y3-SecA',
    display_name: 'Cyber Security Operations Year 3 Section A',
    student_count: 28,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    branch_id: '3',
    major_id: '5',
    semester_id: '1',
    year_level: 4,
    section_name: 'DSI-Y4-SecA',
    display_name: 'Data Science & Intelligence Year 4 Section A',
    student_count: 26,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '8',
    branch_id: '1',
    major_id: '1',
    semester_id: '1',
    batch_id: '6',
    year_level: 4,
    section_name: 'CS-Y4-Batch21',
    display_name: 'Year 4 - Semester 1 - Batch 21',
    student_count: 35,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialLecturerAvailabilities: LecturerAvailability[] = [
  { id: '1', lecturer_id: '1', branch_id: '1', time_slot_id: '1', is_available: true, availability_status: 'AVAILABLE', note: 'Standard morning slot', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '2', lecturer_id: '1', branch_id: '1', time_slot_id: '2', is_available: true, availability_status: 'AVAILABLE', note: 'Preferred lab instruction', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '3', lecturer_id: '1', branch_id: '1', time_slot_id: '3', is_available: false, availability_status: 'UNAVAILABLE', note: 'Unavailable for evening sessions', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '4', lecturer_id: '2', branch_id: '1', time_slot_id: '4', is_available: true, availability_status: 'PREFERRED', note: 'Prefers Tuesday morning for database lectures', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '5', lecturer_id: '2', branch_id: '1', time_slot_id: '5', is_available: true, availability_status: 'AVAILABLE', note: '', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '6', lecturer_id: '3', branch_id: '1', time_slot_id: '7', is_available: true, availability_status: 'AVAILABLE', note: 'Available Wednesday morning', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: '7', lecturer_id: '4', branch_id: '2', time_slot_id: '10', is_available: true, availability_status: 'AVAILABLE', note: 'Metro branch Thursday', confirmed_by_user_id: '2', confirmed_at: '2026-02-01T10:00:00Z', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' }
];

export const initialSchedules: Schedule[] = [
  {
    id: '1',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '2', // CS201
    lecturer_id: '1', // Dr. Alexander Chen
    classroom_id: '1', // LH-101
    time_slot_id: '1', // Monday Morning
    session_number: 1,
    batch_id: '2',
    schedule_type: 'COMBINED',
    status: 'APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-07',
    created_by: '1',
    approved_by: '2',
    approved_at: '2026-08-25T14:00:00Z',
    remarks: 'Approved combined lecture for CS-Y2 sections A & B. Meets hall capacity.',
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-25T14:00:00Z'
  },
  {
    id: '2',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '4', // CS305 Database
    lecturer_id: '2', // Dr. Emily Watson
    classroom_id: '2', // LAB-201
    time_slot_id: '4', // Tuesday Morning
    session_number: 1,
    batch_id: '2',
    schedule_type: 'NORMAL',
    status: 'APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-08',
    created_by: '1',
    approved_by: '2',
    approved_at: '2026-08-26T11:30:00Z',
    remarks: 'Hands-on PostgreSQL schema optimization lab.',
    created_at: '2026-08-22T10:00:00Z',
    updated_at: '2026-08-26T11:30:00Z'
  },
  {
    id: '3',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '3', // SE302 Architecture
    lecturer_id: '3', // Prof. David Miller
    classroom_id: '3', // SR-301
    time_slot_id: '7', // Wednesday Morning
    session_number: 2,
    schedule_type: 'NORMAL',
    status: 'UNDER_REVIEW',
    duration_minutes: 90,
    scheduled_date: '2026-09-09',
    created_by: '1',
    approved_by: null,
    approved_at: null,
    remarks: 'Awaiting Dean verification for modular workstation layout.',
    created_at: '2026-09-01T15:00:00Z',
    updated_at: '2026-09-02T09:15:00Z'
  },
  {
    id: '4',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '2',
    course_id: '5', // IT204 Networks
    lecturer_id: '4', // Dr. Aisha Patel
    classroom_id: '6', // METRO-LAB2
    time_slot_id: '10', // Thursday Morning
    session_number: 1,
    batch_id: '4',
    schedule_type: 'NORMAL',
    status: 'SUBMITTED',
    duration_minutes: 90,
    scheduled_date: '2026-09-10',
    created_by: '1',
    approved_by: null,
    approved_at: null,
    department_id: '1',
    remarks: 'Submitted for Metro Center operations approval.',
    created_at: '2026-09-02T13:40:00Z',
    updated_at: '2026-09-02T13:40:00Z'
  },
  {
    id: '5',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '2',
    course_id: '6', // CYB301 Cyber Security
    lecturer_id: '4', // Dr. Aisha Patel
    classroom_id: '5', // METRO-LH1
    time_slot_id: '11', // Thursday Afternoon
    session_number: 2,
    batch_id: '4',
    schedule_type: 'NORMAL',
    status: 'ADMIN_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-10',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-08-30T16:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Administrator approved for Metro Center campus operations. Awaiting Dean verification.',
    department_id: '1',
    dean_assigned_to: '2',
    approved_by: '1',
    approved_at: '2026-08-30T16:00:00Z',
    remarks: 'Approved security lecture series for Metro Center.',
    created_at: '2026-08-28T09:00:00Z',
    updated_at: '2026-08-30T16:00:00Z'
  },
  {
    id: '6',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '3',
    course_id: '7', // DSI401 ML Analytics
    lecturer_id: '5', // Dr. Lucas Thorne
    classroom_id: '7', // INNO-LAB1
    time_slot_id: '13', // Friday Morning
    session_number: 1,
    batch_id: '1',
    department_id: '1',
    schedule_type: 'NORMAL',
    status: 'PENDING_ADMIN_APPROVAL',
    duration_minutes: 90,
    scheduled_date: '2026-09-11',
    created_by: '1',
    approved_by: null,
    approved_at: null,
    remarks: 'New Friday ML computing lab submitted. Awaiting Administrator review and signature/stamp upload.',
    created_at: '2026-09-03T11:00:00Z',
    updated_at: '2026-09-03T11:00:00Z'
  },
  {
    id: '7',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '1', // CS101 Programming
    lecturer_id: '1', // Dr. Alexander Chen
    classroom_id: '4', // CR-102
    time_slot_id: '2', // Monday Afternoon
    session_number: 1,
    schedule_type: 'NORMAL',
    status: 'REJECTED',
    duration_minutes: 90,
    scheduled_date: '2026-09-07',
    created_by: '1',
    approved_by: '1',
    approved_at: '2026-08-27T10:00:00Z',
    rejection_reason: 'Classroom equipment inadequate for group coding demo. Please reassign to LAB-201.',
    remarks: 'Rejected: Classroom equipment inadequate for group coding demo. Please reassign to LAB-201.',
    created_at: '2026-08-24T14:00:00Z',
    updated_at: '2026-08-27T10:00:00Z'
  },
  // Operational conflict record for demonstration of conflict engine
  {
    id: '8',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '1', // CS101
    lecturer_id: '6', // Dr. Rachel Adams (ON_LEAVE)
    classroom_id: '1', // LH-101 (Already booked in Slot 1 by Schedule 1 in Session 1!)
    time_slot_id: '1', // Monday Morning - Overlap on Session 1!
    session_number: 1,
    schedule_type: 'NORMAL',
    status: 'ADMIN_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-07',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-09-04T10:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Administrator approved with conditional note: resolve room conflict before term starts.',
    approved_by: '1',
    approved_at: '2026-09-04T10:00:00Z',
    remarks: 'Admin approved. Ready for Dean verification and signature.',
    created_at: '2026-09-03T16:00:00Z',
    updated_at: '2026-09-04T10:00:00Z'
  },
  // Evening Time Window Session 1
  {
    id: '9',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '4', // CS305 Advanced Database Systems
    lecturer_id: '2', // Dr. Emily Watson
    classroom_id: '2', // LAB-201
    time_slot_id: '3', // Monday Evening (Session 1: 5:30 PM - 7:00 PM)
    session_number: 1,
    batch_id: '2',
    schedule_type: 'NORMAL',
    status: 'RETURNED_FOR_REVISION',
    duration_minutes: 90,
    scheduled_date: '2026-09-07',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-08-28T14:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    revision_requested_reason: 'Dean Review Note: Please adjust the session start time or relocate to LAB-202 to accommodate larger cohort size.',
    remarks: 'Returned for revision by Dean.',
    created_at: '2026-08-25T11:00:00Z',
    updated_at: '2026-08-28T16:00:00Z'
  },
  // Evening Time Window Session 2
  {
    id: '10',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '2', // CS201 Data Structures
    lecturer_id: '1', // Dr. Alexander Chen
    classroom_id: '2', // LAB-201 (Consecutive Session 2: 7:10 PM - 8:40 PM)
    time_slot_id: '3', // Monday Evening
    session_number: 2,
    batch_id: '2',
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-07',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-08-28T16:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    dean_checked_by: '2',
    dean_checked_at: '2026-08-28T16:30:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    approved_by: '2',
    approved_at: '2026-08-28T16:30:00Z',
    remarks: 'Fully approved Evening Session 2 consecutive lab instruction.',
    created_at: '2026-08-25T11:30:00Z',
    updated_at: '2026-08-28T16:30:00Z'
  },
  // --- Year 4 Semester 1 Batch 21 Evening Shift (Official Timetable - Fully Approved with Stamped Signatures) ---
  {
    id: '11',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '8', // STAM401 AI and Machine Learning
    lecturer_id: '7', // Mr. LEANG Panhra (Tel: 077 426 333)
    classroom_id: '9', // Room 302
    time_slot_id: '3', // Monday Evening (5:30 PM - 7:00 PM)
    session_number: 1,
    batch_id: '6', // Batch 21
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-07-20',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-06-11T09:30:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Approved for Batch 21 Year 4 Senior Timetable. Official University seal applied.',
    dean_checked_by: '2',
    dean_checked_at: '2026-06-11T10:00:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Dean verified and approved for Directorate publication.',
    approved_by: '2',
    approved_at: '2026-06-11T10:00:00Z',
    remarks: 'Official Batch 21 Year 4 schedule as per Directorate timetable.',
    created_at: '2026-06-10T08:00:00Z',
    updated_at: '2026-06-11T10:00:00Z'
  },
  {
    id: '12',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '9', // STLA401 Linux Server Administration
    lecturer_id: '8', // Mr. EAP Satia (Tel: 070 549 456)
    classroom_id: '9', // Room 302
    time_slot_id: '6', // Tuesday Evening (5:30 PM - 7:00 PM)
    session_number: 1,
    batch_id: '6', // Batch 21
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-07-21',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-06-11T09:30:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Approved for Batch 21 Year 4 Senior Timetable.',
    dean_checked_by: '2',
    dean_checked_at: '2026-06-11T10:00:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Dean verified and approved.',
    approved_by: '2',
    approved_at: '2026-06-11T10:00:00Z',
    remarks: 'Official Batch 21 Year 4 schedule as per Directorate timetable.',
    created_at: '2026-06-10T08:00:00Z',
    updated_at: '2026-06-11T10:00:00Z'
  },
  {
    id: '13',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '10', // STSE401 Software Engineering SDLC
    lecturer_id: '9', // Mr. ROEUN Mesa (Tel: 081 542 219)
    classroom_id: '9', // Room 302
    time_slot_id: '9', // Wednesday Evening (5:30 PM - 7:00 PM)
    session_number: 1,
    batch_id: '6', // Batch 21
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-07-22',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-06-11T09:30:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Approved for Batch 21 Year 4 Senior Timetable.',
    dean_checked_by: '2',
    dean_checked_at: '2026-06-11T10:00:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Dean verified and approved.',
    approved_by: '2',
    approved_at: '2026-06-11T10:00:00Z',
    remarks: 'Official Batch 21 Year 4 schedule as per Directorate timetable.',
    created_at: '2026-06-10T08:00:00Z',
    updated_at: '2026-06-11T10:00:00Z'
  },
  {
    id: '14',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '11', // STCA401 Cross-Plateform Application Development
    lecturer_id: '10', // Mr. SVAY Chumkongkear (Tel: 095 240 003)
    classroom_id: '9', // Room 302
    time_slot_id: '12', // Thursday Evening (5:30 PM - 7:00 PM)
    session_number: 1,
    batch_id: '6', // Batch 21
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-07-23',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-06-11T09:30:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Approved for Batch 21 Year 4 Senior Timetable.',
    dean_checked_by: '2',
    dean_checked_at: '2026-06-11T10:00:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Dean verified and approved.',
    approved_by: '2',
    approved_at: '2026-06-11T10:00:00Z',
    department_id: '1',
    dean_assigned_to: '2',
    remarks: 'Official Batch 21 Year 4 schedule as per Directorate timetable.',
    created_at: '2026-06-10T08:00:00Z',
    updated_at: '2026-06-11T10:00:00Z'
  },
  // Department of Business Administration & Accounting Schedule - Routed to Dean Marcus Bradley (User #5)
  {
    id: '15',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '4', // Relational Databases
    lecturer_id: '3', // Dr. Alan Turing
    classroom_id: '3', // LH-201
    time_slot_id: '2', // Monday Afternoon
    session_number: 1,
    batch_id: '1',
    schedule_type: 'NORMAL',
    status: 'ADMIN_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-07',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-09-04T11:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Administrator approved for Business & Accounting intake cohort. Routed to Dean Bradley.',
    department_id: '2', // Business Administration & Accounting
    dean_assigned_to: '5', // Dr. Marcus Bradley
    remarks: 'Business Accounting operations timetable awaiting Dean Bradley verification.',
    created_at: '2026-09-03T10:00:00Z',
    updated_at: '2026-09-04T11:00:00Z'
  },
  // Department of Engineering & Architecture Schedule - Routed to Dean Elena Rostova (User #6)
  {
    id: '16',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '1',
    lecturer_id: '4',
    classroom_id: '5',
    time_slot_id: '4',
    session_number: 1,
    batch_id: '3',
    schedule_type: 'NORMAL',
    status: 'PENDING_ADMIN_APPROVAL',
    duration_minutes: 90,
    scheduled_date: '2026-09-08',
    created_by: '1',
    department_id: '3', // Engineering
    dean_assigned_to: '6', // Dr. Elena Rostova
    remarks: 'Engineering schedule submitted for Admin approval.',
    created_at: '2026-09-04T08:00:00Z',
    updated_at: '2026-09-04T08:00:00Z'
  },
  // Department of Business - Fully Approved with Dean Bradley's Signature
  {
    id: '17',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '1',
    course_id: '3',
    lecturer_id: '5',
    classroom_id: '3',
    time_slot_id: '5',
    session_number: 1,
    batch_id: '1',
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-08',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-09-02T09:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    dean_checked_by: '5',
    dean_checked_at: '2026-09-02T14:00:00Z',
    dean_signature_url: SAMPLE_DEAN_BRADLEY_SIGNATURE_URL,
    dean_remarks: 'Verified by Dean of Business Administration & Accounting.',
    approved_by: '5',
    approved_at: '2026-09-02T14:00:00Z',
    department_id: '2',
    dean_assigned_to: '5',
    remarks: 'Fully authorized Business timetable with Dean Bradley signature.',
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-02T14:00:00Z'
  },
  // Metro Center Operations Branch - Fully Approved Schedule (Dr. Alexander Chen)
  {
    id: '18',
    semester_id: '1',
    academic_year_id: '2',
    branch_id: '2',
    course_id: '5', // IT204 Networks
    lecturer_id: '1', // Dr. Alexander Chen (assigned across Branch 1 & 2)
    classroom_id: '6', // METRO-LAB2
    time_slot_id: '5', // Tuesday Afternoon
    session_number: 1,
    batch_id: '4',
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2026-09-08',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2026-09-01T09:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    admin_remarks: 'Approved for Metro Center practical lab sessions.',
    dean_checked_by: '2',
    dean_checked_at: '2026-09-01T14:30:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Dean verified and approved for Metro Center operations.',
    approved_by: '2',
    approved_at: '2026-09-01T14:30:00Z',
    department_id: '1',
    dean_assigned_to: '2',
    remarks: 'Fully approved Metro Center practical lab with Dr. Alexander Chen.',
    created_at: '2026-08-28T10:00:00Z',
    updated_at: '2026-09-01T14:30:00Z'
  },
  // Historical 2025-2026 Academic Year Schedules
  {
    id: '19',
    semester_id: '1',
    academic_year_id: '1', // 2025-2026
    branch_id: '1',
    course_id: '1', // CS101
    lecturer_id: '1', // Dr. Alexander Chen
    classroom_id: '1', // LH-101
    time_slot_id: '1', // Monday Morning
    session_number: 1,
    batch_id: '2',
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2025-09-08',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2025-09-02T10:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    dean_checked_by: '2',
    dean_checked_at: '2025-09-02T14:00:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Historical 2025-2026 academic year verified by Dean Vance.',
    approved_by: '2',
    approved_at: '2025-09-02T14:00:00Z',
    department_id: '1',
    dean_assigned_to: '2',
    remarks: 'Archived 2025-2026 operational timetable for CS-Y2 cohort.',
    created_at: '2025-08-20T09:00:00Z',
    updated_at: '2025-09-02T14:00:00Z'
  },
  {
    id: '20',
    semester_id: '1',
    academic_year_id: '1', // 2025-2026
    branch_id: '1',
    course_id: '2', // CS201
    lecturer_id: '2', // Dr. Emily Watson
    classroom_id: '2', // LAB-201
    time_slot_id: '4', // Tuesday Morning
    session_number: 1,
    batch_id: '2',
    schedule_type: 'NORMAL',
    status: 'FULLY_APPROVED',
    duration_minutes: 90,
    scheduled_date: '2025-09-09',
    created_by: '1',
    admin_approved_by: '1',
    admin_approved_at: '2025-09-03T10:00:00Z',
    admin_signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    admin_stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    dean_checked_by: '2',
    dean_checked_at: '2025-09-03T14:00:00Z',
    dean_signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    dean_remarks: 'Historical 2025-2026 verified by Dean Vance.',
    approved_by: '2',
    approved_at: '2025-09-03T14:00:00Z',
    department_id: '1',
    dean_assigned_to: '2',
    remarks: 'Archived 2025-2026 database laboratory timetable.',
    created_at: '2025-08-21T09:00:00Z',
    updated_at: '2025-09-03T14:00:00Z'
  }
];

export const initialScheduleClassSections: ScheduleClassSection[] = [
  { schedule_id: '1', class_section_id: '2' }, // CS-Y2-A
  { schedule_id: '1', class_section_id: '3' }, // CS-Y2-B (Combined)
  { schedule_id: '2', class_section_id: '2' },
  { schedule_id: '3', class_section_id: '4' },
  { schedule_id: '4', class_section_id: '5' },
  { schedule_id: '5', class_section_id: '6' },
  { schedule_id: '6', class_section_id: '7' },
  { schedule_id: '7', class_section_id: '1' },
  { schedule_id: '8', class_section_id: '1' },
  { schedule_id: '9', class_section_id: '2' },
  { schedule_id: '10', class_section_id: '2' },
  { schedule_id: '11', class_section_id: '8' },
  { schedule_id: '12', class_section_id: '8' },
  { schedule_id: '13', class_section_id: '8' },
  { schedule_id: '14', class_section_id: '8' },
  { schedule_id: '15', class_section_id: '1' },
  { schedule_id: '16', class_section_id: '4' },
  { schedule_id: '17', class_section_id: '1' },
  { schedule_id: '18', class_section_id: '5' },
  { schedule_id: '19', class_section_id: '2' },
  { schedule_id: '20', class_section_id: '2' }
];

export const initialScheduleConflicts: ScheduleConflict[] = [
  {
    id: '1',
    schedule_id: '8',
    conflicting_schedule_id: '1',
    conflict_type: 'CLASSROOM_CONFLICT',
    severity: 'CRITICAL',
    description: 'Classroom LH-101 is already allocated to Schedule #1 (CS201 Combined) during Monday Morning (08:00 - 11:30).',
    resolved: false,
    resolution_status: 'OPEN',
    resolution_notes: '',
    resolved_by: null,
    resolved_at: null,
    detected_at: '2026-09-03T16:01:00Z',
    created_at: '2026-09-03T16:01:00Z',
    updated_at: '2026-09-03T16:01:00Z'
  },
  {
    id: '2',
    schedule_id: '8',
    conflicting_schedule_id: null,
    conflict_type: 'AVAILABILITY',
    severity: 'ERROR',
    description: 'Lecturer Dr. Rachel Adams is currently flagged as ON_LEAVE and cannot be assigned to active operational slots.',
    resolved: false,
    resolution_status: 'OPEN',
    resolution_notes: '',
    resolved_by: null,
    resolved_at: null,
    detected_at: '2026-09-03T16:01:00Z',
    created_at: '2026-09-03T16:01:00Z',
    updated_at: '2026-09-03T16:01:00Z'
  }
];

export const initialScheduleApprovalHistory: ScheduleApprovalHistory[] = [
  {
    id: '1',
    schedule_id: '1',
    reviewer_id: '2',
    action: 'APPROVED',
    status: 'APPROVED',
    comments: 'Capacity verified for combined sections. Lecture hall booking approved.',
    reviewed_at: '2026-08-25T14:00:00Z',
    created_at: '2026-08-25T14:00:00Z'
  },
  {
    id: '2',
    schedule_id: '2',
    reviewer_id: '2',
    action: 'APPROVED',
    status: 'APPROVED',
    comments: 'Specialized PostgreSQL lab allocation confirmed.',
    reviewed_at: '2026-08-26T11:30:00Z',
    created_at: '2026-08-26T11:30:00Z'
  },
  {
    id: '3',
    schedule_id: '3',
    reviewer_id: '2',
    action: 'REVIEW_STARTED',
    status: 'UNDER_REVIEW',
    comments: 'Review in progress. Evaluating architectural tool licensing on seminar room stations.',
    reviewed_at: '2026-09-02T09:15:00Z',
    created_at: '2026-09-02T09:15:00Z'
  },
  {
    id: '4',
    schedule_id: '4',
    reviewer_id: '1',
    action: 'SUBMITTED',
    status: 'SUBMITTED',
    comments: 'Submitted for Metro Center dean authorization.',
    reviewed_at: '2026-09-02T13:40:00Z',
    created_at: '2026-09-02T13:40:00Z'
  },
  {
    id: '5',
    schedule_id: '5',
    reviewer_id: '1',
    action: 'ADMIN_APPROVED',
    status: 'ADMIN_APPROVED',
    comments: 'Administrator approved for Metro Center campus operations. Awaiting Dean verification.',
    signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    reviewed_at: '2026-08-30T16:00:00Z',
    created_at: '2026-08-30T16:00:00Z'
  },
  {
    id: '6',
    schedule_id: '6',
    reviewer_id: '1',
    action: 'SUBMITTED',
    status: 'PENDING_ADMIN_APPROVAL',
    comments: 'New Friday ML computing lab submitted. Awaiting Administrator review and signature/stamp upload.',
    reviewed_at: '2026-09-03T11:00:00Z',
    created_at: '2026-09-03T11:00:00Z'
  },
  {
    id: '7',
    schedule_id: '7',
    reviewer_id: '2',
    action: 'REJECTED',
    status: 'REJECTED',
    comments: 'Classroom equipment inadequate for group coding demo. Please reassign to LAB-201.',
    reviewed_at: '2026-08-27T10:00:00Z',
    created_at: '2026-08-27T10:00:00Z'
  },
  {
    id: '8',
    schedule_id: '8',
    reviewer_id: '1',
    action: 'ADMIN_APPROVED',
    status: 'ADMIN_APPROVED',
    comments: 'Administrator approved with conditional note: resolve room conflict before term starts.',
    signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    reviewed_at: '2026-09-04T10:00:00Z',
    created_at: '2026-09-04T10:00:00Z'
  },
  {
    id: '9',
    schedule_id: '9',
    reviewer_id: '2',
    action: 'RETURNED_FOR_REVISION',
    status: 'RETURNED_FOR_REVISION',
    comments: 'Dean Review Note: Please adjust the session start time or relocate to LAB-202 to accommodate larger cohort size.',
    reviewed_at: '2026-08-28T16:00:00Z',
    created_at: '2026-08-28T16:00:00Z'
  },
  {
    id: '10',
    schedule_id: '10',
    reviewer_id: '2',
    action: 'FULLY_APPROVED',
    status: 'FULLY_APPROVED',
    comments: 'Dean verified and authorized evening session instruction.',
    signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    reviewed_at: '2026-08-28T16:30:00Z',
    created_at: '2026-08-28T16:30:00Z'
  },
  {
    id: '11',
    schedule_id: '11',
    reviewer_id: '1',
    action: 'ADMIN_APPROVED',
    status: 'ADMIN_APPROVED',
    comments: 'Approved for Batch 21 Year 4 Senior Timetable. Official University seal applied.',
    signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    reviewed_at: '2026-06-11T09:30:00Z',
    created_at: '2026-06-11T09:30:00Z'
  },
  {
    id: '12',
    schedule_id: '11',
    reviewer_id: '2',
    action: 'FULLY_APPROVED',
    status: 'FULLY_APPROVED',
    comments: 'Dean verified and approved for Directorate publication.',
    signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    reviewed_at: '2026-06-11T10:00:00Z',
    created_at: '2026-06-11T10:00:00Z'
  },
  {
    id: '13',
    schedule_id: '15',
    reviewer_id: '1',
    action: 'ADMIN_APPROVED',
    status: 'ADMIN_APPROVED',
    comments: 'Administrator approved for Business & Accounting intake cohort. Routed to Dean Bradley.',
    signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    reviewed_at: '2026-09-04T11:00:00Z',
    created_at: '2026-09-04T11:00:00Z'
  },
  {
    id: '14',
    schedule_id: '17',
    reviewer_id: '5',
    action: 'FULLY_APPROVED',
    status: 'FULLY_APPROVED',
    comments: 'Verified by Dean of Business Administration & Accounting.',
    signature_url: SAMPLE_DEAN_BRADLEY_SIGNATURE_URL,
    reviewed_at: '2026-09-02T14:00:00Z',
    created_at: '2026-09-02T14:00:00Z'
  },
  {
    id: '15',
    schedule_id: '18',
    reviewer_id: '2',
    action: 'FULLY_APPROVED',
    status: 'FULLY_APPROVED',
    comments: 'Dean verified and approved for Metro Center operations.',
    signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    reviewed_at: '2026-09-01T14:30:00Z',
    created_at: '2026-09-01T14:30:00Z'
  },
  {
    id: '16',
    schedule_id: '19',
    reviewer_id: '1',
    action: 'ADMIN_APPROVED',
    status: 'ADMIN_APPROVED',
    comments: 'Historical 2025-2026 cycle approved by Administrator with official stamp.',
    signature_url: SAMPLE_ADMIN_SIGNATURE_URL,
    stamp_url: SAMPLE_OFFICIAL_STAMP_URL,
    reviewed_at: '2025-09-02T10:00:00Z',
    created_at: '2025-09-02T10:00:00Z'
  },
  {
    id: '17',
    schedule_id: '19',
    reviewer_id: '2',
    action: 'FULLY_APPROVED',
    status: 'FULLY_APPROVED',
    comments: 'Historical 2025-2026 verified by Department Dean Vance.',
    signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    reviewed_at: '2025-09-02T14:00:00Z',
    created_at: '2025-09-02T14:00:00Z'
  },
  {
    id: '18',
    schedule_id: '20',
    reviewer_id: '2',
    action: 'FULLY_APPROVED',
    status: 'FULLY_APPROVED',
    comments: 'Archived 2025-2026 database laboratory timetable fully verified.',
    signature_url: SAMPLE_DEAN_SIGNATURE_URL,
    reviewed_at: '2025-09-03T14:00:00Z',
    created_at: '2025-09-03T14:00:00Z'
  }
];

export const initialScheduleChangeLogs: ScheduleChangeLog[] = [
  {
    id: '1',
    schedule_id: '1',
    changed_by: '1',
    action: 'CREATED',
    change_description: 'Created operational schedule for CS201 with combined sections CS-Y2-A & CS-Y2-B.',
    old_values: null,
    new_values: { schedule_id: '1', course_code: 'CS201', classroom: 'LH-101', status: 'DRAFT' },
    created_at: '2026-08-20T09:00:00Z'
  },
  {
    id: '2',
    schedule_id: '1',
    changed_by: '2',
    action: 'STATUS_TRANSITION',
    change_description: 'Operational schedule transitioned from UNDER_REVIEW to APPROVED by Dean Vance.',
    old_values: { status: 'UNDER_REVIEW' },
    new_values: { status: 'APPROVED', approved_by: '2', approved_at: '2026-08-25T14:00:00Z' },
    created_at: '2026-08-25T14:00:00Z'
  },
  {
    id: '3',
    schedule_id: '7',
    changed_by: '2',
    action: 'STATUS_TRANSITION',
    change_description: 'Operational schedule rejected with revision instructions.',
    old_values: { status: 'SUBMITTED' },
    new_values: { status: 'REJECTED', comments: 'Room hardware mismatch' },
    created_at: '2026-08-27T10:00:00Z'
  },
  {
    id: '4',
    schedule_id: '8',
    changed_by: '1',
    action: 'VALIDATION_EXCEPTION',
    change_description: 'Validation engine detected 2 blocking conflicts (CLASSROOM_CONFLICT, AVAILABILITY).',
    old_values: null,
    new_values: { conflict_count: 2, severity: 'CRITICAL' },
    created_at: '2026-09-03T16:01:00Z'
  }
];

export const initialSystemSettings: SystemSetting[] = [
  {
    id: '1',
    setting_key: 'OPERATIONAL_ACADEMIC_YEAR',
    setting_value: '2026-2027',
    description: 'Active default academic year for operational schedules.',
    updated_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z'
  },
  {
    id: '2',
    setting_key: 'DEFAULT_SEMESTER_ID',
    setting_value: '1',
    description: 'Active operating semester ID (Semester 1).',
    updated_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },
  {
    id: '3',
    setting_key: 'ENFORCE_CONFLICT_BLOCKING',
    setting_value: 'true',
    description: 'Prevent submission of operational schedules with unaddressed CRITICAL conflicts.',
    updated_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z'
  },
  {
    id: '4',
    setting_key: 'APPROVAL_NOTIFICATION_EMAIL',
    setting_value: 'operations-desk@apdo.org',
    description: 'Dispatch operational workflow alerts and review reminders to this distribution address.',
    updated_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z'
  },
  {
    id: '5',
    setting_key: 'MAX_COMBINED_SECTION_STUDENTS',
    setting_value: '150',
    description: 'Upper boundary threshold for combined cohort operational assignments.',
    updated_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z'
  }
];
