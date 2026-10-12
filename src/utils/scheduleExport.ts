import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { HydratedSchedule } from '../types/database';

export interface ScheduleExportMeta {
  type: 'student' | 'lecturer';
  title: string;
  targetName: string;
  academicYear: string;
  semester: string;
  branchName: string;
  majorName?: string;
  headcountOrQuota?: string;
  periodName?: string; // e.g. "Morning", "Afternoon", "Evening", or "All Periods"
  sessionName?: string; // e.g. "Session 1", "Session 2", or "All Sessions"
  sessionNumber?: number; // 1 | 2
  batchName?: string; // e.g. "Batch 2026" or "All Batches"
  batchCode?: string; // e.g. "B2026"
  departmentName?: string;
  departmentCode?: string;
  facultyName?: string;
  generatedBy: string;
  generatedAt: string;
  // Approval and signature metadata
  approvalStatus?: string;
  isFullyApproved?: boolean;
  adminName?: string;
  adminRole?: string;
  adminApprovedAt?: string | null;
  adminSignatureUrl?: string | null;
  adminStampUrl?: string | null;
  adminRemarks?: string | null;
  deanName?: string;
  deanRole?: string;
  deanCheckedAt?: string | null;
  deanSignatureUrl?: string | null;
  deanRemarks?: string | null;
}

/**
 * Clean string for safe filenames
 */
export const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
};

/**
 * Generate standard meaningful filename matching APDO naming criteria:
 * Examples:
 * - Batch_2026_Morning_Student_Schedule.pdf
 * - Batch_2026_Afternoon_Lecturer_Schedule.xlsx
 * - Batch_2026_Student_Schedule.csv
 */
export const generateScheduleFilename = (meta: ScheduleExportMeta, ext: 'pdf' | 'xlsx' | 'csv'): string => {
  const rolePrefix = meta.type === 'student' ? 'Student' : 'Lecturer';
  
  // Extract clean batch identifier (e.g., "Batch 2026 (Freshman Cohort)" -> "Batch_2026")
  let batchPart = 'Batch_2026';
  if (meta.batchCode) {
    batchPart = sanitizeFilename(meta.batchCode);
  } else if (meta.batchName && meta.batchName !== 'All Batches') {
    const match = meta.batchName.match(/Batch\s*(\d{4}[A-Za-z0-9_-]*)/i);
    batchPart = match ? `Batch_${match[1]}` : sanitizeFilename(meta.batchName);
  }

  const hasSpecificPeriod = Boolean(meta.periodName && meta.periodName !== 'All Periods');
  const periodPart = hasSpecificPeriod && meta.periodName ? sanitizeFilename(meta.periodName) : '';

  const hasSpecificSession = Boolean(
    meta.sessionNumber ||
    (meta.sessionName && (meta.sessionName === 'Session 1' || meta.sessionName === 'Session 2'))
  );
  const sessionPart = hasSpecificSession
    ? `Session_${meta.sessionNumber || (meta.sessionName === 'Session 2' ? '2' : '1')}`
    : '';

  const parts = [batchPart];
  if (periodPart) {
    parts.push(periodPart);
  }
  if (sessionPart) {
    parts.push(sessionPart);
  }
  parts.push(rolePrefix);
  parts.push('Schedule');

  return `${parts.join('_')}.${ext}`;
};

/**
 * Safely load an image into an HTMLImageElement
 */
const loadImageElement = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    } catch {
      resolve(null);
    }
  });
};

/**
 * High-fidelity PDF Document Generator using jsPDF and jspdf-autotable
 */
