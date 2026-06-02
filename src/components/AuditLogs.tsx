/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Filter, Server, Laptop, Cpu, Terminal } from 'lucide-react';

interface AuditLogsProps {
  auditLogs: AuditLog[];
}

export default function AuditLogs({ auditLogs }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = [...auditLogs]
    .reverse() // show latest first
    .filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
      return matchesSearch && matchesRole;
    });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">ប្រវត្តិសកម្មភាពសុវត្ថិភាពប្រព័ន្ធ • Security Audit Trails</h2>
        <p className="text-xs text-slate-500 mt-1">ការតាមដានសកម្មភាពអ្នកប្រើប្រាស់ ការចុះឈ្មោះ និងការលុបកែប្រែទិន្នន័យហិរញ្ញវត្ថុ</p>
      </div>

      {/* Filter and stats overview */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-[13.5px] w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមលេខកូដសកម្មភាព សកម្មភាពកែប្រែ ឬឈ្មោះបុគ្គលិក (Search logs...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 focus:border-indigo-550 focus:bg-white focus:outline-none rounded-lg text-[13px] font-medium transition-all"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-550 focus:bg-white focus:outline-none px-3.5 h-11 rounded-lg text-[13px] font-medium text-slate-705 cursor-pointer"
            >
              <option value="all">គ្រប់គ្រឿងតួនាទីទាំងអស់ (All Roles)</option>
              <option value="super_admin">Super Admin</option>
              <option value="school_admin">School Admin</option>
              <option value="teacher">Teacher</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs stack view */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-brand-500" />
            ប្រព័ន្ធកត់ត្រាសកម្មភាព Audit Logs ({filteredLogs.length} Records)
          </span>
          <span className="text-[10px] bg-red-50 text-red-700 font-extrabold px-2.5 py-1 rounded">
            🔐 Secure Audit Trail: Active & Locked
          </span>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-100 text-[13px]">
            {filteredLogs.map((log, index) => {
              const actionColors: Record<string, string> = {
                CREATE_STUDENT: 'text-emerald-700 bg-emerald-50 border border-emerald-100/70',
                CREATE_CLASS: 'text-brand-700 bg-brand-50 border border-brand-100/70',
                COLLECT_PAYMENT: 'text-teal-700 bg-teal-50 border border-teal-100/70',
                VERIFY_PAYMENT: 'text-purple-700 bg-purple-50 border border-purple-100/70',
                TAKE_ATTENDANCE: 'text-sky-700 bg-sky-50 border border-sky-100/70',
                SAVE_GRADES: 'text-amber-700 bg-amber-50 border border-amber-100/70',
                CALCULATE_RANKS: 'text-indigo-700 bg-indigo-50 border border-indigo-100/70',
                CHANGE_STUDENT_STATUS: 'text-rose-700 bg-rose-50 border border-rose-100/70'
              };

              const defaultColorClass = 'text-slate-600 bg-slate-50 border border-slate-100';

              return (
                <div key={`${log.id}-${index}`} className="p-5 hover:bg-slate-50/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 font-medium text-slate-700">
                  {/* Left row: Details and user */}
                  <div className="space-y-2 flex-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${actionColors[log.action] || defaultColorClass}`}>
                        {log.action}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[13px] text-slate-900 font-bold">Actor: {log.userName}</span>
                    </div>

                    <p className="text-[13px] text-slate-800 leading-relaxed bg-slate-50/60 p-3 rounded-lg border-l-3 border-l-indigo-500 border border-slate-100/80 font-medium">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-4 text-[11.5px] text-slate-450 font-medium font-sans">
                      <span>Log Ref: {log.id}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Server className="w-3.5 h-3.5 text-slate-300" />
                        IP: {log.ipAddress}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Laptop className="w-3.5 h-3.5 text-slate-300" />
                        Device: {log.device}
                      </span>
                    </div>
                  </div>

                  {/* Right row: Time stamp */}
                  <span className="text-[12px] font-mono font-medium text-slate-400 shrink-0 select-none pt-1">
                    {log.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 italic text-xs">រកមិនឃើញសកម្មភាពដែលស្វែងរកទេ</p>
          </div>
        )}
      </div>
    </div>
  );
}
