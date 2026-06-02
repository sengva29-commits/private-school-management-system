/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Class, Teacher, Subject, Student, UserRole } from '../types';
import { Calendar, Users, Home, BookOpen, Plus, User, Clock, Trash2, X, ChevronRight, Award, GraduationCap, Pencil } from 'lucide-react';

interface ClassesProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  students: Student[];
  currentRole: UserRole;
  onAddClass: (newClass: Class) => void;
  onUpdateClass: (updatedClass: Class) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function Classes({
  classes,
  teachers,
  subjects,
  students,
  currentRole,
  onAddClass,
  onUpdateClass,
  onLogAction
}: ClassesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState('08:00 AM - 10:00 AM');
  const [room, setRoom] = useState('');
  const [fee, setFee] = useState(150);

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [editScheduleDays, setEditScheduleDays] = useState<string[]>([]);
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editFee, setEditFee] = useState(150);

  // Filter class detail state
  const [activeClassId, setActiveClassId] = useState<string | null>(classes[0]?.id || null);

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysKhmerMap: { [key: string]: string } = {
    'Mon': 'ចន្ទ',
    'Tue': 'អង្គារ',
    'Wed': 'ពុធ',
    'Thu': 'ព្រហស្បតិ៍',
    'Fri': 'សុក្រ',
    'Sat': 'សៅរ៍',
    'Sun': 'អាទិត្យ'
  };

  const checkScheduleConflicts = (
    classId: string | null,
    className: string,
    teacherId: string,
    classSubjects: string[],
    schedDays: string[],
    schedTime: string,
    roomName: string
  ): boolean => {
    const parseTime = (timeStr: string) => {
      try {
        const parts = timeStr.split('-');
        if (parts.length !== 2) return null;
        
        const parsePart = (p: string) => {
          const clean = p.trim().toUpperCase();
          const match = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
          if (!match) return 0;
          let hrs = parseInt(match[1], 10);
          const mins = parseInt(match[2], 10);
          const ampm = match[3];
          if (ampm === 'PM' && hrs < 12) hrs += 12;
          if (ampm === 'AM' && hrs === 12) hrs = 0;
          return hrs * 60 + mins;
        };
        
        const start = parsePart(parts[0]);
        const end = parsePart(parts[1]);
        return { start, end };
      } catch {
        return null;
      }
    };

    const isTimeOverlap = (timeStr1: string, timeStr2: string) => {
      const t1 = parseTime(timeStr1);
      const t2 = parseTime(timeStr2);
      if (!t1 || !t2) return false;
      return t1.start < t2.end && t2.start < t1.end;
    };

    for (const other of classes) {
      if (classId && other.id === classId) continue;

      const hasSharedDays = schedDays.some(d => other.scheduleDays.includes(d));
      if (!hasSharedDays) continue;

      const hasOverlap = isTimeOverlap(schedTime, other.scheduleTime);
      if (!hasOverlap) continue;

      // Teacher overlapping
      if (other.teacherId === teacherId) {
        const teacher = teachers.find(t => t.id === teacherId);
        const tName = teacher ? `${teacher.khmerName} (${teacher.englishName})` : '';
        alert(`❌ ស្ទួនម៉ោងបង្រៀនរបស់គ្រូ៖ លោកគ្រូ/អ្នកគ្រូ ${tName} មានម៉ោងបង្រៀនជាន់គ្នាជាមួយថ្នាក់ "${other.name}" (${other.id}) ! (Teacher Schedule Conflict)`);
        return false;
      }

      // Room overlapping
      if (other.room.trim().toLowerCase() === roomName.trim().toLowerCase()) {
        alert(`❌ ស្ទួនបន្ទប់សិក្សា៖ បន្ទប់ "${roomName}" ត្រូវបានប្រើប្រាស់ដោយថ្នាក់ "${other.name}" (${other.id}) ក្នុងពេលតែមួយរួចហើយ! (Room Schedule Conflict)`);
        return false;
      }

      // Student overlapping
      if (classId) {
        const otherClassStudents = students.filter(s => s.enrolledClasses.includes(other.id));
        const currentClassStudents = students.filter(s => s.enrolledClasses.includes(classId));
        const overlappingStudents = currentClassStudents.filter(s1 => otherClassStudents.some(s2 => s2.id === s1.id));
        
        if (overlappingStudents.length > 0) {
          const sName = overlappingStudents[0].englishName;
          alert(`❌ ស្ទួនម៉ោងសិក្សាសិស្ស៖ សិស្ស "${sName}" និងសិស្ស ${overlappingStudents.length - 1 > 0 ? `ផ្សេងទៀត ${overlappingStudents.length - 1} នាក់` : ''} ត្រូវបានចុះឈ្មោះក្នុងថ្នាក់ "${other.name}" រួចហើយ ដែលនាំឱ្យជាន់ម៉ោងរៀនគ្នា! (Student Schedule Conflict)`);
          return false;
        }
      }
    }
    return true;
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedTeacherId || selectedSubjects.length === 0 || scheduleDays.length === 0 || !room) {
      alert('សូមបំពេញព័ត៌មានដែលខ្វះខាត! Please fill in all required fields.');
      return;
    }

    const isConflictFree = checkScheduleConflicts(
      null,
      name,
      selectedTeacherId,
      selectedSubjects,
      scheduleDays,
      scheduleTime,
      room
    );
    if (!isConflictFree) return;

    const nextIdVal = classes.length + 1;
    const newId = `CLS${String(nextIdVal).padStart(3, '0')}`;

    const newClass: Class = {
      id: newId,
      name,
      subjects: selectedSubjects,
      scheduleDays,
      scheduleTime,
      room,
      teacherId: selectedTeacherId,
      fee: Number(fee)
    };

    onAddClass(newClass);
    onLogAction('CREATE_CLASS', `បានជោគជ័យក្នុងការបង្កើតលំហរថ្នាក់ថ្មី៖ ${name} (${newId}) ថ្លៃសិក្សា $${fee}`);

    // Reset Form
    setName('');
    setSelectedTeacherId('');
    setSelectedSubjects([]);
    setScheduleDays([]);
    setScheduleTime('08:00 AM - 10:00 AM');
    setRoom('');
    setFee(150);
    setIsAddOpen(false);
  };

  const handleStartEdit = () => {
    const actClass = classes.find(c => c.id === activeClassId);
    if (!actClass) return;
    setEditName(actClass.name);
    setEditTeacherId(actClass.teacherId || teachers[0]?.id || '');
    setEditSubjects(actClass.subjects || []);
    setEditScheduleDays(actClass.scheduleDays || []);
    setEditScheduleTime(actClass.scheduleTime || '');
    setEditRoom(actClass.room || '');
    setEditFee(actClass.fee || 150);
    setIsEditOpen(true);
  };

  const handleUpdateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actClass = classes.find(c => c.id === activeClassId);
    if (!actClass) return;
    if (!editName || !editTeacherId || editSubjects.length === 0 || editScheduleDays.length === 0 || !editRoom) {
      alert('សូមបំពេញព័ត៌មានដែលខ្វះខាត! Please fill in all required fields.');
      return;
    }

    const isConflictFree = checkScheduleConflicts(
      actClass.id,
      editName,
      editTeacherId,
      editSubjects,
      editScheduleDays,
      editScheduleTime,
      editRoom
    );
    if (!isConflictFree) return;

    const updatedClass: Class = {
      ...actClass,
      name: editName,
      teacherId: editTeacherId,
      subjects: editSubjects,
      scheduleDays: editScheduleDays,
      scheduleTime: editScheduleTime,
      room: editRoom,
      fee: Number(editFee)
    };

    onUpdateClass(updatedClass);
    onLogAction('UPDATE_CLASS', `បានជោគជ័យក្នុងការកែសម្រួលព័ត៌មានថ្នាក់សិក្សា៖ ${editName} (${actClass.id})`);
    setIsEditOpen(false);
  };


  const activeClass = classes.find(c => c.id === activeClassId);
  const classStudents = activeClass ? students.filter(s => s.enrolledClasses.includes(activeClass.id)) : [];
  const activeClassTeacher = activeClass ? teachers.find(t => t.id === activeClass.teacherId) : null;

  return (
    <div className="space-y-3 font-sans">
      {/* Class List & Details Split Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        {/* Classes Side List */}
        <div className="bg-transparent p-0 flex flex-col lg:sticky lg:top-3 lg:h-[calc(100vh-100px)]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="font-extrabold text-[13px] uppercase tracking-wider text-slate-500">
                បញ្ជីថ្នាក់រៀន (Class Registry)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {classes.length} ថ្នាក់
              </span>
              {['super_admin', 'school_admin'].includes(currentRole) && (
                <button
                  onClick={() => {
                    setSelectedTeacherId(teachers[0]?.id || '');
                    setIsAddOpen(true);
                  }}
                  className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-98 border-none"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  បង្កើតថ្នាក់ថ្មី
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 mt-3 relative min-h-0 bg-transparent">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="sticky top-0 bg-slate-100 z-20 shadow-3xs">
                <tr className="bg-slate-150 text-slate-600 font-bold border-b border-slate-200/50 text-[12px]">
                  <th className="p-2.5">ថ្នាក់សិក្សា (Class)</th>
                  <th className="p-2.5 text-center">កាលវិភាគ (Schedule)</th>
                  <th className="p-2.5 text-center">សិស្ស (Enrolled)</th>
                  <th className="p-2.5 text-right">តម្លៃ (Fee)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {classes.map(cls => {
                  const totalEnrolled = students.filter(s => s.enrolledClasses.includes(cls.id)).length;
                  const isActive = activeClassId === cls.id;
                  const classTeacher = teachers.find(t => t.id === cls.teacherId);
                  return (
                    <tr
                      key={cls.id}
                      onClick={() => setActiveClassId(cls.id)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white font-extrabold shadow-3xs'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <td className="p-2.5 font-bold">
                        <span className={`text-[12px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-brand-700/80 text-white border border-brand-500' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {cls.id}
                        </span>
                        <div className={`mt-1 font-extrabold text-[13px] limit-rows truncate max-w-[120px] ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {cls.name}
                        </div>
                        <div className={`mt-0.5 text-[11px] font-semibold ${isActive ? 'text-brand-100' : 'text-slate-500'} truncate max-w-[120px]`}>
                          គ្រូ៖ {classTeacher ? classTeacher.khmerName : 'គ្មានគ្រូ'}
                        </div>
                      </td>
                      <td className="p-2.5 text-center leading-tight scale-90">
                        <div className={`font-mono font-bold text-[11px] ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {cls.scheduleTime}
                        </div>
                        <div className={`text-[10px] font-bold mt-1 ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                          {cls.scheduleDays.map(d => daysKhmerMap[d] || d).join(', ')}
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded border ${
                          isActive ? 'bg-amber-400 text-slate-950 border-amber-500 font-black' : 'bg-blue-50 text-indigo-700 border-blue-150'
                        }`}>
                          {totalEnrolled} នាក់
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-black text-[13px]">
                        ${cls.fee}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Class Details Board */}
        <div className="lg:col-span-2 flex flex-col lg:h-[calc(100vh-100px)] gap-3 lg:sticky lg:top-3">
          {activeClass ? (
            <>
              {/* Core attributes cards - COMPACT DESIGN ONLY TAKE 190px HEIGHT */}
              <div className="bg-white p-3 md:p-3.5 rounded-lg border border-slate-100 shadow-sm space-y-2.5 shrink-0">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div>
                    <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5">
                      <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-mono text-xs border border-brand-200">
                        {activeClass.id}
                      </span>
                      {activeClass.name}
                    </h3>
                  </div>
                  {['super_admin', 'school_admin'].includes(currentRole) && (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-98 shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-950" />
                      កែប្រែ
                    </button>
                  )}
                </div>

                {/* Dashboard Grid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Classroom Details Card */}
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded shrink-0">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-slate-500 font-bold block uppercase tracking-wide">បន្ទប់សិក្សា (Room)</span>
                      <span className="text-[12.5px] font-black text-slate-850">
                        {activeClass.room}
                      </span>
                    </div>
                  </div>

                  {/* Main Teacher Card */}
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 text-amber-700 rounded shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-slate-500 font-bold block uppercase tracking-wide">គ្រូបង្រៀន (Teacher)</span>
                      <span className="text-[12.5px] font-black text-slate-850 truncate block" title={activeClassTeacher ? activeClassTeacher.khmerName : 'មិនទាន់មានគ្រូ'}>
                        {activeClassTeacher ? activeClassTeacher.khmerName : 'មិនទាន់មានគ្រូ'}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Session card */}
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex items-center gap-2">
                    <div className="p-1.5 bg-sky-50 text-sky-700 rounded shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-slate-500 font-bold block uppercase tracking-wide">ម៉ោងសិក្សា (Time Slot)</span>
                      <span className="text-[11px] font-mono font-bold text-slate-850 truncate block text-nowrap">
                        {activeClass.scheduleTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VISUAL WEEKLY SCHEDULE GRID - COMPACT INLINE BAR */}
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-[10.5px] text-slate-500 font-extrabold uppercase block tracking-wider">
                      កាលវិភាគសិក្សា ({activeClass.scheduleDays.length} ថ្ងៃ)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {daysList.map(day => {
                      const isActive = activeClass.scheduleDays.includes(day);
                      return (
                        <div
                          key={day}
                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold border text-center ${
                            isActive
                              ? 'bg-brand-600 text-white border-brand-500 shadow-3xs'
                              : 'bg-white text-slate-300 border-slate-200'
                          }`}
                        >
                          {daysKhmerMap[day] || day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-modules/Subjects tag list - COMPACTED BADGES INLINE */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-[10.5px] text-slate-500 uppercase shrink-0 mr-1.5">
                    មុខវិជ្ជាសិក្សាបង្គោល៖
                  </span>
                  {activeClass.subjects.map(subId => {
                    const maybeSub = subjects.find(s => s.id === subId);
                    return (
                      <span
                        key={subId}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50/50 text-indigo-950 px-2 py-0.5 border border-indigo-150/40 rounded-sm"
                      >
                        <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="font-black text-slate-850">
                          {maybeSub ? maybeSub.khmerName : subId}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Roster list of student registered in this selected Class - TAKING REMAINING HEIGHT AND SCROLLS INTERNALLY WITH FROZEN HEADERS */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                  <h4 className="font-black text-slate-900 text-[13.5px] flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-indigo-500" />
                    បញ្ជីសិស្សកំពុងសិក្សាក្នុងថ្នាក់នេះ (Student Class Roster • {classStudents.length} នាក់)
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">
                    ផ្លូវការ (Official)
                  </span>
                </div>

                {classStudents.length > 0 ? (
                  <div className="border border-slate-100 rounded-lg overflow-y-auto shadow-xs flex-1 mt-2.5 relative">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead className="sticky top-0 bg-slate-50 z-20 shadow-xs">
                        <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                          <th className="p-3">សិស្ស (Student)</th>
                          <th className="p-3 text-center">ភេទ (Gender)</th>
                          <th className="p-3">អាណាព្យាបាល (Guardian)</th>
                          <th className="p-3 text-center">ស្ថានភាព (Status)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {classStudents.map(student => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-bold text-slate-800 flex items-center gap-3">
                              {student.photoUrl ? (
                                <img src={student.photoUrl} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center font-mono text-[13px]">
                                  {student.englishName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="block text-slate-900 font-black">{student.khmerName}</span>
                                <span className="block text-[11px] text-slate-400 font-mono font-normal">{student.id} / {student.englishName}</span>
                              </div>
                            </td>
                            <td className="p-3 text-slate-700 text-center font-bold">
                              {student.gender === 'M' ? (
                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-xs">ប្រុស</span>
                              ) : (
                                <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 text-xs">ស្រី</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-600 font-medium leading-normal">
                              <span className="text-slate-900 font-semibold block">{student.parentName}</span>
                              <span className="text-[11.5px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" /> {student.parentPhone}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded inline-block select-none border ${
                                student.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : 'bg-amber-50 text-amber-500 border-amber-100'
                              }`}>
                                {student.status === 'active' ? 'កំពុងរៀន' : student.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-55 rounded-lg border border-dashed border-slate-200 space-y-2 mt-2.5">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-[13px] text-slate-400 italic font-semibold">មិនទាន់មានសិស្សចុះឈ្មោះចូលរៀនថ្នាក់នេះនៅឡើយទេ</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-100 shadow-xs space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-400 italic text-[13px] font-semibold">សូមជ្រើសរើសថ្នាក់ណាមួយដើម្បីមើលព័ត៌មានលម្អិត</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Class Popup Form */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col justify-between border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-[16px]">បង្កើតថ្នាក់សិក្សាថ្មី • Add New Educational Class</h3>
                <p className="text-[13px] text-slate-500 mt-1 font-medium">កំណត់មុខវិជ្ជា និងគ្រូបង្រៀនទទួលបន្ទុក</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                id="close-add-class-form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class Name */}
                <div className="sm:col-span-2">
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ឈ្មោះថ្នាក់សិក្សា (Class Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. Grade 7B, English Elementary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all bg-slate-50/50"
                  />
                </div>

                {/* Main Teacher */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">គ្រូទទួលបន្ទុកថ្នាក់ (Class Teacher Coordinator) *</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none px-4 py-2.5 rounded-lg text-[13px] font-medium text-slate-800 transition-all cursor-pointer"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.khmerName} ({t.englishName})</option>
                    ))}
                  </select>
                </div>

                {/* Class tuition Fee */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ថ្លៃសិក្សាដុល្លារ ($ Program Fee) *</label>
                  <input
                    type="number"
                    required
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>

                {/* Time frame slot */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ម៉ោងសិក្សា (Class Time Slot) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 08:00 AM - 10:00 AM"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>

                {/* Classroom identifier */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">បន្ទប់សិក្សា (Room No / Lab) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. Room 205"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block mb-1">ថ្ងៃសិក្សា (Schedule Days) *</label>
                <div className="flex flex-wrap gap-2">
                  {daysList.map(dy => {
                    const active = scheduleDays.includes(dy);
                    return (
                      <button
                        key={dy}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setScheduleDays(scheduleDays.filter(d => d !== dy));
                          } else {
                            setScheduleDays([...scheduleDays, dy]);
                          }
                        }}
                        className={`px-3.5 py-2.5 text-[13px] font-bold border rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 min-w-[54px] ${
                          active
                            ? 'bg-slate-900 text-amber-400 border-slate-950 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span>{daysKhmerMap[dy] || dy}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects mapped */}
              <div className="space-y-2.5">
                <label className="text-[13px] font-bold text-slate-700 block mb-1">មុខវិជ្ជាបញ្ចូលក្នុងថ្នាក់ (Curriculum Subjects) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {subjects.map(sub => {
                    const checked = selectedSubjects.includes(sub.id);
                    return (
                      <label key={sub.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-[13px] font-bold transition-all ${
                        checked ? 'border-brand-400 bg-brand-50/30' : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects([...selectedSubjects, sub.id]);
                            } else {
                              setSelectedSubjects(selectedSubjects.filter(i => i !== sub.id));
                            }
                          }}
                          className="rounded text-brand-600 focus:ring-brand-500 w-4.5 h-4.5 border-slate-300 cursor-pointer"
                        />
                        <span className="truncate">{sub.khmerName} ({sub.name})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-101 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4.5 py-2.5 text-[13px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="submit"
                onClick={handleAddClass}
                className="px-6 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md cursor-pointer transition-all active:scale-98"
              >
                បង្កើតថ្នាក់រៀនថ្មី (Create Class Card)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Popup Form */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col justify-between border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-[16px]">កែសម្រួលព័ត៌មានថ្នាក់សិក្សា • Edit Class Details</h3>
                <p className="text-[13px] text-slate-500 mt-1 font-medium">កែសម្រួលម៉ោងសិក្សា បន្ទប់សិក្សា គ្រូទទួលបន្ទុក និងមុខវិជ្ជា</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                id="close-edit-class-form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClassSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class Name */}
                <div className="sm:col-span-2">
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ឈ្មោះថ្នាក់សិក្សា (Class Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. Grade 7B, English Elementary"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all bg-slate-50/50"
                  />
                </div>

                {/* Main Teacher */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">គ្រូទទួលបន្ទុកថ្នាក់ (Class Teacher Coordinator) *</label>
                  <select
                    value={editTeacherId}
                    onChange={(e) => setEditTeacherId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none px-4 py-2.5 rounded-lg text-[13px] font-medium text-slate-800 transition-all cursor-pointer"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.khmerName} ({t.englishName})</option>
                    ))}
                  </select>
                </div>

                {/* Class tuition Fee */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ថ្លៃសិក្សាដុល្លារ ($ Program Fee) *</label>
                  <input
                    type="number"
                    required
                    value={editFee}
                    onChange={(e) => setEditFee(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>

                {/* Time frame slot */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ម៉ោងសិក្សា (Class Time Slot) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 08:00 AM - 10:00 AM"
                    value={editScheduleTime}
                    onChange={(e) => setEditScheduleTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>

                {/* Classroom identifier */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1.5">បន្ទប់សិក្សា (Room No / Lab) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. Room 205"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block mb-1">ថ្ងៃសិក្សា (Schedule Days) *</label>
                <div className="flex flex-wrap gap-2">
                  {daysList.map(dy => {
                    const active = editScheduleDays.includes(dy);
                    return (
                      <button
                        key={dy}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setEditScheduleDays(editScheduleDays.filter(d => d !== dy));
                          } else {
                            setEditScheduleDays([...editScheduleDays, dy]);
                          }
                        }}
                        className={`px-3.5 py-2.5 text-[13px] font-bold border rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 min-w-[54px] ${
                          active
                            ? 'bg-slate-900 text-amber-400 border-slate-950 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span>{daysKhmerMap[dy] || dy}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects mapped */}
              <div className="space-y-2.5">
                <label className="text-[13px] font-bold text-slate-700 block mb-1">មុខវិជ្ជាបញ្ចូលក្នុងថ្នាក់ (Curriculum Subjects) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {subjects.map(sub => {
                    const checked = editSubjects.includes(sub.id);
                    return (
                      <label key={sub.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-[13px] font-bold transition-all ${
                        checked ? 'border-brand-400 bg-brand-50/30' : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSubjects([...editSubjects, sub.id]);
                            } else {
                              setEditSubjects(editSubjects.filter(i => i !== sub.id));
                            }
                          }}
                          className="rounded text-brand-600 focus:ring-brand-500 w-4.5 h-4.5 border-slate-300 cursor-pointer"
                        />
                        <span className="truncate">{sub.khmerName} ({sub.name})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-101 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4.5 py-2.5 text-[13px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="submit"
                onClick={handleUpdateClassSubmit}
                className="px-6 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md cursor-pointer transition-all active:scale-98"
              >
                រក្សាទុកការផ្លាស់ប្តូរ (Save Changes)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
