import React from 'react';
import { ScheduleStatus, EmploymentStatus } from '../../types/database';

interface StatusBadgeProps {
  status: ScheduleStatus | EmploymentStatus | 'ACTIVE' | 'INACTIVE' | boolean | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  // Boolean active status
  if (typeof status === 'boolean') {
    return status ? (
      <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    ) : (
      <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400" />
        Inactive
      </span>
    );
  }

  const s = String(status).toUpperCase();

  switch (s) {
    case 'FULLY_APPROVED':
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" />
          Fully Approved
        </span>
      );
    case 'ADMIN_APPROVED':
    case 'PENDING_DEAN_VERIFICATION':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-600" />
          Admin Approved
        </span>
      );
    case 'DEAN_CHECKED':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-600" />
          Dean Checked
        </span>
      );
    case 'PENDING_ADMIN_APPROVAL':
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" />
          Pending Admin Approval
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" />
          Under Review
        </span>
      );
    case 'RETURNED_FOR_REVISION':
      return (
        <span className={`inline-flex items-center rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-orange-500" />
          Returned for Revision
        </span>
      );
    case 'DRAFT':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-400/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400" />
          Draft
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    case 'INACTIVE':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-400/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400" />
          Inactive
        </span>
      );
    case 'ON_LEAVE':
      return (
        <span className={`inline-flex items-center rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-orange-500" />
          On Leave
        </span>
      );
    case 'AVAILABLE':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
          Available
        </span>
      );
    case 'UNAVAILABLE':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 ${sizeClasses}`}>
          Unavailable
        </span>
      );
    case 'PREFERRED':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20 ${sizeClasses}`}>
          Preferred
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {s}
        </span>
      );
  }
};
