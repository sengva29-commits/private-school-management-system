/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Teacher, Class, Invoice, Payment, Receipt, UserRole } from '../types';
import { Users, DollarSign, AlertCircle, FileSpreadsheet, TrendingUp, CreditCard, Shield, Download, RefreshCw, Calendar, MapPin } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  invoices: Invoice[];
  payments: Payment[];
  receipts: Receipt[];
  currentRole: UserRole;
  currentUserName: string;
  currentUserId?: string;
  onNavigate: (tab: string) => void;
  onClearData: () => void;
}

export default function Dashboard({
  students,
  teachers,
  classes,
  invoices,
  payments,
  receipts,
  currentRole,
  currentUserName,
  currentUserId,
  onNavigate,
  onClearData
}: DashboardProps) {
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'phnom_penh' | 'siem_reap'>('all');

  const isTeacher = currentRole === 'teacher';

  // Filter based on teacher assignment if applicable
  const teacherClasses = isTeacher && currentUserId ? classes.filter(c => c.teacherId === currentUserId) : classes;
  const teacherClassIds = teacherClasses.map(c => c.id);

  const teacherStudents = isTeacher && currentUserId
    ? students.filter(s => s.enrolledClasses?.some(cid => teacherClassIds.includes(cid)))
    : students;
  const teacherStudentIds = teacherStudents.map(s => s.id);

  const displayInvoices = isTeacher ? invoices.filter(inv => teacherStudentIds.includes(inv.studentId)) : invoices;
  const displayPayments = isTeacher ? payments.filter(p => teacherStudentIds.includes(p.studentId)) : payments;
  const displayReceipts = isTeacher ? receipts.filter(rc => teacherStudentIds.includes(rc.studentId)) : receipts;

  // Stats Calculations
  const activeStudents = teacherStudents.filter(s => s.status === 'active').length;
  const totalStudents = teacherStudents.length;
  
  // Total fee collected
  const totalCollected = displayPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Total outstanding
  const totalOutstanding = displayInvoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);

  // Growth or Monthly (assume May 2026 collections)
  const currentMonthCollections = displayPayments
    .filter(p => p.paymentDate.startsWith('2026-05'))
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const prevMonthCollections = displayPayments
    .filter(p => p.paymentDate.startsWith('2026-04'))
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Cash vs Bank split
  const cashPayments = displayPayments.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + p.amountPaid, 0);
  const abaPayments = displayPayments.filter(p => p.paymentMethod === 'aba').reduce((sum, p) => sum + p.amountPaid, 0);
  const otherPayments = displayPayments.filter(p => p.paymentMethod !== 'cash' && p.paymentMethod !== 'aba').reduce((sum, p) => sum + p.amountPaid, 0);

  const totalPaymentsAmount = cashPayments + abaPayments + otherPayments || 1;
  const cashPerc = Math.round((cashPayments / totalPaymentsAmount) * 100);
  const abaPerc = Math.round((abaPayments / totalPaymentsAmount) * 100);
  const otherPerc = Math.round((otherPayments / totalPaymentsAmount) * 100);

  // Daily tracker (Today = 2026-05-27 based on system date)
  const todayDate = '2026-05-27';
  const todayCollections = displayPayments
    .filter(p => p.paymentDate === todayDate)
    .reduce((sum, p) => sum + p.amountPaid, 0);
  const todayCount = displayPayments.filter(p => p.paymentDate === todayDate).length;

  // Monthly revenue collection list for SVG Bar Chart
  const monthlyData = [
    { month: 'Feb', amount: 535 },
    { month: 'Mar', amount: 340 },
    { month: 'Apr', amount: 200 },
    { month: 'May (Live)', amount: currentMonthCollections || 50 }
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount), 100);

  return (
    <div className="space-y-4">
      {/* Greetings & Branch Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            ព័ត៌មានទូទៅ • System Overview
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
            សួស្តី, {currentUserName} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ប្រព័ន្ធគ្រប់គ្រងសាលារៀនឯកជន • Private School Management Portal [{currentRole.toUpperCase()}]
          </p>
        </div>

        {/* Super admin extra tools */}
        {currentRole === 'super_admin' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setSelectedBranch('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedBranch === 'all' ? 'bg-white text-brand-600 shadow-xs' : ''}`}
              >
                គ្រប់សាខា (All)
              </button>
              <button
                onClick={() => setSelectedBranch('phnom_penh')}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedBranch === 'phnom_penh' ? 'bg-white text-brand-600 shadow-xs' : ''}`}
              >
                ភ្នំពេញ (PP)
              </button>
              <button
                onClick={() => setSelectedBranch('siem_reap')}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedBranch === 'siem_reap' ? 'bg-white text-brand-600 shadow-xs' : ''}`}
              >
                សៀមរាប (SR)
              </button>
            </div>

            <button
              onClick={() => {
                const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify({ students, teachers, classes, invoices, payments, receipts })
                )}`;
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', jsonString);
                downloadAnchor.setAttribute('download', `school_db_backup_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Backup DB
            </button>

            <button
              onClick={onClearData}
              className="flex items-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset System
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-brand-600 rounded-xl shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">សិស្សសរុប (Total Students)</p>
            <h3 className="text-xl font-bold text-slate-950 mt-1">{activeStudents} / {totalStudents}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              ● {activeStudents} នាក់កំពុងរៀន (Active)
            </p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">ចំណូលសរុប (Total Income)</p>
            <h3 className="text-xl font-bold text-slate-950 mt-1">${totalCollected.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-450 mt-1">
              បង់រួចប្រាក់ដុល្លារទូទាំងសាលា
            </p>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <AlertCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">ប្រាក់ជំពាក់ (Outstanding Debt)</p>
            <h3 className="text-xl font-bold text-slate-950 mt-1">${totalOutstanding.toLocaleString()}</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              តម្រូវការតាមដានការបង់លុយ
            </p>
          </div>
        </div>

        {/* Live Collections Today */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <FileSpreadsheet className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">ចំណូលថ្ងៃនេះ (Today's Receipts)</p>
            <h3 className="text-xl font-bold text-slate-950 mt-1">${todayCollections.toLocaleString()}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              {todayCount} ប្រតិបត្តិការ (Transactions)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts using Plain SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Collection Trend Bar Chart (SVG) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                និន្នាការចំណូលប្រចាំខែ • Revenue Collection Trends
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">គិតជាប្រាក់ដុល្លារ ($ USD) រយៈពេល ៤ ខែចុងក្រោយ</p>
            </div>
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> 2026 Year Overview
            </span>
          </div>

          <div className="h-56 flex items-end justify-between px-4 pt-6 border-b border-slate-100 relative">
            {/* Grid helper lines */}
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-slate-100 pointer-events-none"></div>
            <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-slate-100 pointer-events-none"></div>
            <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-slate-100 pointer-events-none"></div>

            {monthlyData.map((d, index) => {
              const heightPercent = (d.amount / maxAmount) * 80 + 10; // offset
              return (
                <div key={index} className="flex flex-col items-center flex-1 group z-10">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ${d.amount}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-12 sm:w-14 bg-brand-500 hover:bg-amber-500 rounded-t-md transition-all duration-500 shadow-xs group-hover:shadow-md cursor-pointer flex items-end justify-center"
                  >
                    <span className="text-[9px] text-white font-medium mb-1 drop-shadow-xs">${d.amount}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Split Chart (SVG) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-teal-500" />
              ប្រភពនៃការបង់ប្រាក់ • Payment Methods Share
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">ការបំបែកតាមប្រភេទសាច់ប្រាក់ និងធនាគារ</p>
          </div>

          {/* SVG Pie Representation */}
          <div className="flex justify-center my-4">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 32 32">
              {/* Cash share */}
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="transparent"
                stroke="#cbd5e1"
                strokeWidth="4"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="transparent"
                stroke="#d4af37" // gold for cash
                strokeWidth="4"
                strokeDasharray={`${cashPerc} 100`}
              />
              {/* ABA Share */}
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="transparent"
                stroke="#0284c7" // sky-500 for ABA
                strokeWidth="4"
                strokeDasharray={`${abaPerc} 100`}
                strokeDashoffset={`-${cashPerc}`}
              />
              {/* Other Share */}
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="transparent"
                stroke="#14b8a6" // teal-500 for others
                strokeWidth="4"
                strokeDasharray={`${otherPerc} 100`}
                strokeDashoffset={`-${cashPerc + abaPerc}`}
              />
              <circle cx="16" cy="16" r="8" fill="white" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]"></span>
                សាច់ប្រាក់សុទ្ធ (Cash)
              </div>
              <span className="font-bold text-slate-905">${cashPayments} ({cashPerc}%)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                ធនាគារ ABA Bank
              </div>
              <span className="font-bold text-slate-905">${abaPayments} ({abaPerc}%)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                ផ្សេងៗ (ACLEDA / Wing)
              </div>
              <span className="font-bold text-slate-905">${otherPayments} ({otherPerc}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="bg-white p-5 border border-slate-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="font-extrabold text-[10.5px] text-slate-700 tracking-wider uppercase mb-3.5">តំណភ្ជាប់រហ័ស • Quick Actions</h3>
        <div className={`grid gap-3 ${!isTeacher ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
          <button
            onClick={() => onNavigate('students')}
            className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-250 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group shadow-xs"
          >
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Manage Enrolments</span>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-650 block mt-1">បញ្ញាសិស្ស (Students)</span>
          </button>
          
          <button
            onClick={() => onNavigate('billing')}
            className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-250 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group shadow-xs"
          >
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Tuition / Installments</span>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-650 block mt-1 font-sans font-bold">បង់ថ្លៃសិក្សា (Billing)</span>
          </button>
          
          <button
            onClick={() => onNavigate('grades')}
            className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-250 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group shadow-xs"
          >
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Scores & Exam Ranking</span>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-650 block mt-1">បញ្ចូលពិន្ទុ & លំដាប់ថ្នាក់ (Scores)</span>
          </button>
          
          {!isTeacher && (
            <button
              onClick={() => onNavigate('audit')}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-250 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group shadow-xs"
            >
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Logs and Security</span>
              <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-650 block mt-1">សកម្មភាព Audit (Logs)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
