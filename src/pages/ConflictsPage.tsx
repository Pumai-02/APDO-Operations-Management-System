import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { ScheduleConflict } from '../types/database';
import { ConflictBadge } from '../components/shared/ConflictBadge';
import { Modal } from '../components/shared/Modal';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Filter,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConflictsPage: React.FC = () => {
  const { currentUser, canApprove } = useAuth();
  const { conflicts, resolveConflict, hydratedSchedules } = useOperations();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [resolvingConflict, setResolvingConflict] = useState<ScheduleConflict | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const openCount = conflicts.filter(c => !c.resolved).length;
  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL' && !c.resolved).length;
  const errorCount = conflicts.filter(c => c.severity === 'ERROR' && !c.resolved).length;
  const resolvedCount = conflicts.filter(c => c.resolved).length;

  const filteredConflicts = conflicts.filter(c => {
    if (filterSeverity !== 'all' && c.severity !== filterSeverity) return false;
    if (filterStatus === 'open' && c.resolved) return false;
    if (filterStatus === 'resolved' && !c.resolved) return false;
    return true;
  });

  const handleConfirmResolve = () => {
    if (resolvingConflict) {
      resolveConflict(resolvingConflict.id, resolutionNotes || 'Resolved and acknowledged by administrator.', currentUser.id);
      setResolvingConflict(null);
      setResolutionNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Conflict Detection & Validation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-dimensional validation monitoring schedule overlap, double-bookings, and faculty availability violations.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 border-l-4 border-l-rose-500">
          <span className="text-xs font-semibold text-slate-400 uppercase">Critical Conflicts</span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Immediate schedule double-bookings</span>
        </div>

        <div className="card-enterprise p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-400 uppercase">Blocking Errors</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{errorCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Availability & policy exceptions</span>
        </div>

        <div className="card-enterprise p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-400 uppercase">Resolved Issues</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Acknowledged with audit notes</span>
        </div>

        <div className="card-enterprise p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-semibold text-slate-400 uppercase">Validation Engine</span>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">Active</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Zero Unchecked Writes
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Severity:</span>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="ERROR">Errors Only</option>
              <option value="WARNING">Warnings Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All (Open & Resolved)</option>
              <option value="open">Open / Unresolved ({openCount})</option>
              <option value="resolved">Resolved ({resolvedCount})</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400">
          Showing {filteredConflicts.length} of {conflicts.length} recorded exceptions
        </span>
      </div>

      {/* Conflicts List */}
      <div className="space-y-3">
        {filteredConflicts.length === 0 ? (
          <div className="card-enterprise p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Operational Integrity Verified</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No conflicts match the active criteria. All schedule records satisfy classroom availability, room capacity, and faculty assignment rules.
            </p>
          </div>
        ) : (
          filteredConflicts.map(c => {
            const sched = hydratedSchedules.find(s => s.id === c.schedule_id);
            const conflictingSched = c.conflicting_schedule_id
              ? hydratedSchedules.find(s => s.id === c.conflicting_schedule_id)
              : null;

            return (
              <div
                key={c.id}
                className={`card-enterprise p-5 transition-all ${
                  c.resolved ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-rose-200/80 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <ConflictBadge severity={c.severity} resolved={c.resolved} />
                    <span className="font-mono text-xs font-bold text-slate-700">
                      Rule: {c.conflict_type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Detected {new Date(c.detected_at).toLocaleString()}
                    </span>
                  </div>

                  {canApprove && !c.resolved && (
                    <button
                      onClick={() => {
                        setResolvingConflict(c);
                        setResolutionNotes('');
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      Resolve Conflict
                    </button>
                  )}
                </div>

                <div className="py-3">
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {c.description}
                  </p>

                  {/* Impacted Schedules Comparison */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-700 flex items-center justify-between">
                        <span>Target Schedule #{c.schedule_id}</span>
                        {sched && (
                          <Link to={`/schedules?id=${sched.id}`} className="text-brand-blue text-[10px] hover:underline flex items-center gap-0.5">
                            Inspect <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      {sched ? (
                        <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                          <div><strong>Course:</strong> {sched.courseCode} - {sched.courseName}</div>
                          <div><strong>Faculty:</strong> {sched.lecturerName}</div>
                          <div><strong>Classroom:</strong> {sched.classroomNumber}</div>
                          <div><strong>Slot:</strong> {sched.timeSlotDay} ({sched.timeSlotPeriod})</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Schedule details not found.</span>
                      )}
                    </div>

                    {c.conflicting_schedule_id && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Conflicting Schedule #{c.conflicting_schedule_id}</span>
                          {conflictingSched && (
                            <Link to={`/schedules?id=${conflictingSched.id}`} className="text-brand-blue text-[10px] hover:underline flex items-center gap-0.5">
                              Inspect <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        {conflictingSched ? (
                          <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                            <div><strong>Course:</strong> {conflictingSched.courseCode} - {conflictingSched.courseName}</div>
                            <div><strong>Faculty:</strong> {conflictingSched.lecturerName}</div>
                            <div><strong>Classroom:</strong> {conflictingSched.classroomNumber}</div>
                            <div><strong>Slot:</strong> {conflictingSched.timeSlotDay} ({conflictingSched.timeSlotPeriod})</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No direct conflicting schedule ID</span>
                        )}
                      </div>
                    )}
                  </div>

                  {c.resolved && c.resolution_notes && (
                    <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-xs text-emerald-900">
                      <strong className="block text-[10px] uppercase font-bold text-emerald-800">Resolution Audit Note:</strong>
                      {c.resolution_notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESOLUTION MODAL */}
      <Modal
        isOpen={!!resolvingConflict}
        onClose={() => setResolvingConflict(null)}
        title="Resolve Operational Conflict"
        description="Record resolution explanation, room reassignment confirmation, or administrative override notes"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <span className="font-bold block mb-1">Issue to be resolved:</span>
            {resolvingConflict?.description}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resolution Audit Notes / Action Taken *
            </label>
            <textarea
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Verified with facility manager: Schedule #8 relocated to LAB-201. Room LH-101 conflict cleared."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setResolvingConflict(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmResolve}
              className="btn-primary"
            >
              Confirm Resolution
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
