/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Invoice, Receipt, DailyAttendance, StudentMonthlyScore, Class, Subject, Teacher } from '../types';
import { DollarSign, Award, Users, CreditCard, ShieldCheck, Calendar, BookOpen, Clock, Printer, QrCode, ClipboardList, CheckCircle, X } from 'lucide-react';

interface ParentPortalProps {
  students: Student[];
  invoices: Invoice[];
  receipts: Receipt[];
  attendances: DailyAttendance[];
  scores: StudentMonthlyScore[];
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
}

export default function ParentPortal({
  students,
  invoices,
  receipts,
  attendances,
  scores,
  classes,
  subjects,
  teachers
}: ParentPortalProps) {
  // Assume default parent is logged in for student STD0001 (Kong Kimheng)
  const defaultStudentId = 'STD0001';
  const student = students.find(s => s.id === defaultStudentId) || students[0];

  const [activeTab, setActiveTab] = useState<'fees' | 'attendance' | 'grades'>('fees');
  
  // States for printing or paying
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);

  if (!student) {
    return (
      <div className="text-center py-12 p-6">
        <p className="text-slate-400 italic text-xs">សិស្សមិនមានក្នុងប្រព័ន្ធឡើយ។ Student profiles are missing.</p>
      </div>
    );
  }

  // Filter child metrics
  const childInvoices = invoices.filter(i => i.studentId === student.id);
  const childReceipts = receipts.filter(r => r.studentId === student.id);
  const childScores = scores.filter(s => s.studentId === student.id);

  // Compute Outstanding Balance
  const totalOutstanding = childInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  // Calculate Attendance Percentage and session details
  const attendanceSessions = attendances.filter(session =>
    session.records.some(r => r.studentId === student.id)
  );

  const totalSessionsCount = attendanceSessions.length;
  const presentSessionsCount = attendanceSessions.filter(session =>
    session.records.some(r => r.studentId === student.id && r.status === 'present')
  ).length;

  const attendanceRate = totalSessionsCount > 0 
    ? Math.round((presentSessionsCount / totalSessionsCount) * 100) 
    : 100;

  // GPA calculation
  const latestScore = childScores[childScores.length - 1];

  return (
    <div className="space-y-6">
      {/* Welcome banner Parent */}
      <div className="bg-gradient-to-r from-[#03487c] to-brand-600 p-6 md:p-8 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-500 text-slate-950 px-2.5 py-1 rounded-full">
            គណនីអាណាព្យាបាល • Parent Portal Dashboard
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold font-sans">
            ប្រវត្តិសិក្សាសិលាចារឹក៖ {student.khmerName} ({student.englishName})
          </h2>
          <p className="text-xs text-white/80 leading-relaxed font-semibold">
            អាណាព្យាបាលទទួលបន្ទុក៖ {student.parentName} ({student.parentPhone}) <br/>
            អាសយដ្ឋាន៖ {student.address}
          </p>
        </div>

        {/* Child Avatar */}
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs shrink-0 self-start md:self-center">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/60" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 text-white font-black flex items-center justify-center font-mono text-lg border-2 border-white/60 shrink-0">
              {student.englishName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <span className="block text-[10px] text-white/60 uppercase font-mono tracking-wider">Student ID</span>
            <span className="block text-xs font-black font-mono">{student.id}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Outstanding Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">ប្រាក់ជំពាក់សល់ (Active Owed)</span>
            <span className="text-xl font-black text-rose-600 block mt-0.5">${totalOutstanding}</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">ត្រូវបង់ដំណាក់កាលបន្តបន្ទាប់</span>
          </div>
        </div>

        {/* Student Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">អត្រាវត្តមានសិក្សារ (Attendance Rate)</span>
            <span className="text-xl font-black text-emerald-600 block mt-0.5">{attendanceRate}%</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
              សម័យប្រជុំ៖ {presentSessionsCount} / {totalSessionsCount} ថ្ងៃ
            </span>
          </div>
        </div>

        {/* Latest academic grade GPA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">លទ្ធផលសិក្សាចុងក្រោយ (Average Score)</span>
            <span className="text-xl font-black text-indigo-700 block mt-0.5">
              {latestScore ? `${latestScore.averageScore} / 100` : 'រង់ចាំការបញ្ចូល'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
              លំដាប់ Rank៖ {latestScore?.rank ? `លេខ ${latestScore.rank}` : 'សម្រាំង'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation tabs inside parent portal */}
      <div className="flex bg-slate-200/60 p-1 rounded-none text-xs font-bold text-slate-600 w-full sm:max-w-md">
        <button
          onClick={() => setActiveTab('fees')}
          className={`flex-1 py-1.5 rounded-none transition-all cursor-pointer ${activeTab === 'fees' ? 'bg-white text-brand-700' : ''}`}
        >
          ស្ថានភាពហិរញ្ញវត្ថុ (Fees & Receipts)
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-1.5 rounded-none transition-all cursor-pointer ${activeTab === 'attendance' ? 'bg-white text-brand-700' : ''}`}
        >
          អវត្តមានសិក្សា (Attendance History)
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex-1 py-1.5 rounded-none transition-all cursor-pointer ${activeTab === 'grades' ? 'bg-white text-brand-700' : ''}`}
        >
          ព្រឹត្តិបត្រពិន្ទុ (Report Cards)
        </button>
      </div>

      {/* Tabs Dynamic Content panels */}
      <div className="space-y-6">
        {/* ACTIVE Tab: Fees and Invoices */}
        {activeTab === 'fees' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Outstanding invoices checklist */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-50 pb-3 text-xs uppercase tracking-wider">
                  វិក្កយបត្រសិក្សាដែលជំពាក់ (Active Tuition Invoices)
                </h3>

                {childInvoices.length > 0 ? (
                  <div className="space-y-3">
                    {childInvoices.map(inv => {
                      const netVal = inv.totalAmount - inv.discount;
                      return (
                        <div key={inv.id} className="border border-slate-100 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {inv.id}
                              </span>
                              <h4 className="font-extrabold mt-1 text-slate-950 text-sm">{inv.courseName}</h4>
                              <span className="text-[10px] text-slate-400 block font-semibold">ចុះឈ្មោះ៖ {inv.createdAt}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold">ទឹកប្រាក់ជំពាក់ (Owed)</span>
                              <span className="text-base font-black text-rose-500 font-mono">${inv.remainingBalance}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100/60 text-xs">
                            <span className="font-bold text-slate-500">ទឹកប្រាក់សរុបរំលស់៖ ${netVal}</span>
                            {inv.remainingBalance > 0 ? (
                              <button
                                onClick={() => setPayModalInvoice(inv)}
                                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                បង់ប្រាក់ឥឡូវនេះ (Pay ABA/Bank)
                              </button>
                            ) : (
                              <span className="text-xs bg-emerald-550 text-emerald-800 font-bold px-2 py-0.5 rounded">✓ បង់បច្ចុប្បន្នភាពរួច</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">មិនមានវិក្កយបត្រជំពាក់សល់ឡើយ។ No unpaid dues.</p>
                )}
              </div>
            </div>

            {/* Historical Receipts list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-50 pb-2 text-xs uppercase tracking-wider">
                ប្រវត្តិបង់ប្រាក់សរុប (Receipt Archive)
              </h3>

              {childReceipts.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {childReceipts.map(rc => (
                    <div key={rc.id} className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between text-xs transition-all bg-slate-50/50">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-brand-600 block">{rc.id}</span>
                        <span className="font-bold text-slate-800 block mt-0.5 truncate max-w-[150px]">{rc.className}</span>
                        <span className="text-[9px] text-slate-400 block font-medium">{rc.date}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 font-mono block">${rc.amountPaid}</span>
                        <button
                          onClick={() => setSelectedReceipt(rc)}
                          className="text-[10px] text-brand-600 hover:text-brand-800 font-bold flex items-center gap-0.5 mt-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" /> Slip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">មិនទាន់មានប្រវត្តិបង់ប្រាក់នៅឡើយទេ</p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Attendance History list */}
        {activeTab === 'attendance' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-50 pb-3 text-xs uppercase tracking-wider">
              តាមដានប្រវត្តិអវត្តមានសិក្សាប្រចាំខែ (Physical Attendance Logs)
            </h3>

            {attendanceSessions.length > 0 ? (
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs font-semibold text-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-3">កាលបរិច្ឆេទ (Session Date)</th>
                      <th className="p-3">ថ្នាក់សិក្សា (Class Group)</th>
                      <th className="p-3 text-center">ស្ថានភាព (Checking Status)</th>
                      <th className="p-3">សម្គាល់ (Remarks / Excuse)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceSessions.map(session => {
                      const record = session.records.find(r => r.studentId === student.id);
                      if (!record) return null;

                      const statusLabels = {
                        present: { text: 'វត្តមាន (Present)', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        absent: { text: 'អវត្តមាន (Absent)', style: 'bg-rose-50 text-rose-700 border-rose-100' },
                        late: { text: 'យឺតយ៉ាវ (Late)', style: 'bg-amber-50 text-amber-700 border-amber-100' }
                      };

                      const matchedClassItem = classes.find(c => c.id === session.classId);

                      return (
                        <tr key={session.id} className="hover:bg-slate-50/20">
                          <td className="p-3 font-mono font-bold text-slate-500">{session.date}</td>
                          <td className="p-3 font-bold text-slate-800">{matchedClassItem?.name}</td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border inline-block select-none ${statusLabels[record.status].style}`}>
                              {statusLabels[record.status].text}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 italic font-medium">{record.remarks || 'No remarks'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 italic">មិនមានប្រវត្តិវត្តមានសិក្សាកត់ត្រាឡើយ។ No sessions yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Study Grade Cards */}
        {activeTab === 'grades' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-50 pb-3 text-xs uppercase tracking-wider">
              កម្រងប្រវត្តពិន្ទុ និងលំដាប់ថ្នាក់សិក្សា (Child Graded Records)
            </h3>

            {childScores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {childScores.map(sc => {
                  const sClass = classes.find(c => c.id === sc.classId);
                  return (
                    <div key={sc.id} className="border border-slate-150 p-5 rounded-2xl space-y-4 shadow-2xs hover:shadow-xs transition-shadow">
                      <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-950 text-sm">ប្រចាំខែសិក្សា៖ {sc.month}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{sClass?.name} Curriculum</span>
                        </div>

                        {sc.rank && (
                          <span className="text-xs font-black text-[#03487c] bg-[#e0effe] border border-[#0284c7]/40 px-2.5 py-1 rounded-full shrink-0">
                            Rank {sc.rank}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        {sc.scores.map(subSc => {
                          const sSub = subjects.find(s => s.id === subSc.subjectId);
                          return (
                            <div key={subSc.subjectId} className="flex justify-between font-semibold">
                              <span className="text-slate-600">{sSub ? sSub.khmerName : subSc.subjectId}</span>
                              <span className="font-mono font-bold text-slate-800">{subSc.totalScore} / 100</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between border-t border-slate-100 pt-3 text-xs items-center">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium uppercase">GPA (Average)</span>
                          <span className="font-black text-brand-700 font-mono text-sm">{sc.averageScore}</span>
                        </div>

                        {/* Print triggering directly inside child portal */}
                        <button
                          onClick={() => setSelectedReceipt({
                            id: `SLP-${sc.id}`,
                            paymentId: 'MOCK_PAY',
                            invoiceId: 'MOCK_INV',
                            studentId: student.id,
                            studentName: student.khmerName,
                            className: sClass?.name || '',
                            installmentNumber: 1,
                            amountPaid: 0,
                            remainingBalance: 0,
                            collectedBy: 'Auto Printed',
                            date: new Date().toLocaleDateString(),
                            qrVerifyToken: `certificate-${sc.id}-sec001`,
                            isApproved: true
                          })}
                          className="flex items-center gap-1.5 bg-slate-900 border hover:bg-slate-850 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px]"
                        >
                          <Printer className="w-3.5 h-3.5" /> Study Slip
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 italic text-center">មិនទាន់មានព្រឹត្តិបត្រពិន្ទុដែលត្រូវបានរក្សាទុកឡើយ</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAILED RECEIPT VIEW POPUP FOR PRINTING SLIP ARCHIVES */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-8 space-y-5 text-center font-semibold" id="parent-printable-receipt">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">ព្រះរាជាណាចក្រកម្ពុជា • Kingdom of Cambodia</span>
              <h3 className="font-bold text-slate-900 text-base mt-1">ប្រព័ន្ធសាលាអន្តរជាតិ ELITE ACADEMY</h3>
              <div className="w-10 h-0.5 bg-brand-500 mx-auto my-3"></div>
              <h2 className="text-base font-extrabold text-[#03487c] uppercase">វិក្កយបត្រវិក្កយបត្របង់ប្រាក់ • PAYMENT RECEIPT</h2>

              <div className="border-t border-b border-dashed border-slate-200 py-3 text-xs space-y-1.5 text-slate-700 text-left leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-slate-400">លេខគណនីវិក្កយបត្រ (Receipt No)៖</span>
                  <span className="font-bold font-mono text-brand-700">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ឈ្មោះសិស្ស (Student Name)៖</span>
                  <span className="font-extrabold text-slate-800">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ថ្នាក់សិក្សា (Course Class)៖</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">កាលបរិច្ឆេទ (Date)៖</span>
                  <span className="font-bold font-mono text-slate-500 text-[10px]">{selectedReceipt.date}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">បានបង់ប្រាក់ (Amount Paid)</span>
                  <span className="text-xl font-mono font-bold text-emerald-600">${selectedReceipt.amountPaid}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">ប្រាក់នៅសល់ (Owed)</span>
                  <span className="text-sm font-mono font-bold text-rose-500">${selectedReceipt.remainingBalance}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                <svg className="w-10 h-10 text-slate-900" viewBox="0 0 32 32" fill="currentColor">
                  <rect width="32" height="32" fill="white" />
                  <rect x="2" y="2" width="6" height="6" />
                  <rect x="24" y="2" width="6" height="6" />
                  <rect x="2" y="24" width="6" height="6" />
                </svg>
                <div className="text-[10px] text-left text-slate-500 break-all leading-relaxed font-semibold">
                  <span className="block font-bold text-slate-700">🔐 QR Verified Authentic Slip</span>
                  <span className="block font-mono text-[9px] text-slate-400">{selectedReceipt.qrVerifyToken}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 bg-slate-900 border text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                បោះពុម្ព (Print Receipt)
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-xs text-slate-600 rounded-xl cursor-pointer"
              >
                បិទ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED ABA PAY MODAL QR POPUP */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[11px] font-black text-[#0284c7] bg-sky-50 px-3 py-1 rounded border border-sky-100 uppercase tracking-widest font-mono">
                ABA Pay QR Payment
              </span>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-slate-400 font-bold text-xs uppercase block">គណនីបង់ប្រាក់សរុប (Tuition Bill)៖</h4>
              <h3 className="font-extrabold text-slate-900 text-sm block">{payModalInvoice.courseName}</h3>
              <p className="text-slate-400 font-semibold block text-[11px]">Invoice ID No: {payModalInvoice.id}</p>
            </div>

            {/* Simulated ABA QR Code Frame */}
            <div className="bg-[#e0effe]/40 border-2 border-dashed border-[#0284c7]/40 rounded-2xl p-6 max-w-[200px] mx-auto relative group">
              <div className="absolute top-1 left-1.5 text-[8px] font-bold text-[#0284c7] uppercase">Scan to Pay</div>
              <svg className="w-36 h-36 mx-auto text-brand-900 bg-white p-2.5 rounded-xl block border border-slate-100" viewBox="0 0 32 32" fill="currentColor">
                <rect width="32" height="32" fill="white" />
                <rect x="2" y="2" width="8" height="8" />
                <rect x="22" y="2" width="8" height="8" />
                <rect x="2" y="22" width="8" height="8" />
                <circle cx="16" cy="16" r="4" fill="#02a1c7" />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 block font-semibold leading-relaxed">
                បន្ទាប់ពីស្កែនទូទាត់ប្រាក់រួច ប្រព័ន្ធនឹងធ្វើការគណនាបំណុលសល់ និងផ្ញើវិក្កយបត្រស្វ័យប្រវត្តិទៅកាន់ប្រព័ន្ធ Audit Log របស់សាលាភ្លាមៗ។
              </span>
              <span className="text-sm font-extrabold text-brand-850 block font-mono">
                ទឹកប្រាក់៖ ${payModalInvoice.remainingBalance} USD
              </span>
            </div>

            <button
              onClick={() => {
                alert('ការទូទាត់សាកល្បងបានជោគជ័យ! ប្រព័ន្ធបានកត់ត្រាទិន្នន័យ។ ABA payment simulated.');
                setPayModalInvoice(null);
              }}
              className="w-full bg-[#0284c7] hover:bg-[#025da1] text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
            >
              ផ្ទៀងផ្ទាត់ការបង់ (Verify Payment simulation)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
