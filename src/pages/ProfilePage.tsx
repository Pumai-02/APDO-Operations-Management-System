import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { User, ShieldCheck, Mail, Calendar, Key, CheckCircle2, RotateCcw } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, switchRole, allUsers, switchUser } = useAuth();
  const { lecturers } = useOperations();

  const linkedLecturer = lecturers.find(l => l.user_id === currentUser.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy">User Profile & Authorized Scope</h2>
          <p className="text-xs text-slate-500 mt-1">
            Account identity, security credentials, and active permissions.
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="card-enterprise p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-brand-navy text-white font-extrabold flex items-center justify-center text-2xl shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                currentRole === 'DEAN' ? 'bg-blue-100 text-brand-navy' :
                'bg-slate-100 text-slate-800'
              }`}>
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span>Account ID: #{currentUser.id}</span>
              <span>&bull;</span>
              <span>Status: Active</span>
              <span>&bull;</span>
              <span>Verified: {currentUser.email_verified_at ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Roles & Permissions Overview */}
        <div className="py-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Permission Matrix for {currentRole}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Operational Schedules Creation & Inspection</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Timetable Calendar & Availability Viewing</span>
            </div>
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              currentRole === 'ADMIN' || currentRole === 'DEAN'
                ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${currentRole === 'ADMIN' || currentRole === 'DEAN' ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Operational Schedule Review & Approval Authority</span>
            </div>
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              currentRole === 'ADMIN'
                ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${currentRole === 'ADMIN' ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>System Settings, User Management & Audit Logs</span>
            </div>
          </div>
        </div>

        {/* Linked Faculty Profile if exists */}
        {linkedLecturer && (
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Linked Academic Personnel Record
            </h4>
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Lecturer Code:</span>
                <span className="font-mono font-bold text-brand-navy">{linkedLecturer.lecturer_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specialization:</span>
                <span className="font-semibold text-slate-800">{linkedLecturer.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Weekly Quota:</span>
                <span className="font-bold text-slate-800">{linkedLecturer.max_hours_per_week} Hours / Week</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Role Switcher Shortcuts */}
      <div className="card-enterprise p-5 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Demo Session Switcher
        </h4>
        <p className="text-xs text-slate-600 mb-4">
          Quickly test the system from any of the three supported enterprise personas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allUsers.slice(0, 3).map(u => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                currentUser.id === u.id
                  ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-brand-blue hover:bg-blue-50/50'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{u.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  currentUser.id === u.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {u.role}
                </span>
              </div>
              <div className={`text-[10px] mt-1 truncate ${currentUser.id === u.id ? 'text-blue-200' : 'text-slate-400'}`}>
                {u.email}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