export const exportScheduleToPDF = async (
  schedules: HydratedSchedule[],
  meta: ScheduleExportMeta
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Try to load and embed the Western University logo
  try {
    const logoImg = await loadImageElement('/logo.png');
    if (logoImg && logoImg.naturalWidth !== 0) {
      doc.addImage(logoImg, 'PNG', 14, 10, 18, 18);
    }
  } catch (err) {
    // Continue gracefully without logo image
  }

  // Header Typography
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(23, 54, 93); // Deep Navy (#17365D)
  doc.text('WESTERN UNIVERSITY', 36, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('APDO OPERATIONS MANAGEMENT DIRECTORATE • OFFICIAL CLASS SCHEDULE', 36, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // Royal Blue (#2563EB)
  const fullTitle = `${meta.title.toUpperCase()}${meta.batchName && meta.batchName !== 'All Batches' ? ` • ${meta.batchName.toUpperCase()}` : ''}${meta.periodName && meta.periodName !== 'All Periods' ? ` • ${meta.periodName.toUpperCase()} PERIOD` : ' • ALL PERIODS'}`;
  doc.text(fullTitle, 36, 28);

  // Decorative divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  // Metadata Grid Info Box
  doc.setFillColor(248, 250, 252); // Light Gray
  doc.roundedRect(14, 35, pageWidth - 28, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 35, pageWidth - 28, 18, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const col1 = 18;
  const col2 = 85;
  const col3 = 150;
  const col4 = 215;

  // Metadata Row 1
  doc.text(`Academic Period:`, col1, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(`${meta.academicYear} • ${meta.semester}`, col1 + 25, 41);

  doc.setFont('helvetica', 'bold');
  doc.text(meta.type === 'student' ? 'Cohort Section:' : 'Faculty Member:', col2, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(meta.targetName, col2 + 25, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Campus Branch:', col3, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(meta.branchName, col3 + 24, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Generated On:', col4, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(meta.generatedAt.slice(0, 16), col4 + 22, 41);

  // Metadata Row 2
  doc.setFont('helvetica', 'bold');
  doc.text(`Academic Batch:`, col1, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(meta.batchName || 'All Batches', col1 + 25, 48);

  if (meta.headcountOrQuota) {
    doc.setFont('helvetica', 'bold');
    doc.text(meta.type === 'student' ? 'Enrolment:' : 'Teaching Load:', col2, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.headcountOrQuota, col2 + 25, 48);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Session Scope:', col3, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(meta.sessionName || 'All Sessions (1 & 2)', col3 + 24, 48);

  doc.setFont('helvetica', 'bold');
  doc.text('Approval Status:', col4, 48);
  doc.setFont('helvetica', 'bold');
  if (meta.isFullyApproved) {
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text('FULLY APPROVED', col4 + 27, 48);
  } else if (meta.adminStampUrl) {
    doc.setTextColor(217, 119, 6); // Amber
    doc.text('ADMIN APPROVED', col4 + 27, 48);
  } else {
    doc.setTextColor(148, 163, 184); // Gray
    doc.text('PENDING APPROVAL', col4 + 27, 48);
  }

  // Prepare Table Data
  const tableHead = [
    [
      'Day',
      'Period',
      'Session',
      'Time Window',
      'Course Code',
      'Course Name',
      meta.type === 'student' ? 'Lecturer / Faculty' : 'Cohort Sections',
      'Classroom',
      'Campus',
      'Status'
    ]
  ];

  const tableBody = schedules.map(s => [
    s.timeSlotDay || 'Monday',
    s.timeSlotPeriod || 'Morning',
    s.sessionLabel || `Session ${s.sessionNumber || 1}`,
    s.effectiveStartTime12h && s.effectiveEndTime12h
      ? `${s.effectiveStartTime12h} - ${s.effectiveEndTime12h}`
      : `${s.effectiveStartTime || '08:00'} - ${s.effectiveEndTime || '09:30'}`,
    s.courseCode || 'N/A',
    s.courseName || 'Course',
    meta.type === 'student'
      ? `${s.lecturerName || 'Faculty'} (${s.lecturerCode || 'LEC'})`
      : s.linkedSectionNames?.join(', ') || 'General',
    s.classroomNumber || 'Room',
    s.branchName || 'Campus',
    s.status || 'APPROVED'
  ]);

  autoTable(doc, {
    startY: 57,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [23, 54, 93], // Deep Navy #17365D
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Very light blue/gray
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 20 },
      1: { cellWidth: 16 },
      2: { fontStyle: 'bold', cellWidth: 18 },
      3: { fontStyle: 'bold', cellWidth: 32 },
      4: { fontStyle: 'bold', textColor: [37, 99, 235], cellWidth: 20 },
      5: { cellWidth: 50 },
      6: { cellWidth: 38 },
      7: { fontStyle: 'bold', cellWidth: 22 },
      8: { cellWidth: 25 },
      9: { cellWidth: 16 }
    },
    didDrawPage: (data) => {
      // Footer on every page
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      const footerText = 'Official Schedule Document • APDO Operations Directorate • Western University';
      doc.text(footerText, 14, pageHeight - 8);

      const pageStr = `Page ${data.pageNumber}`;
      doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 8);
    }
  });

  // End of Document: Formal Dual-Stage Authorization Block
  const finalY = (doc as any).lastAutoTable?.finalY || 140;
  
  // Ensure enough room for signatures & stamps; add page if needed
  let signY = finalY + 10;
  if (signY > pageHeight - 50) {
    doc.addPage();
    signY = 20;
  }

  // Pre-load images if available
  let adminSigImg: HTMLImageElement | null = null;
  let adminStampImg: HTMLImageElement | null = null;
  let deanSigImg: HTMLImageElement | null = null;

  if (meta.adminSignatureUrl) {
    adminSigImg = await loadImageElement(meta.adminSignatureUrl);
  }
  if (meta.adminStampUrl) {
    adminStampImg = await loadImageElement(meta.adminStampUrl);
  }
  if (meta.deanSignatureUrl) {
    deanSigImg = await loadImageElement(meta.deanSignatureUrl);
  }

  // 1. Left Block: Administrator Approval & Official Stamp
  const adminBlockX = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 54, 93);
  doc.text('APPROVED BY ADMINISTRATOR (OFFICIAL STAMP)', adminBlockX, signY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('APDO Operations Directorate & Institutional Governance', adminBlockX, signY + 4);

  // Render Official Stamp & Admin Signature Images if present
  if (adminStampImg) {
    try {
      doc.addImage(adminStampImg, 'PNG', adminBlockX + 35, signY + 6, 24, 24);
    } catch {
      // Continue if format unsupported
    }
  }

  if (adminSigImg) {
    try {
      doc.addImage(adminSigImg, 'PNG', adminBlockX + 10, signY + 9, 32, 16);
    } catch {
      // Continue
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(adminBlockX, signY + 30, adminBlockX + 85, signY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(meta.adminName || 'Dr. Sarah Sterling', adminBlockX, signY + 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${meta.adminRole || 'Administrator'} • Approved: ${meta.adminApprovedAt ? meta.adminApprovedAt.slice(0, 10) : 'Recorded'}`, adminBlockX, signY + 38);

  // 2. Right Block: Dean Verification & Signature
  const deanBlockX = pageWidth - 105;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 54, 93);
  doc.text('CHECKED & VERIFIED BY DEPARTMENT DEAN', deanBlockX, signY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(meta.departmentName || meta.facultyName || 'Academic Department & Faculty Verification', deanBlockX, signY + 4);

  if (deanSigImg) {
    try {
      doc.addImage(deanSigImg, 'PNG', deanBlockX + 15, signY + 8, 38, 18);
    } catch {
      // Continue
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(deanBlockX, signY + 30, deanBlockX + 85, signY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(meta.deanName || 'Assigned Department Dean', deanBlockX, signY + 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${meta.deanRole || 'Dean'} (${meta.departmentCode || 'DEPT'}) • Verified: ${meta.deanCheckedAt ? meta.deanCheckedAt.slice(0, 10) : 'Verified'}`, deanBlockX, signY + 38);

  const filename = generateScheduleFilename(meta, 'pdf');
  doc.save(filename);
};

/**
 * Excel (.xlsx) Spreadsheet Export using SheetJS (xlsx)
 */
export const exportScheduleToExcel = (
  schedules: HydratedSchedule[],
  meta: ScheduleExportMeta
): void => {
  const wb = XLSX.utils.book_new();

  // Header rows with institutional metadata
  const headerRows = [
    ['WESTERN UNIVERSITY - APDO OPERATIONS MANAGEMENT SYSTEM'],
    ['OFFICIAL CLASS SCHEDULE'],
    [''],
    ['Target Entity:', meta.targetName, '', 'Academic Period:', `${meta.academicYear} • ${meta.semester}`],
    ['Campus Branch:', meta.branchName, '', 'Operating Period:', meta.periodName || 'All Periods'],
    ['Academic Batch:', meta.batchName || 'All Batches', '', 'Class Session:', meta.sessionName || 'All Sessions (1 & 2)'],
    ['Department:', meta.departmentName || 'All Departments', '', 'Assigned Dean:', meta.deanName || 'Assigned Dean'],
    ['Approval Status:', meta.isFullyApproved ? 'FULLY APPROVED' : (meta.approvalStatus || 'PENDING'), '', 'Administrator:', meta.adminName || 'Dr. Sarah Sterling'],
    ['Dean Verification:', meta.deanName || 'Prof. Arthur Pendelton', '', 'Generated Date:', meta.generatedAt],
    ['']
  ];

  // Column headers
  const columns = [
    'Schedule ID',
    'Day of Week',
    'Time Window',
    'Class Session',
    'Start Time',
    'End Time',
    'Course Code',
    'Course Title',
    meta.type === 'student' ? 'Assigned Faculty' : 'Cohort Sections',
    meta.type === 'student' ? 'Faculty Code' : 'Section Headcount',
    'Classroom / Lab',
    'Room Capacity',
    'Campus Branch',
    'Schedule Type',
    'Approval Status',
    'Admin Approver',
    'Admin Approved At',
    'Dean Verified By',
    'Dean Verified At',
    'Operational Remarks'
  ];

  // Data rows
  const dataRows = schedules.map(s => [
    s.id,
    s.timeSlotDay || 'Monday',
    s.timeSlotPeriod || 'Morning',
    s.sessionLabel || `Session ${s.sessionNumber || 1}`,
    s.effectiveStartTime12h ? `${s.effectiveStartTime12h} (${s.effectiveStartTime})` : (s.timeSlotStart?.slice(0, 5) || '08:00'),
    s.effectiveEndTime12h ? `${s.effectiveEndTime12h} (${s.effectiveEndTime})` : (s.timeSlotEnd?.slice(0, 5) || '09:30'),
    s.courseCode || '',
    s.courseName || '',
    meta.type === 'student' ? s.lecturerName || '' : s.linkedSectionNames?.join(', ') || '',
    meta.type === 'student' ? s.lecturerCode || '' : s.linkedSectionIds?.length || 1,
    s.classroomNumber || '',
    s.classroomCapacity || '',
    s.branchName || '',
    s.schedule_type || 'NORMAL',
    s.status || 'APPROVED',
    s.adminApproverName || meta.adminName || '',
    s.admin_approved_at ? s.admin_approved_at.slice(0, 16) : '',
    s.deanCheckerName || meta.deanName || '',
    s.dean_checked_at ? s.dean_checked_at.slice(0, 16) : '',
    s.remarks || ''
  ]);

  const sheetData = [...headerRows, columns, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Configure Column Widths for readability
  ws['!cols'] = [
    { wch: 12 }, // ID
    { wch: 14 }, // Day
    { wch: 14 }, // Window
    { wch: 12 }, // Session
    { wch: 18 }, // Start
    { wch: 18 }, // End
    { wch: 14 }, // Course Code
    { wch: 32 }, // Course Title
    { wch: 25 }, // Faculty / Section
    { wch: 14 }, // Code
    { wch: 16 }, // Classroom
    { wch: 14 }, // Cap
    { wch: 22 }, // Campus
    { wch: 14 }, // Type
    { wch: 16 }, // Status
    { wch: 20 }, // Admin Approver
    { wch: 20 }, // Admin Approved At
    { wch: 20 }, // Dean Verified By
    { wch: 20 }, // Dean Verified At
    { wch: 30 }  // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');

  const filename = generateScheduleFilename(meta, 'xlsx');
  XLSX.writeFile(wb, filename);
};

/**
 * RFC 4180 Escaped CSV Export
 */
export const exportScheduleToCSV = (
  schedules: HydratedSchedule[],
  meta: ScheduleExportMeta
): void => {
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'Schedule ID',
    'Day',
    'Time Window',
    'Class Session',
    'Start Time',
    'End Time',
    'Course Code',
    'Course Title',
    meta.type === 'student' ? 'Faculty Name' : 'Cohort Sections',
    'Classroom',
    'Room Capacity',
    'Campus',
    'Schedule Type',
    'Approval Status',
    'Admin Approver',
    'Admin Approved At',
    'Dean Verified By',
    'Dean Verified At',
    'Remarks'
  ];

  const rows = schedules.map(s => [
    escapeCSV(s.id),
    escapeCSV(s.timeSlotDay || 'Monday'),
    escapeCSV(s.timeSlotPeriod || 'Morning'),
    escapeCSV(s.sessionLabel || `Session ${s.sessionNumber || 1}`),
    escapeCSV(s.effectiveStartTime12h ? `${s.effectiveStartTime12h} (${s.effectiveStartTime})` : (s.timeSlotStart?.slice(0, 5) || '08:00')),
    escapeCSV(s.effectiveEndTime12h ? `${s.effectiveEndTime12h} (${s.effectiveEndTime})` : (s.timeSlotEnd?.slice(0, 5) || '09:30')),
    escapeCSV(s.courseCode || ''),
    escapeCSV(s.courseName || ''),
    escapeCSV(meta.type === 'student' ? s.lecturerName || '' : s.linkedSectionNames?.join('; ') || ''),
    escapeCSV(s.classroomNumber || ''),
    escapeCSV(s.classroomCapacity || ''),
    escapeCSV(s.branchName || ''),
    escapeCSV(s.schedule_type || 'NORMAL'),
    escapeCSV(s.status || 'APPROVED'),
    escapeCSV(s.adminApproverName || meta.adminName || ''),
    escapeCSV(s.admin_approved_at ? s.admin_approved_at.slice(0, 16) : ''),
    escapeCSV(s.deanCheckerName || meta.deanName || ''),
    escapeCSV(s.dean_checked_at ? s.dean_checked_at.slice(0, 16) : ''),
    escapeCSV(s.remarks || '')
  ]);

  const csvContent = [
    headers.map(h => escapeCSV(h)).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = generateScheduleFilename(meta, 'csv');
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
