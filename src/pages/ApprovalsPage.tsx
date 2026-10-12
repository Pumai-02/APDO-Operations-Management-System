import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { HydratedSchedule } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ApprovalImageUploader } from '../components/shared/ApprovalImageUploader';
import {
  SAMPLE_ADMIN_SIGNATURE_URL,
  SAMPLE_OFFICIAL_STAMP_URL,
  SAMPLE_DEAN_SIGNATURE_URL,
  getDeanSampleSignature
} from '../utils/approvalAssets';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  User,
  Calendar,
  Building,
  DoorOpen,
  Stamp,
  PenTool,
  ArrowRight,
  Eye,
  FileText,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ApprovalTab = 'pending_admin' | 'pending_dean' | 'fully_approved' | 'revisions_rejected' | 'history';

export const ApprovalsPage: React.FC = () => {
  const { currentUser, currentRole, switchRole, switchUser, allUsers, deans, isAdmin, isDean, isDeanOfDepartment } = useAuth();
  const {
    hydratedSchedules,
    approvalHistory,
    conflicts,
    users,
    departments,
    adminApproveSchedule,
    deanCheckSchedule,
    returnScheduleForRevision,
    rejectSchedule,
    startReviewSchedule
  } = useOperations();

  const [activeTab, setActiveTab] = useState<ApprovalTab>('pending_admin');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const [showOnlyMyDeanSchedules, setShowOnlyMyDeanSchedules] = useState<boolean>(true);

  // Modals state
  const [adminReviewSchedule, setAdminReviewSchedule] = useState<HydratedSchedule | null>(null);
  const [adminSignature, setAdminSignature] = useState<string>('');
  const [adminStamp, setAdminStamp] = useState<string>('');
  const [adminRemarks, setAdminRemarks] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');

  const [deanReviewSchedule, setDeanReviewSchedule] = useState<HydratedSchedule | null>(null);
  const [deanSignature, setDeanSignature] = useState<string>('');
  const [deanRemarks, setDeanRemarks] = useState<string>('');
  const [deanError, setDeanError] = useState<string>('');

  // Rejection / Revision modal
  const [revisionSchedule, setRevisionSchedule] = useState<HydratedSchedule | null>(null);
  const [revisionReason, setRevisionReason] = useState<string>('');
  const [revisionError, setRevisionError] = useState<string>('');

  const [rejectionSchedule, setRejectionSchedule] = useState<HydratedSchedule | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionError, setRejectionError] = useState<string>('');

  // Helper for department filtering
  const filterByDept = (s: HydratedSchedule) => {
    if (selectedDepartmentFilter === 'all') return true;
    return s.departmentId === selectedDepartmentFilter;
  };

  // Filter schedules by approval stages
  const pendingAdminSchedules = hydratedSchedules
    .filter(s => s.status === 'PENDING_ADMIN_APPROVAL' || s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW')
    .filter(filterByDept);

  const rawPendingDeanSchedules = hydratedSchedules
    .filter(s => s.status === 'ADMIN_APPROVED' || s.status === 'PENDING_DEAN_VERIFICATION')
    .filter(filterByDept);

  // When logged in as Dean, prioritize or filter to their department
  const pendingDeanSchedules = (isDean && showOnlyMyDeanSchedules)
    ? rawPendingDeanSchedules.filter(s => s.departmentDeanUserId === currentUser.id || s.dean_assigned_to === currentUser.id)
    : rawPendingDeanSchedules;

  const fullyApprovedSchedules = hydratedSchedules
    .filter(s => s.status === 'FULLY_APPROVED' || s.status === 'APPROVED')
    .filter(filterByDept);

  const revisionsAndRejectedSchedules = hydratedSchedules
    .filter(s => s.status === 'RETURNED_FOR_REVISION' || s.status === 'REJECTED')
    .filter(filterByDept);

  // Open Admin Review
  const handleOpenAdminReview = (sched: HydratedSchedule) => {
    setAdminReviewSchedule(sched);
    setAdminSignature(sched.admin_signature_url || '');
    setAdminStamp(sched.admin_stamp_url || '');
    setAdminRemarks(sched.admin_remarks || '');
    setAdminError('');
  };

  // Confirm Admin Approval
  const handleConfirmAdminApproval = () => {
    if (!adminReviewSchedule) return;

    if (!adminSignature.trim()) {
      setAdminError('Administrator signature image is required for formal authorization.');
      return;
    }

    if (!adminStamp.trim()) {
      setAdminError('Official APDO institutional stamp image is required for formal authorization.');
      return;
    }

    // Check for critical unresolved conflicts
    const hasCriticalConflicts = conflicts.some(
      c => c.schedule_id === adminReviewSchedule.id && !c.resolved && c.severity === 'CRITICAL'
    );

    if (hasCriticalConflicts) {
      if (!window.confirm('WARNING: Unresolved CRITICAL conflicts exist for this schedule. Do you wish to proceed with an Administrative Override?')) {
        return;
      }
    }

    adminApproveSchedule(
      adminReviewSchedule.id,
      currentUser.id,
      adminSignature,
      adminStamp,
      adminRemarks
    );

    setAdminReviewSchedule(null);
  };

  // Open Dean Review
  const handleOpenDeanReview = (sched: HydratedSchedule) => {
    // Strictly enforce approval sequence:
    if (sched.status !== 'ADMIN_APPROVED' && sched.status !== 'PENDING_DEAN_VERIFICATION') {
      alert('Approval Sequence Violation: Administrator must approve the schedule and apply the official stamp before Dean verification.');
      return;
    }

    // Strictly enforce Department-Specific Dean authorization:
    if (isDean) {
      const isAuthorized = (sched.departmentDeanUserId && sched.departmentDeanUserId === currentUser.id) ||
        (sched.dean_assigned_to && sched.dean_assigned_to === currentUser.id);
      if (!isAuthorized) {
        alert(`Access Restricted: Schedule #${sched.id} belongs to "${sched.departmentName}" and must be verified by its assigned Dean (${sched.departmentDeanName || 'Assigned Dean'}). You are currently signed in as Dean for another department.`);
        return;
      }
    }

    setDeanReviewSchedule(sched);
    setDeanSignature(sched.dean_signature_url || '');
    setDeanRemarks(sched.dean_remarks || '');
    setDeanError('');
  };

  // Confirm Dean Check
  const handleConfirmDeanVerification = () => {
    if (!deanReviewSchedule) return;

    if (!deanSignature.trim()) {
      setDeanError('Dean verification signature image is required for final authorization.');
      return;
    }

    try {
      deanCheckSchedule(
        deanReviewSchedule.id,
        currentUser.id,
        deanSignature,
        deanRemarks
      );
      setDeanReviewSchedule(null);
    } catch (err: any) {
      setDeanError(err.message || 'Error completing Dean verification.');
    }
  };

  // Confirm Revision Request
  const handleConfirmRevision = () => {
    if (!revisionSchedule) return;

    if (!revisionReason.trim()) {
      setRevisionError('A detailed reason explaining the requested revisions is required.');
      return;
    }

    returnScheduleForRevision(revisionSchedule.id, currentUser.id, revisionReason);
    setRevisionSchedule(null);
    setRevisionReason('');
  };

  // Confirm Rejection
  const handleConfirmRejection = () => {
    if (!rejectionSchedule) return;

    if (!rejectionReason.trim()) {
      setRejectionError('A formal justification is required when rejecting a schedule.');
      return;
    }

    rejectSchedule(rejectionSchedule.id, currentUser.id, rejectionReason);
    setRejectionSchedule(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-brand-blue" />
            Formal Schedule Approval & Official Authorization
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Two-stage institutional governance: Administrator approval with signature &amp; official stamp, followed by Dean verification.
          </p>
        </div>

        {/* Multi-Dean Persona Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs">
          <div className="px-2 py-1 flex items-center gap-1.5 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <span>Active Persona:</span>
          </div>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const uid = e.target.value;
              const targetUser = allUsers.find(u => u.id === uid);
              if (targetUser) {
                switchUser(uid);
              }
            }}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-brand-blue"
          >
            <option value="1">Admin (Mr. Im Saravuth)</option>
            {deans.map(dean => {
              const dept = departments.find(d => d.dean_user_id === dean.id);
              return (
                <option key={dean.id} value={dean.id}>
                  Dean {dean.name} {dept ? `[${dept.code}]` : ''}
                </option>
              );
            })}
          </select>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-brand-blue/10 text-brand-blue">
            {currentRole}
          </span>
        </div>
      </div>

      {/* Institutional Approval Sequence Tracker Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-brand-navy to-blue-950 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold tracking-wide uppercase text-[11px] text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Institutional Approval Sequence</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium">
            Dean verification is strictly locked until Administrator approval and official stamp are recorded.
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-blue-300 font-bold block uppercase">Stage 1</span>
            <span className="font-bold text-white block mt-0.5">Schedule Submitted</span>
            <span className="text-[10px] text-slate-300 block mt-1">Timetable created by staff</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white/15 backdrop-blur-xs border border-amber-400/40">
            <span className="text-[10px] text-amber-300 font-bold block uppercase">Stage 2</span>
            <span className="font-bold text-white block mt-0.5">Admin Approval &amp; Stamp</span>
            <span className="text-[10px] text-amber-200 block mt-1">Admin signature + round stamp</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-blue-300 font-bold block uppercase">Stage 3</span>
            <span className="font-bold text-white block mt-0.5">Dean Quality Verification</span>
            <span className="text-[10px] text-slate-300 block mt-1">Dean checks &amp; signs schedule</span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/30">
            <span className="text-[10px] text-emerald-300 font-bold block uppercase">Final Stage</span>
            <span className="font-bold text-emerald-200 block mt-0.5">Fully Approved Schedule</span>
            <span className="text-[10px] text-emerald-300/80 block mt-1">Official PDF with all marks</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pending_admin')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'pending_admin'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Pending Admin Approval</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'pending_admin' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'
          }`}>
            {pendingAdminSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending_dean')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'pending_dean'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Pending Dean Verification</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'pending_dean' ? 'bg-blue-400 text-slate-900' : 'bg-slate-200 text-slate-700'
          }`}>
            {pendingDeanSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fully_approved')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'fully_approved'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Fully Approved</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'fully_approved' ? 'bg-emerald-400 text-slate-900' : 'bg-slate-200 text-slate-700'
          }`}>
            {fullyApprovedSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('revisions_rejected')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'revisions_rejected'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Returned &amp; Rejected</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'revisions_rejected' ? 'bg-rose-400 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {revisionsAndRejectedSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Approval Audit Log</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {approvalHistory.length}
          </span>
        </button>
      </div>

      {/* Department & Routing Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Filter Department:</span>
            <select
              value={selectedDepartmentFilter}
              onChange={e => setSelectedDepartmentFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-brand-blue"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {isDean && activeTab === 'pending_dean' && (
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
              <input
                type="checkbox"
                checked={showOnlyMyDeanSchedules}
                onChange={e => setShowOnlyMyDeanSchedules(e.target.checked)}
                className="rounded text-brand-blue focus:ring-brand-blue"
              />
              <span>Only Schedules for My Department</span>
            </label>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {isDean ? (
            <span>Signed in as <strong>{currentUser.name}</strong> • Authorized for their assigned department</span>
          ) : (
            <span>Signed in as <strong>{currentUser.name}</strong> • Institutional Administrator</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENDING ADMIN APPROVAL (STAGE 1)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'pending_admin' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Administrator Review Stage:</strong> The Administrator must review schedule allocations, attach authorized signature, and apply the APDO official round stamp.
              </span>
            </div>
            {!isAdmin && (
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Requires Administrator permissions to approve
              </span>
            )}
          </div>

          {pendingAdminSchedules.length === 0 ? (
            <div className="card-enterprise p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Admin Queue Cleared</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are currently no schedules awaiting Administrator review and official stamp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAdminSchedules.map(sched => {
                const schedConflicts = conflicts.filter(c => c.schedule_id === sched.id && !c.resolved);

                return (
                  <div key={sched.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">Schedule #{sched.id}</span>
                            {sched.batchCode && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                                {sched.batchCode}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-brand-navy leading-snug mt-0.5">
                            {sched.courseCode} - {sched.courseName}
                          </h4>
                        </div>
                        <StatusBadge status={sched.status} size="sm" />
                      </div>

                      <div className="py-3 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{sched.lecturerName}</span>
                          <span className="text-slate-400 font-mono">({sched.lecturerCode})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sched.branchName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Classroom {sched.classroomNumber} (Cap: {sched.classroomCapacity})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sched.timeSlotDay} &bull; {sched.timeSlotPeriod} (Session {sched.sessionNumber || 1}: {sched.effectiveStartTime12h} – {sched.effectiveEndTime12h})</span>
                        </div>

                        {sched.linkedSectionNames.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {sched.linkedSectionNames.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {schedConflicts.length > 0 && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2 mt-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{schedConflicts.length} conflict(s) flagged on this schedule</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setRejectionSchedule(sched);
                          setRejectionReason('');
                          setRejectionError('');
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleOpenAdminReview(sched)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Admin Review &amp; Stamp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENDING DEAN VERIFICATION (STAGE 2)                                */}
      {/* ========================================================================= */}
      {activeTab === 'pending_dean' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Dean Verification Stage:</strong> The Administrator has approved these schedules and affixed the official stamp. The Dean verifies academic quality, signs, or returns for revision.
              </span>
            </div>
            {!isDean && (
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Requires Dean permissions to verify
              </span>
            )}
          </div>

          {pendingDeanSchedules.length === 0 ? (
            <div className="card-enterprise p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Dean Verification Queue Cleared</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are currently no Admin-approved schedules waiting for Dean quality verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingDeanSchedules.map(sched => {
                const isMyDepartment = isDean
                  ? (sched.departmentDeanUserId === currentUser.id || sched.dean_assigned_to === currentUser.id)
                  : true;

                return (
                  <div
                    key={sched.id}
                    className={`card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all border-l-4 ${
                      isMyDepartment ? 'border-l-blue-600' : 'border-l-slate-400 opacity-90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-400">Schedule #{sched.id}</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {sched.departmentCode}
                            </span>
                            {sched.batchCode && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                                {sched.batchCode}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-brand-navy leading-snug mt-1">
                            {sched.courseCode} - {sched.courseName}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {sched.departmentName}
                          </span>
                        </div>
                        <StatusBadge status={sched.status} size="sm" />
                      </div>

                      <div className="py-3 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{sched.lecturerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Room {sched.classroomNumber} &bull; {sched.branchName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sched.timeSlotDay} &bull; {sched.timeSlotPeriod} (Session {sched.sessionNumber || 1})</span>
                        </div>

                        {/* Department & Assigned Dean Routing Indicator */}
                        <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 flex items-center justify-between text-[11px]">
                          <span className="font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            Assigned Dean:
                          </span>
                          <span className="font-bold text-slate-800">
                            {sched.departmentDeanName || 'Assigned Dean'}
                          </span>
                        </div>

                        {/* Admin Approval Evidence Badge */}
                        <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="flex items-center gap-1 text-emerald-800">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Admin Stage 1 Completed
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono">
                              {sched.admin_approved_at ? new Date(sched.admin_approved_at).toLocaleDateString() : 'Recorded'}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700">
                            Approved by <strong>{sched.adminApproverName || 'Administrator'}</strong> with signature &amp; stamp.
                          </p>
                          {sched.admin_stamp_url && (
                            <div className="pt-1 flex items-center gap-2">
                              <span className="text-[9px] uppercase font-bold text-emerald-800">Stamp Evidence:</span>
                              <img
                                src={sched.admin_stamp_url}
                                alt="Official Stamp Evidence"
                                className="w-7 h-7 object-contain bg-white rounded border border-emerald-300 p-0.5"
                              />
                              {sched.admin_signature_url && (
                                <img
                                  src={sched.admin_signature_url}
                                  alt="Admin Signature Evidence"
                                  className="h-6 max-w-[60px] object-contain bg-white rounded border border-emerald-300 px-1"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setRevisionSchedule(sched);
                          setRevisionReason('');
                          setRevisionError('');
                        }}
                        disabled={isDean && !isMyDepartment}
                        className={`text-xs font-semibold ${
                          isDean && !isMyDepartment
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-amber-700 hover:text-amber-900'
                        }`}
                      >
                        Return for Revision
                      </button>

                      {isMyDepartment || isAdmin ? (
                        <button
                          onClick={() => handleOpenDeanReview(sched)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Dean Verify &amp; Sign</span>
                        </button>
                      ) : (
                        <span
                          className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-medium border border-slate-200"
                          title={`Assigned to Dean ${sched.departmentDeanName}`}
                        >
                          Assigned to Dean {sched.departmentDeanName?.split(' ')[1] || 'Assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FULLY APPROVED SCHEDULES                                           */}
      {/* ========================================================================= */}
      {activeTab === 'fully_approved' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Fully Authorized Schedules:</strong> Both Administrator approval (with signature &amp; stamp) and Dean verification (with signature) have been completed. Documents are ready for official PDF export and printing.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fullyApprovedSchedules.map(sched => (
              <div key={sched.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all border-t-4 border-t-emerald-600">
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Schedule #{sched.id}</span>
                        {sched.batchCode && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                            {sched.batchCode}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-brand-navy leading-snug mt-0.5">
                        {sched.courseCode} - {sched.courseName}
                      </h4>
                    </div>
                    <StatusBadge status={sched.status} size="sm" />
                  </div>

                  <div className="py-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{sched.lecturerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sched.branchName} &bull; Room {sched.classroomNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sched.timeSlotDay} &bull; {sched.timeSlotPeriod} (Session {sched.sessionNumber || 1})</span>
                    </div>

                    {/* Dual Verification Stamp & Signatures Preview */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Official Dual Authorization Evidence:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="font-bold text-brand-navy block truncate">
                            Admin: {sched.adminApproverName || 'Administrator'}
                          </span>
                          <span className="text-slate-400 block text-[9px]">
                            {sched.admin_approved_at ? new Date(sched.admin_approved_at).toLocaleDateString() : 'Approved'}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5">
                            {sched.admin_stamp_url && (
                              <img src={sched.admin_stamp_url} alt="Stamp" className="w-6 h-6 object-contain" />
                            )}
                            {sched.admin_signature_url && (
                              <img src={sched.admin_signature_url} alt="Sig" className="h-5 max-w-[50px] object-contain" />
                            )}
                          </div>
                        </div>

                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="font-bold text-brand-navy block truncate">
                            Dean: {sched.deanCheckerName || 'Dean of Academics'}
                          </span>
                          <span className="text-slate-400 block text-[9px]">
                            {sched.dean_checked_at ? new Date(sched.dean_checked_at).toLocaleDateString() : 'Verified'}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5">
                            {sched.dean_signature_url && (
                              <img src={sched.dean_signature_url} alt="Dean Sig" className="h-5 max-w-[60px] object-contain" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    to="/schedule-preview"
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Official Document</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RETURNED FOR REVISION & REJECTED                                   */}
      {/* ========================================================================= */}
      {activeTab === 'revisions_rejected' && (
        <div className="space-y-4">
          {revisionsAndRejectedSchedules.length === 0 ? (
            <div className="card-enterprise p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Flagged Schedules</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are currently no schedules marked for revision or rejected.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {revisionsAndRejectedSchedules.map(sched => (
                <div key={sched.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all border-l-4 border-l-rose-500">
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">Schedule #{sched.id}</span>
                        <h4 className="text-sm font-bold text-brand-navy leading-snug">
                          {sched.courseCode} - {sched.courseName}
                        </h4>
                      </div>
                      <StatusBadge status={sched.status} size="sm" />
                    </div>

                    <div className="py-3 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{sched.lecturerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sched.branchName} &bull; Room {sched.classroomNumber}</span>
                      </div>

                      {/* Reason Note Card */}
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 mt-2 space-y-1">
                        <span className="font-bold text-[11px] block text-rose-800">
                          {sched.status === 'RETURNED_FOR_REVISION' ? 'Revision Instructions:' : 'Rejection Reason:'}
                        </span>
                        <p className="text-[11px] text-rose-700">
                          {sched.revision_requested_reason || sched.rejection_reason || 'No justification noted.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      to="/schedules"
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Edit &amp; Re-submit</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: APPROVAL HISTORY AUDIT TRAIL                                       */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="card-enterprise overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-brand-navy">Chronological Authorization &amp; Image Audit Log</span>
            <span className="text-slate-500">{approvalHistory.length} recorded events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Reviewer / Actor</th>
                  <th className="px-4 py-3">Action Recorded</th>
                  <th className="px-4 py-3">Resulting Status</th>
                  <th className="px-4 py-3">Audit Details / Remarks</th>
                  <th className="px-4 py-3">Digital Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {approvalHistory.map(item => {
                  const rev = users.find(u => u.id === item.reviewer_id);
                  const sched = hydratedSchedules.find(s => s.id === item.schedule_id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(item.reviewed_at || item.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900">#{item.schedule_id}</span>
                        {sched && (
                          <span className="text-slate-500 block text-[11px] truncate max-w-[150px]">
                            {sched.courseCode} ({sched.classroomNumber})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <span>{rev?.name || `User #${item.reviewer_id}`}</span>
                        <span className="block text-[10px] text-slate-400">{rev?.role || 'Authorized User'}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-brand-navy">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                          {item.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs text-[11px]">
                        {item.comments || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {item.stamp_url || item.signature_url ? (
                          <div className="flex items-center gap-1.5">
                            {item.stamp_url && (
                              <img src={item.stamp_url} alt="Stamp" className="w-6 h-6 object-contain rounded border border-slate-200" title="Stamp Attached" />
                            )}
                            {item.signature_url && (
                              <img src={item.signature_url} alt="Sig" className="h-5 max-w-[40px] object-contain rounded border border-slate-200" title="Signature Attached" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADMIN APPROVAL & OFFICIAL STAMP (STAGE 1)                         */}
      {/* ========================================================================= */}
      {adminReviewSchedule && (
        <Modal
          isOpen={!!adminReviewSchedule}
          onClose={() => setAdminReviewSchedule(null)}
          title={`Administrator Schedule Review #${adminReviewSchedule.id}`}
          description="Apply authorized Administrator signature and official APDO institutional stamp"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Schedule Summary Header */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-sm text-brand-navy">
                  {adminReviewSchedule.courseCode} - {adminReviewSchedule.courseName}
                </span>
                <StatusBadge status={adminReviewSchedule.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Faculty:</span>
                  <span className="font-semibold text-slate-800">{adminReviewSchedule.lecturerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Campus:</span>
                  <span className="font-semibold text-slate-800">{adminReviewSchedule.branchName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Room:</span>
                  <span className="font-semibold text-slate-800">Classroom {adminReviewSchedule.classroomNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Window &amp; Session:</span>
                  <span className="font-semibold text-slate-800">{adminReviewSchedule.timeSlotDay} &bull; {adminReviewSchedule.timeSlotPeriod} (S{adminReviewSchedule.sessionNumber || 1})</span>
                </div>
              </div>
            </div>

            {/* Officer Credentials */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Authorizing Administrator:</span>
                <span className="font-bold text-slate-900">{currentUser.name}</span>
                <span className="text-slate-500 ml-1">({currentUser.role})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Timestamp:</span>
                <span className="font-mono text-slate-700">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Two Separate Upload Controls: Signature & Official Stamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* 1. Admin Signature */}
              <ApprovalImageUploader
                label="Administrator Signature"
                description="Upload official transparent PNG or JPEG signature image (Max 5MB)"
                sampleUrl={SAMPLE_ADMIN_SIGNATURE_URL}
                sampleLabel="Fill Sample Admin Signature"
                aspectRatio="signature"
                value={adminSignature}
                onChange={val => {
                  setAdminSignature(val);
                  setAdminError('');
                }}
              />

              {/* 2. Official APDO Stamp */}
              <ApprovalImageUploader
                label="APDO Official Round Stamp"
                description="Upload official high-resolution institutional stamp seal (Max 5MB)"
                sampleUrl={SAMPLE_OFFICIAL_STAMP_URL}
                sampleLabel="Fill Sample Official Stamp"
                aspectRatio="stamp"
                value={adminStamp}
                onChange={val => {
                  setAdminStamp(val);
                  setAdminError('');
                }}
              />
            </div>

            {/* Admin Optional Remarks */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Administrative Approval Remarks <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                value={adminRemarks}
                onChange={e => setAdminRemarks(e.target.value)}
                rows={2}
                placeholder="Enter administrative notes, compliance validations, or special provisions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-xs"
              />
            </div>

            {/* Validation Error */}
            {adminError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdminReviewSchedule(null)}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const sched = adminReviewSchedule;
                    setAdminReviewSchedule(null);
                    setRejectionSchedule(sched);
                    setRejectionReason('');
                    setRejectionError('');
                  }}
                  className="btn-danger text-xs py-2 px-3 gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAdminApproval}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm gap-1.5"
                >
                  <Stamp className="w-4 h-4" />
                  <span>Approve &amp; Apply Official Stamp</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DEAN VERIFICATION & SIGNATURE (STAGE 2)                          */}
      {/* ========================================================================= */}
      {deanReviewSchedule && (
        <Modal
          isOpen={!!deanReviewSchedule}
          onClose={() => setDeanReviewSchedule(null)}
          title={`Dean Academic Verification #${deanReviewSchedule.id}`}
          description="Verify academic workload compliance and apply Dean signature for final approval"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Stage 1 Evidence Inspection Card */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Stage 1: Administrator Approval Evidence Verified
                </span>
                <span className="text-[10px] font-mono text-emerald-700">
                  {deanReviewSchedule.admin_approved_at ? new Date(deanReviewSchedule.admin_approved_at).toLocaleString() : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block">Approving Administrator:</span>
                  <span className="font-bold text-slate-900">{deanReviewSchedule.adminApproverName || 'Administrator'}</span>
                  {deanReviewSchedule.admin_remarks && (
                    <p className="text-[10px] text-slate-600 italic mt-0.5">"{deanReviewSchedule.admin_remarks}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {deanReviewSchedule.admin_stamp_url && (
                    <div className="text-center">
                      <img
                        src={deanReviewSchedule.admin_stamp_url}
                        alt="Official Stamp"
                        className="w-14 h-14 object-contain mx-auto bg-white rounded border border-emerald-300 p-0.5"
                      />
                      <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">Official Stamp</span>
                    </div>
                  )}

                  {deanReviewSchedule.admin_signature_url && (
                    <div className="text-center">
                      <img
                        src={deanReviewSchedule.admin_signature_url}
                        alt="Admin Signature"
                        className="h-14 max-w-[100px] object-contain mx-auto bg-white rounded border border-emerald-300 px-1"
                      />
                      <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">Admin Signature</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dean Credentials & Department Info */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Reviewing Dean:</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                  <span className="text-slate-500 ml-1">({currentUser.role})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Verification Timestamp:</span>
                  <span className="font-mono text-slate-700">{new Date().toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Assigned Department:</span>
                <span className="font-bold text-brand-navy">
                  {deanReviewSchedule.departmentName} ({deanReviewSchedule.facultyName})
                </span>
              </div>
            </div>

            {/* Dean Signature Upload */}
            <div>
              <ApprovalImageUploader
                label="Dean Verification Signature"
                description={`Upload authorized signature image for ${currentUser.name} (transparent PNG or JPEG, Max 5MB)`}
                sampleUrl={getDeanSampleSignature(currentUser.id)}
                sampleLabel={`Fill Sample Signature (${currentUser.name})`}
                aspectRatio="signature"
                value={deanSignature}
                onChange={val => {
                  setDeanSignature(val);
                  setDeanError('');
                }}
              />
            </div>

            {/* Optional Remarks */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dean Verification Remarks <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                value={deanRemarks}
                onChange={e => setDeanRemarks(e.target.value)}
                rows={2}
                placeholder="Enter quality verification notes, curriculum checks, or accreditation remarks..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-xs"
              />
            </div>

            {/* Error */}
            {deanError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deanError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeanReviewSchedule(null)}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const sched = deanReviewSchedule;
                    setDeanReviewSchedule(null);
                    setRevisionSchedule(sched);
                    setRevisionReason('');
                    setRevisionError('');
                  }}
                  className="btn-secondary text-amber-700 border-amber-200 hover:bg-amber-50 text-xs py-2 px-3 gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return for Revision</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeanVerification}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm gap-1.5"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Mark as Checked &amp; Grant Final Approval</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RETURN FOR REVISION                                              */}
      {/* ========================================================================= */}
      {revisionSchedule && (
        <Modal
          isOpen={!!revisionSchedule}
          onClose={() => setRevisionSchedule(null)}
          title={`Return Schedule #${revisionSchedule.id} for Revision`}
          description="Specify the timetable adjustments, room changes, or lecturer modifications required"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <span className="font-bold block mb-1">
                {revisionSchedule.courseCode} - {revisionSchedule.courseName}
              </span>
              <p className="text-[11px] text-amber-800">
                Returning this schedule will reset its approval state and notify the scheduling team to implement the required modifications.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Revision Instructions &amp; Required Changes *
              </label>
              <textarea
                value={revisionReason}
                onChange={e => {
                  setRevisionReason(e.target.value);
                  setRevisionError('');
                }}
                rows={4}
                placeholder="Detail what needs to be changed (e.g., room capacity insufficient, lecturer shift conflict, preferred lab allocation)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
              />
              {revisionError && (
                <p className="text-rose-600 mt-1 font-semibold">{revisionError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRevisionSchedule(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevision}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
              >
                Confirm Return for Revision
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REJECT SCHEDULE                                                  */}
      {/* ========================================================================= */}
      {rejectionSchedule && (
        <Modal
          isOpen={!!rejectionSchedule}
          onClose={() => setRejectionSchedule(null)}
          title={`Reject Operational Schedule #${rejectionSchedule.id}`}
          description="Provide justification for managerial rejection"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
              <span className="font-bold block mb-1">
                {rejectionSchedule.courseCode} - {rejectionSchedule.courseName}
              </span>
              <p className="text-[11px] text-rose-800">
                Rejecting this schedule will terminate its approval workflow.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rejection Justification *
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => {
                  setRejectionReason(e.target.value);
                  setRejectionError('');
                }}
                rows={4}
                placeholder="State the policy violation, unresolvable resource constraint, or academic reason..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs"
              />
              {rejectionError && (
                <p className="text-rose-600 mt-1 font-semibold">{rejectionError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectionSchedule(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="btn-danger"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
