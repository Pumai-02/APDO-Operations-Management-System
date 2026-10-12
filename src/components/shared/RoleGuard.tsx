import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { currentRole, switchRole } = useAuth();

  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your current role (<strong className="text-brand-navy font-semibold">{currentRole}</strong>) does not have authorization to view or manage this module.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 mb-6 text-left">
            <span className="font-semibold block text-slate-700 mb-1">Required Permissions:</span>
            One of: {allowedRoles.join(', ')}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            {allowedRoles[0] && (
              <button
                onClick={() => switchRole(allowedRoles[0])}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-navy hover:bg-brand-navyHover rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Switch to {allowedRoles[0]}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
