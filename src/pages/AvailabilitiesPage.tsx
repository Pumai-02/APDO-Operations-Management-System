import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { CalendarDays, Building2, UserCheck, CheckCircle2, XCircle, Star, Save } from 'lucide-react';

export const AvailabilitiesPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { lecturers, branches, timeSlots, lecturerAvailabilities, updateLecturerAvailability } = useOperations();

  // If user is Lecturer, default to their profile; else first lecturer
  const myLecturer = lecturers.find(l => l.user_id === currentUser.id);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(
    myLecturer ? myLecturer.id : (lecturers[0]?.id || '1')
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>('1');
  const [saveToast, setSaveToast] = useState(false);

  const selectedLecturer = lecturers.find(l => l.id === selectedLecturerId);
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const periods = ['Morning', 'Afternoon', 'Evening'];

  const getSlotAvailability = (day: string, period: string) => {
    const slot = timeSlots.find(t => t.day_of_week === day && t.period === period);
    if (!slot) return null;

    const record = lecturerAvailabilities.find(
      a => a.lecturer_id === selectedLecturerId &&
           a.branch_id === selectedBranchId &&
           a.time_slot_id === slot.id
    );

    return {
      slot,
      record,
      status: record ? (record.availability_status || (record.is_available ? 'AVAILABLE' : 'UNAVAILABLE')) : 'AVAILABLE'
    };
  };

  const handleToggleSlot = (day: string, period: string) => {
    const info = getSlotAvailability(day, period);
    if (!info) return;

    // Cycle: AVAILABLE -> PREFERRED -> UNAVAILABLE -> AVAILABLE
    let nextStatus: 'AVAILABLE' | 'PREFERRED' | 'UNAVAILABLE' = 'PREFERRED';
    if (info.status === 'AVAILABLE') nextStatus = 'PREFERRED';
    else if (info.status === 'PREFERRED') nextStatus = 'UNAVAILABLE';
    else if (info.status === 'UNAVAILABLE') nextStatus = 'AVAILABLE';

    updateLecturerAvailability({
      lecturer_id: selectedLecturerId,
      branch_id: selectedBranchId,
      time_slot_id: info.slot.id,
      is_available: nextStatus !== 'UNAVAILABLE',
      availability_status: nextStatus,
      note: nextStatus === 'UNAVAILABLE' ? 'Unavailable for allocation' : nextStatus === 'PREFERRED' ? 'Preferred slot' : '',
      confirmed_by_user_id: currentUser.id,
      confirmed_at: new Date().toISOString()
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-blue" />
            Faculty Availability Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Specify branch-specific availability windows, preferred teaching periods, and blackout times.
          </p>
        </div>

        {saveToast && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Availability state saved
          </div>
        )}
      </div>

      {/* Target Selector Toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
        <div className="flex flex-wrap items-center gap-4">
          {/* Lecturer Selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              Faculty Member:
            </span>
            <select
              value={selectedLecturerId}
              onChange={e => setSelectedLecturerId(e.target.value)}
              disabled={currentRole === 'LECTURER' && !!myLecturer}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              {lecturers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.lecturer_code}) - {l.employment_status}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Campus Branch:
            </span>
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Preferred</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* Interactive Matrix Grid */}
      <div className="card-enterprise p-5 overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-8 gap-3 pb-3 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase text-center">
            <div className="py-2 bg-slate-100 rounded-lg">Time Period</div>
            {daysOfWeek.map(d => (
              <div key={d} className="py-2 bg-slate-100 rounded-lg">{d}</div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {periods.map(period => (
              <div key={period} className="grid grid-cols-8 gap-3 py-3 items-stretch">
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-3 text-center border border-slate-200/60">
                  <span className="font-bold text-xs text-brand-navy">{period}</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {period === 'Morning' ? '08:00 - 11:30' : period === 'Afternoon' ? '13:00 - 16:30' : '17:30 - 20:30'}
                  </span>
                </div>

                {daysOfWeek.map(day => {
                  const isWeekendEvening = (day === 'Saturday' || day === 'Sunday') && period === 'Evening';
                  const info = getSlotAvailability(day, period);

                  if (isWeekendEvening) {
                    return (
                      <div
                        key={day}
                        className="p-3 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60"
                      >
                        <span className="text-[10px] text-slate-400 font-semibold">Prohibited</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Weekend Evening</span>
                      </div>
                    );
                  }

                  const status = info?.status || 'AVAILABLE';

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleSlot(day, period)}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 hover:shadow-xs cursor-pointer ${
                        status === 'PREFERRED'
                          ? 'bg-purple-50/90 border-purple-200 text-purple-900 hover:bg-purple-100'
                          : status === 'UNAVAILABLE'
                          ? 'bg-rose-50/90 border-rose-200 text-rose-900 hover:bg-rose-100'
                          : 'bg-emerald-50/90 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      {status === 'PREFERRED' && (
                        <>
                          <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                          <span className="text-xs font-bold">Preferred</span>
                        </>
                      )}
                      {status === 'UNAVAILABLE' && (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span className="text-xs font-bold">Unavailable</span>
                        </>
                      )}
                      {status === 'AVAILABLE' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold">Available</span>
                        </>
                      )}

                      <span className="text-[9px] opacity-75 font-medium">Click to cycle</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="card-enterprise p-4 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-800">Operational Guideline:</span> Changes to availability matrix are synchronized in real-time with the Conflict Detection Engine. Any schedule conflict involving an updated blackout slot will be flagged immediately.
        </div>
      </div>
    </div>
  );
};
