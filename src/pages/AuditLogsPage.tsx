import React, { useState } from 'react';
import { useOperations } from '../context/OperationsContext';
import { ScheduleChangeLog } from '../types/database';
import { Modal } from '../components/shared/Modal';
import { History, Search, Eye, Filter, ShieldCheck, FileJson, Clock } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { changeLogs, users } = useOperations();
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [inspectedLog, setInspectedLog] = useState<ScheduleChangeLog | null>(null);

  const filteredLogs = changeLogs.filter(log => {
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.change_description.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        String(log.schedule_id).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <History className="w-5 h-5 text-brand-blue" />
            System Activity & Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, read-only operational transaction logs with complete JSON state diff tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Immutability Enforced</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search description, action, ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Action:</span>
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Actions</option>
              <option value="CREATED">CREATED</option>
              <option value="UPDATED">UPDATED</option>
              <option value="STATUS_TRANSITION">STATUS_TRANSITION</option>
              <option value="DELETED">DELETED</option>
              <option value="VALIDATION_EXCEPTION">VALIDATION_EXCEPTION</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500">
          Showing <strong>{filteredLogs.length}</strong> recorded audit events
        </span>
      </div>

      {/* Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Schedule ID</th>
                <th className="px-4 py-3">Actor / User</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Change Description</th>
                <th className="px-4 py-3 text-right">JSON Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map(log => {
                const actor = users.find(u => u.id === log.changed_by);

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      #{log.schedule_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{actor?.name || `User #${log.changed_by}`}</div>
                      <div className="text-[10px] text-slate-400">{actor?.role}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.action === 'CREATED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.action === 'STATUS_TRANSITION' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        log.action === 'DELETED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 max-w-md">
                      {log.change_description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setInspectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-brand-blue hover:bg-blue-50 border border-blue-200 transition-colors"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON DIFF INSPECTOR MODAL */}
      {inspectedLog && (
        <Modal
          isOpen={!!inspectedLog}
          onClose={() => setInspectedLog(null)}
          title={`Audit Event #${inspectedLog.id} State Inspector`}
          description={`Action: ${inspectedLog.action} on Schedule #${inspectedLog.schedule_id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Description:</span>
              <p className="text-slate-600">{inspectedLog.change_description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Previous Values (old_values JSONB):</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64">
                  {inspectedLog.old_values ? JSON.stringify(inspectedLog.old_values, null, 2) : 'null (Initial record creation)'}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">New Values (new_values JSONB):</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64">
                  {inspectedLog.new_values ? JSON.stringify(inspectedLog.new_values, null, 2) : 'null (Record deleted)'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setInspectedLog(null)} className="btn-secondary">
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
