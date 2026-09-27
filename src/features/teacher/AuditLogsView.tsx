import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { AuditLogItem } from "@/lib/portal-types";
import { ShieldCheck, Search, Filter, Activity, Clock } from "lucide-react";

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLogItem[]>(portalStorage.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.actor_label && l.actor_label.toLowerCase().includes(q)) ||
      (l.resource && l.resource.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>Security Audit Trail & Activity Logs</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Immutable audit record of all authentication, student management, test authoring, and examination events
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit logs by action (e.g. login, student_created), actor, or resource..."
          className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Target Resource</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-white font-sans">
                      {log.actor_label || "System"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {log.resource ? `${log.resource}${log.resource_id ? ` (#${log.resource_id.slice(-6)})` : ""}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{log.ip_address || "127.0.0.1"}</td>
                    <td className="px-5 py-3.5 text-slate-400 truncate max-w-xs font-sans">
                      {JSON.stringify(log.meta)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
