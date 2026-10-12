import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { SystemSetting } from '../types/database';
import { Modal } from '../components/shared/Modal';
import { Settings, Save, CheckCircle2, ShieldCheck, Database, Sliders, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { systemSettings, updateSystemSetting } = useOperations();

  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [val, setVal] = useState<string>('');
  const [successToast, setSuccessToast] = useState(false);

  const handleOpenEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setVal(setting.setting_value);
  };

  const handleSave = () => {
    if (editingSetting) {
      updateSystemSetting(editingSetting.setting_key, val, currentUser.id);
      setEditingSetting(null);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-blue" />
            System Settings & Operational Policies
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global operational parameters, validation engine rules, and default notification preferences.
          </p>
        </div>

        {successToast && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings saved successfully
          </div>
        )}
      </div>

      {/* Settings Cards List */}
      <div className="space-y-4">
        {systemSettings.map(setting => (
          <div key={setting.id} className="card-enterprise p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-navy px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {setting.setting_key}
                </span>
                <span className="text-[10px] text-slate-400">
                  Updated {new Date(setting.updated_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {setting.description}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 max-w-[200px] truncate">
                {setting.setting_value}
              </div>
              <button
                onClick={() => handleOpenEdit(setting)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Modify
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Database Architectural Notice */}
      <div className="card-enterprise p-5 bg-gradient-to-r from-blue-50/50 to-slate-50 border-blue-200/60">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-brand-blue">
            <Database className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-700">
            <h4 className="font-bold text-brand-navy mb-1">Architecture & API-Ready Model</h4>
            <p className="leading-relaxed text-slate-600">
              Settings and state mutations are automatically logged to the PostgreSQL <code className="font-mono text-brand-blue">schedule_change_logs</code> table. In future integration with the Laravel REST API backend, these keys map directly to Laravel database seeds and config providers.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSetting && (
        <Modal
          isOpen={!!editingSetting}
          onClose={() => setEditingSetting(null)}
          title={`Edit Policy: ${editingSetting.setting_key}`}
          description={editingSetting.description}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Setting Value *</label>
              <input
                type="text"
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setEditingSetting(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary">
                Save Parameter
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
