import React from 'react';
import { ConflictSeverity, ResolutionStatus, ConflictType } from '../../types/database';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';

interface ConflictBadgeProps {
  severity?: ConflictSeverity;
  resolutionStatus?: ResolutionStatus;
  type?: ConflictType;
  resolved?: boolean;
}

export const ConflictBadge: React.FC<ConflictBadgeProps> = ({ severity, resolutionStatus, type, resolved }) => {
  if (resolved || resolutionStatus === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Resolved
      </span>
    );
  }

  if (severity) {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-600/30">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Critical Conflict
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Blocking Error
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/30">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Warning
          </span>
        );
    }
  }

  if (type) {
    const formatted = type.replace('_', ' ');
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
        {formatted}
      </span>
    );
  }

  return null;
};
