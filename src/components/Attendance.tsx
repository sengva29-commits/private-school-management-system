/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DailyAttendance, Class, Student, UserRole, AttendanceRecord, Teacher } from '../types';
import { Calendar, CheckCircle2, AlertTriangle, XCircle, Users, Check, Save, Clock, HelpCircle } from 'lucide-react';

interface AttendanceProps {
  attendances: DailyAttendance[];
  classes: Class[];
  students: Student[];
  teachers?: Teacher[];
  currentRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  onSaveAttendance: (newAttendance: DailyAttendance) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function Attendance({
  attendances,
  classes,
  students,
  teachers = [],
  currentRole,
  currentUserId,
  currentUserName,
  onSaveAttendance,
  onLogAction
}: AttendanceProps) {
  const isTeacher = currentRole === 'teacher';
  const displayClasses = isTeacher ? classes.filter(c => c.teacherId === currentUserId) : classes;

  const [selectedClassId, setSelectedClassId] = useState(displayClasses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Current attendance session states
  const [records, setRecords] = useState<Record<string, { status: AttendanceRecord['status']; remarks?: string }>>({});

  const matchedClass = displayClasses.find(c => c.id === selectedClassId);
  const classStudents = matchedClass ? students.filter(s => s.enrolledClasses.includes(matchedClass.id)) : [];

  // Sync selectedClassId if displayClasses changes (e.g. login/role switch)
  React.useEffect(() => {
    if (displayClasses.length > 0 && !displayClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(displayClasses[0]?.id);
    }
  }, [displayClasses, selectedClassId]);

  // Load existing attendance if it is in the state
  const existingAttendance = attendances.find(a => a.classId === selectedClassId && a.date === selectedDate);

  // Initialize records from existing or default to present
  React.useEffect(() => {
    if (existingAttendance) {
      const initial: typeof records = {};
      existingAttendance.records.forEach(r => {
        initial[r.studentId] = { status: r.status, remarks: r.remarks };
      });
      setRecords(initial);
    } else {
      const initial: typeof records = {};
      classStudents.forEach(s => {
        initial[s.id] = { status: 'present', remarks: '' };
      });
      setRecords(initial);
    }
  }, [selectedClassId, selectedDate, existingAttendance, classStudents.length]);

  const autoSave = (updatedRecords: Record<string, { status: AttendanceRecord['status']; remarks?: string }>) => {
    if (!selectedClassId) return;

    const recordsList: AttendanceRecord[] = classStudents.map(student => ({
      studentId: student.id,
      status: updatedRecords[student.id]?.status || 'present',
      remarks: updatedRecords[student.id]?.remarks || ''
    }));

    const attendanceSession: DailyAttendance = {
      id: existingAttendance?.id || `ATD${String(attendances.length + 1).padStart(3, '0')}`,
      classId: selectedClassId,
      date: selectedDate,
      records: recordsList,
      takenById: currentUserId,
      takenByName: currentUserName
    };

    onSaveAttendance(attendanceSession);
    onLogAction('TAKE_ATTENDANCE', `បានកត់វត្តមានសិស្សថ្នាក់ ${matchedClass?.name} សម្រាប់ថ្ងៃទី ${selectedDate} ចំនួនសិស្សសរុប ${classStudents.length} នាក់ (រក្សាទុកស្វ័យប្រវត្ត)`);
  };

  const handleUpdateStatus = (studentId: string, status: AttendanceRecord['status']) => {
    const updated = {
      ...records,
      [studentId]: { ...records[studentId], status }
    };
    setRecords(updated);
    autoSave(updated);
  };

  const handleUpdateRemarks = (studentId: string, remarks: string) => {
    const updated = {
      ...records,
      [studentId]: { ...records[studentId], remarks }
    };
    setRecords(updated);
    autoSave(updated);
  };

  const canTakeAttendance = currentRole === 'teacher';
  const isRestrictedRole = !canTakeAttendance;

  // Statistics summaries
  const totalPresence = classStudents.filter(s => records[s.id]?.status === 'present').length;
  const totalAbsence = classStudents.filter(s => records[s.id]?.status === 'absent').length;
  const totalLate = classStudents.filter(s => records[s.id]?.status === 'late').length;

  const classTeacher = teachers.find(t => t.id === matchedClass?.teacherId);

  return (
    <div className="space-y-4 flex flex-col lg:h-[calc(100vh-100px)]">
      {/* PERFECT STICKY FLOW HEADER FOR FILTERS AND CLASS INFO TAB */}
      <div className="sticky top-0 z-20 bg-slate-50 space-y-4 pb-2 shrink-0">
        {/* Selector board */}
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
          {/* Class Selector */}
          <div className="flex-1">
            <label className="text-[13px] font-semibold text-slate-600 block mb-1">ជ្រើសរើសថ្នាក់ (Select Class)</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none px-3.5 py-2 rounded-lg text-[13px] font-semibold text-slate-700"
            >
              {displayClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex-1">
            <label className="text-[13px] font-semibold text-slate-600 block mb-1">កាលបរិច្ឆេទ (Select Date) *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none px-3.5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-700"
            />
          </div>

          {/* Info indicators */}
          <div className="flex gap-4 px-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0 text-center text-[13px]">
            <div>
              <span className="text-[13px] text-slate-400 block font-medium">វត្តមាន (Present)</span>
              <span className="font-extrabold text-emerald-600 text-[13px]">{totalPresence} នាក់</span>
            </div>
            <div className="border-r border-slate-200"></div>
            <div>
              <span className="text-[13px] text-slate-400 block font-medium">អវត្តមាន (Absent)</span>
              <span className="font-extrabold text-rose-500 text-[13px]">{totalAbsence} នាក់</span>
            </div>
            <div className="border-r border-slate-200"></div>
            <div>
              <span className="text-[13px] text-slate-400 block font-medium">យឺតយ៉ាវ (Late)</span>
              <span className="font-extrabold text-amber-500 text-[13px]">{totalLate} នាក់</span>
            </div>
          </div>
        </div>

        {/* Dynamic header row that STAYS STICKY with the filter block */}
        {classStudents.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-t-md p-4 flex items-center justify-between shadow-3xs">
            <span className="text-[13px] font-bold text-slate-900 flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-500" />
                បញ្ជីវត្តមានសិស្សថ្នាក់ {matchedClass?.name} ({classStudents.length} នាក់)
              </span>
              <span className="text-slate-400 font-medium hidden sm:inline">|</span>
              <span className="text-brand-600 font-bold">គ្រូបង្រៀន៖ {classTeacher ? `${classTeacher.khmerName} (${classTeacher.englishName})` : 'មិនទាន់កំណត់'}</span>
            </span>
          </div>
        )}
      </div>

      {/* SCROLLABLE ATTENDANCE RECORD LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 border-t-0 rounded-b-md shadow-sm">
        {classStudents.length > 0 ? (
          <div className="divide-y divide-slate-100 text-[13px]">
            {classStudents.map(student => {
              const currentAtt = records[student.id] || { status: 'present', remarks: '' };
              return (
                <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40">
                  {/* Photo & Name */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center font-mono text-[15px]">
                        {student.englishName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-[13px]">{student.khmerName}</h4>
                      <span className="text-[13px] font-mono font-bold text-slate-400 block mt-0.5">{student.id} - {student.englishName}</span>
                      <span className="block text-[13px] text-slate-500 font-semibold mt-0.5 whitespace-nowrap">
                        ទូរស័ព្ទអាណាព្យាបាល៖ {student.parentPhone} ({student.parentName})
                      </span>
                    </div>
                  </div>

                  {/* Radio Switch Status - Disable if parent viewer or admin/super_admin */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isRestrictedRole}
                      onClick={() => handleUpdateStatus(student.id, 'present')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-bold cursor-pointer transition-all ${
                        currentAtt.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                          : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      វត្តមាន (Present)
                    </button>

                    <button
                      type="button"
                      disabled={isRestrictedRole}
                      onClick={() => handleUpdateStatus(student.id, 'absent')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-bold cursor-pointer transition-all ${
                        currentAtt.status === 'absent'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                          : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      អវត្តមាន (Absent)
                    </button>

                    <button
                      type="button"
                      disabled={isRestrictedRole}
                      onClick={() => handleUpdateStatus(student.id, 'late')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-bold cursor-pointer transition-all ${
                        currentAtt.status === 'late'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                          : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-amber-550" />
                      យឺតយ៉ាវ (Late)
                    </button>
                  </div>

                  {/* Remarks input field */}
                  <div className="flex-1 max-w-sm">
                    <input
                      type="text"
                      disabled={isRestrictedRole}
                      placeholder="មូលហេតុអវត្តមានច្បាប់ សុខភាព ឬផ្សេងៗ..."
                      value={currentAtt.remarks || ''}
                      onChange={(e) => handleUpdateRemarks(student.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 focus:border-brand-500 focus:bg-white px-3.5 py-1.5 rounded-lg text-[13px] focus:outline-none placeholder:text-slate-400 text-slate-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-100">
            <p className="text-slate-400 italic text-[13px] font-semibold">រកមិនឃើញសិស្សណាម្នាក់ក្នុងថ្នាក់ដែលបានជ្រើសរើសឡើយ</p>
          </div>
        )}
      </div>
    </div>
  );
}
