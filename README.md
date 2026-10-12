# APDO Operations Management System

A centralized enterprise operations management platform built for **APDO**, architected directly from the PostgreSQL DBML database schema.

---

## 1. Overview & Architecture

The APDO Operations Management System provides operational administration across campuses, faculties, physical resources, degree curricula, and academic timetable assignments with real-time multi-dimensional conflict detection and multi-stage managerial approval workflows.

### Database Design & Schema Mapping
The frontend is strictly mapped to the provided PostgreSQL / DBML database schema (`BIGINT` IDs represented safely as strings):

- **Users & Access**: `users`, `roles` (`ADMIN`, `DEAN`, `LECTURER`)
- **Organizational Structure**: `branches`, `majors`, `academic_years`, `semesters`
- **Academic Curricula**: `courses`, `course_majors`
- **Faculty / Personnel**: `lecturers`, `lecturer_branches`, `lecturer_courses`, `lecturer_availabilities`
- **Physical Resources**: `classrooms` (capacity, classification, equipment), `time_slots` (standard day/period windows)
- **Cohort Class Sections**: `class_sections` (year level, student count)
- **Operational Records**: `schedules`, `schedule_class_sections` (`NORMAL` vs `COMBINED` modes)
- **Conflict Validation Engine**: `schedule_conflicts` (`CLASSROOM_CONFLICT`, `LECTURER_CONFLICT`, `AVAILABILITY`)
- **Approval Workflow**: `schedule_approval_history` (`DRAFT` &rarr; `SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `APPROVED` / `REJECTED`)
- **Audit & Governance**: `schedule_change_logs` (read-only change logs with `old_values` & `new_values` JSONB diffs)
- **System Settings**: `system_settings` (dynamic operational preferences)

---

## 2. Technology Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript (strict typing matching PostgreSQL models)
- **Styling**: Tailwind CSS with enterprise palette (Deep Navy `#17365D`, Royal Blue `#2563EB`, Light Gray `#F8FAFC`)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Visualizations & Charts**: Recharts (Operational status distribution donut chart, Branch load bar chart, Faculty workload bars)
- **Forms & Validation**: React Hook Form with Zod schemas
- **State Management & Persistence**: LocalStorage-backed Context API with full CRUD and instant cross-page reactivity

---

## 3. Supported Roles & Demo Role Switcher

A prominent **Demo Role Switcher** is embedded in the top navigation bar, allowing immediate testing of role-based authorization:

1. **ADMIN** (`admin.sterling@apdo.org` - Dr. Sarah Sterling):
   - Unrestricted administrative governance.
   - Access to Campuses, Time Slots, User Management, System Settings, Audit Logs, and all operational modules.
2. **DEAN** (`dean.vance@apdo.org` - Prof. Robert Vance):
   - Operational manager / supervisor.
   - Review pending schedules, approve or reject submissions (with required justification), resolve conflicts, monitor branch analytics.
3. **LECTURER** (`alexander.chen@apdo.org` - Dr. Alexander Chen):
   - Faculty staff persona.
   - View assigned teaching sessions, interact with the Faculty Availability Matrix (Available / Preferred / Unavailable slots), inspect course catalog.

Unauthorized routes are automatically guarded via `RoleGuard` with enterprise access warning cards.

---

## 4. Key Modules & Features

1. **Executive Operational Dashboard**:
   - Dynamic KPI stat cards (Total Records, Pending Approvals, Active Conflicts, Faculty Headcount).
   - Interactive Recharts Donut & Bar charts.
   - Quick action shortcuts.
   - Critical conflict alert banner.
2. **Operational Schedules & Timetable (`/schedules`)**:
   - Dual view: Searchable **Table View** and interactive **Weekly Matrix Timetable**.
   - Cascading dropdowns: Selecting branch filters compatible classrooms and cohort sections; selecting course suggests qualified lecturers.
   - Combined session support (multi-section cohort merge).
   - Instant conflict check upon creation.
3. **Conflict Detection & Validation Engine (`/conflicts`)**:
   - Detects room double-bookings, lecturer double-bookings, and faculty leave violations.
   - Side-by-side comparison of conflicting sessions.
   - Administrative resolution modal with audit notes.
4. **Approval Workflow (`/approvals`)**:
   - Queue of submissions awaiting decision.
   - Detail inspection drawer with conflict verification check and chronological decision history.
   - Approve, Reject (with required comment), or Start Review.
5. **Faculty Availability Matrix (`/availabilities`)**:
   - Interactive 7-day &times; 3-period grid.
   - Click to cycle between **Available**, **Preferred**, and **Unavailable** states.
   - Real-time sync with conflict engine.
6. **Campuses, Majors & Sections**:
   - Full CRUD management of organizational units.
7. **Classrooms & Resources**:
   - Room capacity, classification (`CLASSROOM`, `LECTURE_HALL`, `COMPUTER_LAB`, `SEMINAR_ROOM`, `WORKSHOP`), equipment rig specifications.
8. **Operational Reports & Exports (`/reports`)**:
   - Operational Summary, Faculty Workload Utilization, and Facility Occupancy reports.
   - One-click CSV export and print view.
9. **Activity & Audit Logs (`/audit-logs`)**:
   - Immutable log of all schedule mutations.
   - Modal JSON diff inspector comparing `old_values` vs. `new_values`.
10. **System Settings & Policies (`/settings`)**:
    - Configurable operational parameters.

---

## 5. Local Setup & Execution Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

The application will launch locally at `http://localhost:3000` or the port displayed in your terminal.

### Production Build
```bash
npm run build
npm run preview
```

---

## 6. Future Laravel REST API Integration

The application is structured to connect to a Laravel REST API backend:
- Environment configuration: `.env.example` provides `VITE_API_BASE_URL=http://localhost:8000/api`
- API client: `src/services/api/apiClient.ts` handles Bearer token headers and REST endpoints.
- Service contracts: `src/services/api/index.ts` declares endpoint mappings matching Laravel controllers.
- No UI components are tightly coupled to mock storage; services can be swapped by setting `VITE_USE_MOCK_DATA=false`.
