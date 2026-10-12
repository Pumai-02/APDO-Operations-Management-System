import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { TimeSlot } from '../types/database';
import { Modal } from '../components/shared/Modal';
import { StatusBadge } from '../components/shared/StatusBadge';
import {
  formatTime12h,
  formatTime24h,
  calculateDurationMinutes,
  validateTimeWindowSessions
} from '../utils/timeFormat';
import {
  Clock,
  Settings2,
  Calendar,
  Layers,
  Coffee,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles
} from 'lucide-react';

export const TimeSlotsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const { timeSlots, updateTimeSlotSessions } = useOperations();
  const canManage = currentRole === 'ADMIN' || currentRole === 'DEAN';

  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Modal editing state
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [applyToAllPeriod, setApplyToAllPeriod] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    session_1_start: '17:30',
    session_1_end: '19:00',
    break_start: '19:00',
    break_end: '19:10',
    session_2_start: '19:10',
    session_2_end: '20:40'
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const periods = ['Morning', 'Afternoon', 'Evening'];

  const filteredSlots = timeSlots.filter(t => {
    if (selectedDay !== 'all' && t.day_of_week !== selectedDay) return false;
    if (selectedPeriod !== 'all' && t.period !== selectedPeriod) return false;
    return true;
  });

  const handleOpenEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      session_1_start: (slot.session_1_start || slot.start_time || '08:00:00').slice(0, 5),
      session_1_end: (slot.session_1_end || '09:30:00').slice(0, 5),
      break_start: (slot.break_start || slot.session_1_end || '09:30:00').slice(0, 5),
      break_end: (slot.break_end || slot.session_2_start || '09:45:00').slice(0, 5),
      session_2_start: (slot.session_2_start || '09:45:00').slice(0, 5),
      session_2_end: (slot.session_2_end || slot.end_time || '11:15:00').slice(0, 5)
    });
    setValidationError(null);
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    // Validate times
    const validation = validateTimeWindowSessions(formData);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid time configuration.');
      return;
    }

    setValidationError(null);
    updateTimeSlotSessions(
      editingSlot.id,
      {
        session_1_start: `${formData.session_1_start}:00`,
        session_1_end: `${formData.session_1_end}:00`,
        break_start: `${formData.break_start}:00`,
        break_end: `${formData.break_end}:00`,
        session_2_start: `${formData.session_2_start}:00`,
        session_2_end: `${formData.session_2_end}:00`
      },
      applyToAllPeriod
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setEditingSlot(null);
      setSaveSuccess(false);
    }, 1200);
  };

  // Live durations in modal
  const s1Mins = calculateDurationMinutes(formData.session_1_start, formData.session_1_end);
  const breakMins = calculateDurationMinutes(formData.break_start, formData.break_end);
  const s2Mins = calculateDurationMinutes(formData.session_2_start, formData.session_2_end);
  const totalWindowMins = calculateDurationMinutes(formData.session_1_start, formData.session_2_end);

  return (
    <div className="space-y-6">
      {/* Page Title & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-blue" />
            Time Windows & Class Sessions Configuration Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic Time Windows (Morning, Afternoon, Evening) with exactly two class sessions and scheduled transition breaks.
          </p>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Time Windows
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-navy mt-2">{timeSlots.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Standard academic periods across 7 days</div>
        </div>

        <div className="card-enterprise p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Sessions Available
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900 mt-2">{timeSlots.length * 2}</div>
          <div className="text-[11px] text-purple-700 mt-1">Exactly 2 sessions per Time Window</div>
        </div>

        <div className="card-enterprise p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Standard Class Duration
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">90 Mins</div>
          <div className="text-[11px] text-emerald-700 mt-1">1.5 hours per class session</div>
        </div>

        <div className="card-enterprise p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scheduled Recess
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 mt-2">10 – 15 Mins</div>
          <div className="text-[11px] text-amber-700 mt-1">Break between Session 1 & Session 2</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-enterprise p-4 bg-white flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Day:</span>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Days (7 Days)</option>
              {daysOfWeek.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Period:</span>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              <option value="all">All Periods (Morning, Afternoon, Evening)</option>
              {periods.map(p => (
                <option key={p} value={p}>{p} Period</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-medium">
          Displaying <strong>{filteredSlots.length}</strong> Time Windows ({filteredSlots.length * 2} Class Sessions)
        </div>
      </div>

      {/* Time Windows Grid with 2 Sessions Each */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSlots.map(slot => {
          const s1Start = slot.session_1_start || slot.start_time;
          const s1End = slot.session_1_end || '09:30:00';
          const bStart = slot.break_start || s1End;
          const bEnd = slot.break_end || slot.session_2_start;
          const s2Start = slot.session_2_start || '09:45:00';
          const s2End = slot.session_2_end || slot.end_time;

          const s1Duration = calculateDurationMinutes(s1Start, s1End) || 90;
          const breakDuration = calculateDurationMinutes(bStart, bEnd) || 10;
          const s2Duration = calculateDurationMinutes(s2Start, s2End) || 90;

          return (
            <div
              key={slot.id}
              className="card-enterprise bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl font-bold border ${
                    slot.period === 'Morning'
                      ? 'bg-blue-50 text-brand-blue border-blue-200'
                      : slot.period === 'Afternoon'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400">WINDOW #{slot.id}</span>
                    <h4 className="text-sm font-bold text-brand-navy">
                      {slot.day_of_week} &bull; {slot.period}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
                    2 Sessions
                  </span>
                </div>
              </div>

              {/* Sessions Table Structure (Exactly As User Specified) */}
              <div className="p-4 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Class Sessions Schedule</span>
                  <span className="font-mono text-slate-500 normal-case">
                    Window: {formatTime12h(s1Start)} – {formatTime12h(s2End)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3 border-r border-slate-200">Session</th>
                        <th className="py-2 px-3 border-r border-slate-200">Start Time</th>
                        <th className="py-2 px-3 border-r border-slate-200">End Time</th>
                        <th className="py-2 px-2 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {/* Session 1 */}
                      <tr className="bg-white hover:bg-slate-50">
                        <td className="py-2 px-3 border-r border-slate-100 font-bold text-brand-navy flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                          <span>Session 1</span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 font-bold text-slate-800">
                          {formatTime12h(s1Start)}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">
                            {formatTime24h(s1Start)}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 font-bold text-slate-800">
                          {formatTime12h(s1End)}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">
                            {formatTime24h(s1End)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-brand-blue">
                          {s1Duration}m
                        </td>
                      </tr>

                      {/* Recess Break */}
                      <tr className="bg-amber-50/50 text-[11px] text-amber-900">
                        <td className="py-1.5 px-3 border-r border-slate-100 font-semibold flex items-center gap-1.5">
                          <Coffee className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Recess Break</span>
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-100 font-mono">
                          {formatTime12h(bStart)}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-100 font-mono">
                          {formatTime12h(bEnd)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-amber-700">
                          {breakDuration}m
                        </td>
                      </tr>

                      {/* Session 2 */}
                      <tr className="bg-white hover:bg-slate-50">
                        <td className="py-2 px-3 border-r border-slate-100 font-bold text-brand-navy flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
                          <span>Session 2</span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 font-bold text-slate-800">
                          {formatTime12h(s2Start)}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">
                            {formatTime24h(s2Start)}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 font-bold text-slate-800">
                          {formatTime12h(s2End)}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">
                            {formatTime24h(s2End)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-purple-700">
                          {s2Duration}m
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <StatusBadge status={slot.is_active ?? true} size="sm" />

                {canManage && (
                  <button
                    onClick={() => handleOpenEdit(slot)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-brand-navy hover:bg-white rounded-lg border border-slate-200 transition-colors font-semibold"
                    title="Configure Session 1 and Session 2 start & end times"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Configure Sessions</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Database Constraint Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-brand-navy flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Database Constraint Enforced:</span>
          Per PostgreSQL database rule `CHECK (NOT (day_of_week IN (6, 7) AND period = 'EVENING'))`, Saturday and Sunday evening operational sessions are strictly prohibited to comply with university operational policy. Each Time Window encapsulates exactly two sessions without requiring redundant database records.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURE TIME WINDOW SESSIONS                                      */}
      {/* ========================================================================= */}
      {editingSlot && (
        <Modal
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          title={`Configure Sessions: ${editingSlot.day_of_week} ${editingSlot.period}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-navy">
                  Configure the start and end times for Session 1, Transition Break, and Session 2.
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  The system automatically calculates session durations and validates that sessions do not overlap.
                </p>
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{validationError}</span>
              </div>
            )}

            {/* Success Alert */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Session timing configuration updated successfully!</span>
              </div>
            )}

            {/* Form Fields: Session 1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-navy flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Class Session 1
                </span>
                <span className="font-bold text-brand-blue text-[11px]">
                  Duration: {s1Mins} Minutes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Start Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={formData.session_1_start}
                    onChange={e => setFormData({ ...formData, session_1_start: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12h: {formatTime12h(formData.session_1_start)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    End Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={formData.session_1_end}
                    onChange={e => {
                      const newEnd = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        session_1_end: newEnd,
                        break_start: newEnd
                      }));
                    }}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12h: {formatTime12h(formData.session_1_end)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields: Recess Break */}
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  Transition Break (Recess)
                </span>
                <span className="font-bold text-amber-800 text-[11px]">
                  Break: {breakMins} Minutes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Break Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.break_start}
                    onChange={e => setFormData({ ...formData, break_start: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12h: {formatTime12h(formData.break_start)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Break End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.break_end}
                    onChange={e => {
                      const newBreakEnd = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        break_end: newBreakEnd,
                        session_2_start: newBreakEnd
                      }));
                    }}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12h: {formatTime12h(formData.break_end)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields: Session 2 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-navy flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  Class Session 2
                </span>
                <span className="font-bold text-purple-700 text-[11px]">
                  Duration: {s2Mins} Minutes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Start Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={formData.session_2_start}
                    onChange={e => setFormData({ ...formData, session_2_start: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12h: {formatTime12h(formData.session_2_start)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    End Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={formData.session_2_end}
                    onChange={e => setFormData({ ...formData, session_2_end: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    12h: {formatTime12h(formData.session_2_end)}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply to All Days Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyToAllPeriod}
                  onChange={e => setApplyToAllPeriod(e.target.checked)}
                  className="rounded text-brand-blue focus:ring-brand-blue mt-0.5"
                />
                <span className="text-slate-700 font-semibold">
                  Apply this template to all active <strong>{editingSlot.period}</strong> Time Windows (Monday – Friday)
                </span>
              </label>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveSuccess}
                className="btn-primary"
              >
                Save Session Configuration
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
