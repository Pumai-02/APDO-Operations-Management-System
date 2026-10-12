-- APDO Operations Management System for Western University
-- PostgreSQL database schema
-- Scope: academic scheduling only. No student management tables.
-- Run this script inside an empty PostgreSQL database, e.g. apdo_operations.

BEGIN;

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
        CHECK (name IN ('ADMIN', 'DEAN', 'LECTURER'))
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academic_years (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE, -- e.g. 2026-2027
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (end_date > start_date)
);

CREATE TABLE semesters (
    id BIGSERIAL PRIMARY KEY,
    academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(30) NOT NULL, -- Semester 1, Semester 2
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (academic_year_id, name),
    CHECK (end_date > start_date)
);

CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    location TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(40),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE majors (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (branch_id, code),
    UNIQUE (branch_id, name)
);

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(180) NOT NULL,
    description TEXT,
    credit_hours NUMERIC(4,1) NOT NULL DEFAULT 3 CHECK (credit_hours > 0),
    year_level SMALLINT CHECK (year_level BETWEEN 1 AND 8),
    semester_id BIGINT REFERENCES semesters(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A course can belong to more than one major.
CREATE TABLE course_majors (
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    major_id BIGINT NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, major_id)
);

CREATE TABLE lecturers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    lecturer_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(40),
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (employment_status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lecturer_branches (
    lecturer_id BIGINT NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    PRIMARY KEY (lecturer_id, branch_id)
);

CREATE TABLE lecturer_courses (
    lecturer_id BIGINT NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (lecturer_id, course_id)
);

CREATE TABLE classrooms (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    name VARCHAR(80) NOT NULL,
    building VARCHAR(100),
    capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
    room_type VARCHAR(50) NOT NULL DEFAULT 'CLASSROOM',
    equipment TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (branch_id, name)
);

-- Each time_slot represents a general Time Window (day + period) containing exactly two class sessions.
CREATE TABLE time_slots (
    id BIGSERIAL PRIMARY KEY,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    period VARCHAR(20) NOT NULL CHECK (period IN ('MORNING', 'AFTERNOON', 'EVENING')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_1_start TIME NOT NULL DEFAULT '08:00:00',
    session_1_end TIME NOT NULL DEFAULT '09:30:00',
    break_start TIME DEFAULT '09:30:00',
    break_end TIME DEFAULT '09:45:00',
    session_2_start TIME NOT NULL DEFAULT '09:45:00',
    session_2_end TIME NOT NULL DEFAULT '11:15:00',
    session_duration_minutes INTEGER NOT NULL DEFAULT 90 CHECK (session_duration_minutes > 0),
    break_duration_minutes INTEGER NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (end_time > start_time),
    CHECK (session_1_end > session_1_start),
    CHECK (session_2_start >= session_1_end),
    CHECK (session_2_end > session_2_start),
    CHECK (NOT (day_of_week IN (6, 7) AND period = 'EVENING')),
    UNIQUE (day_of_week, period)
);

-- Availability can be branch-specific for lecturers who teach at multiple branches.
CREATE TABLE lecturer_availabilities (
    id BIGSERIAL PRIMARY KEY,
    lecturer_id BIGINT NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    time_slot_id BIGINT NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'PREFERRED')),
    submitted_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    confirmed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE (lecturer_id, branch_id, time_slot_id)
);

CREATE TABLE class_sections (
    id BIGSERIAL PRIMARY KEY,
    major_id BIGINT NOT NULL REFERENCES majors(id),
    year_level SMALLINT NOT NULL CHECK (year_level BETWEEN 1 AND 8),
    section_name VARCHAR(30) NOT NULL, -- e.g. A, B, 2A
    display_name VARCHAR(100) NOT NULL, -- e.g. Computer Science Year 2A
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (major_id, year_level, section_name)
);

CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    academic_year_id BIGINT NOT NULL REFERENCES academic_years(id),
    semester_id BIGINT NOT NULL REFERENCES semesters(id),
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    lecturer_id BIGINT NOT NULL REFERENCES lecturers(id),
    classroom_id BIGINT NOT NULL REFERENCES classrooms(id),
    time_slot_id BIGINT NOT NULL REFERENCES time_slots(id),
    session_number SMALLINT NOT NULL DEFAULT 1 CHECK (session_number IN (1, 2)),
    schedule_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL'
        CHECK (schedule_type IN ('NORMAL', 'COMBINED')),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    generation_batch_id UUID,
    notes TEXT,
    created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One schedule event may be linked to multiple sections for combined classes.
CREATE TABLE schedule_class_sections (
    schedule_id BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    class_section_id BIGINT NOT NULL REFERENCES class_sections(id),
    PRIMARY KEY (schedule_id, class_section_id)
);

CREATE TABLE schedule_conflicts (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    conflicting_schedule_id BIGINT REFERENCES schedules(id) ON DELETE SET NULL,
    conflict_type VARCHAR(30) NOT NULL
        CHECK (conflict_type IN (
            'LECTURER', 'CLASSROOM', 'CLASS_SECTION', 'BRANCH', 'TIME_SLOT', 'AVAILABILITY'
        )),
    severity VARCHAR(15) NOT NULL DEFAULT 'ERROR'
        CHECK (severity IN ('WARNING', 'ERROR', 'CRITICAL')),
    description TEXT NOT NULL,
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (resolution_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED')),
    resolution_notes TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ
);

CREATE TABLE schedule_approval_history (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(30) NOT NULL
        CHECK (action IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schedule_change_logs (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT REFERENCES schedules(id) ON DELETE SET NULL,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(40) NOT NULL,
    change_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for timetable and conflict checks.
CREATE INDEX idx_schedules_year_semester ON schedules (academic_year_id, semester_id);
CREATE INDEX idx_schedules_branch_slot ON schedules (branch_id, time_slot_id);
CREATE INDEX idx_schedules_lecturer_slot ON schedules (lecturer_id, time_slot_id);
CREATE INDEX idx_schedules_classroom_slot ON schedules (classroom_id, time_slot_id);
CREATE INDEX idx_schedule_class_sections_section ON schedule_class_sections (class_section_id);
CREATE INDEX idx_conflicts_status_type ON schedule_conflicts (resolution_status, conflict_type);
CREATE INDEX idx_approval_history_schedule ON schedule_approval_history (schedule_id, created_at DESC);
CREATE INDEX idx_availability_lecturer_branch ON lecturer_availabilities (lecturer_id, branch_id);

-- Seed the three supported roles.
INSERT INTO roles (name) VALUES ('ADMIN'), ('DEAN'), ('LECTURER')
ON CONFLICT (name) DO NOTHING;

-- Seed the seven day/period combinations required by the timetable rules:
-- Monday-Friday: Morning, Afternoon, Evening
-- Saturday-Sunday: Morning, Afternoon
INSERT INTO time_slots (day_of_week, period, start_time, end_time)
SELECT days.day_of_week, periods.period, periods.start_time, periods.end_time
FROM (VALUES (1), (2), (3), (4), (5), (6), (7)) AS days(day_of_week)
CROSS JOIN (
    VALUES
        ('MORNING',   TIME '08:00', TIME '11:30'),
        ('AFTERNOON', TIME '13:00', TIME '16:30'),
        ('EVENING',   TIME '17:30', TIME '20:30')
) AS periods(period, start_time, end_time)
WHERE NOT (days.day_of_week IN (6, 7) AND periods.period = 'EVENING')
ON CONFLICT (day_of_week, period) DO NOTHING;

COMMIT;

-- IMPORTANT IMPLEMENTATION NOTES:
-- 1. Application logic must check schedule conflicts before insert/update and before submission.
-- 2. This schema indexes conflict-check fields, but does not by itself prevent all double-booking.
--    For robust concurrent writes, use a transaction and appropriate locking, or PostgreSQL
--    exclusion constraints with a time-range-based schedule model.
-- 3. Confirm that semester_id belongs to academic_year_id in application validation or add a trigger.
-- 4. Validate that classroom branch_id equals schedules.branch_id.
-- 5. Validate that all combined sections are compatible with the schedule course and branch.
-- 6. Store passwords as secure hashes; never store plaintext passwords.

-- ============================================================================
-- 18. BATCH MANAGEMENT EXTENSION
-- ============================================================================

CREATE TABLE IF NOT EXISTS batches (
    id                  BIGSERIAL PRIMARY KEY,
    batch_name          VARCHAR(150) NOT NULL,
    batch_code          VARCHAR(50)  NOT NULL UNIQUE,
    academic_year_id    BIGINT       NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    branch_id           BIGINT       NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    major_id            BIGINT       REFERENCES majors(id) ON DELETE SET NULL,
    intake_period       VARCHAR(50)  DEFAULT 'Fall Intake',
    start_date          DATE         NOT NULL,
    end_date            DATE         NOT NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    description         TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_academic_year ON batches(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_batches_branch ON batches(branch_id);
CREATE INDEX IF NOT EXISTS idx_batches_major ON batches(major_id);

-- Optional linkage on class_sections and schedules:
ALTER TABLE class_sections ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES batches(id) ON DELETE SET NULL;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES batches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_schedules_batch ON schedules(batch_id);

