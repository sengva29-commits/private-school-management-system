/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Teacher, Class, Subject, Receipt, UserRole } from '../types';
import { Phone, Award, DollarSign, ListOrdered, Calendar, User, Eye, Plus, ShieldCheck, X, Pencil, Trash2, Key, AlertTriangle } from 'lucide-react';
import { getTeacherPasscode } from '../utils';
import ImageUploader from './ImageUploader';

interface TeachersProps {
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  receipts: Receipt[];
  currentRole: UserRole;
  onAddTeacher: (newTeacher: Teacher) => void;
  onUpdateTeacher: (updatedTeacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onUpdateClass?: (updatedClass: Class) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function Teachers({
  teachers,
  classes,
  subjects,
  receipts,
  currentRole,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onUpdateClass,
  onLogAction
}: TeachersProps) {
  // Toggle states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Custom states for class assignments edit & beautiful confirmation popup
  const [classToAssignId, setClassToAssignId] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Add state inputs
  const [khmerName, setKhmerName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState(350);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');

  // Edit state inputs
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editKhmerName, setEditKhmerName] = useState('');
  const [editEnglishName, setEditEnglishName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSalary, setEditSalary] = useState(350);
  const [editSelectedSubjects, setEditSelectedSubjects] = useState<string[]>([]);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  // Passcode prompt verification system (Security audit requirement)
  const [isPasscodePromptOpen, setIsPasscodePromptOpen] = useState(false);
  const [passcodeValue, setPasscodeValue] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [pendingActionType, setPendingActionType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [pendingTeacherData, setPendingTeacherData] = useState<Teacher | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingTeacher, setPendingTeacher] = useState<Teacher | null>(null);

  // States for Class Assignment in Add modal
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [classToAssignIdInAdd, setClassToAssignIdInAdd] = useState('');

  // Selected active teacher sidebar index
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(teachers[0]?.id || null);

  const resetAddForm = () => {
    setKhmerName('');
    setEnglishName('');
    setPhone('');
    setSalary(350);
    setSelectedSubjects([]);
    setPhotoUrl('');
    setAssignedClassIds([]);
    setClassToAssignIdInAdd('');
  };

  const handleAssignClassInAdd = () => {
    if (classToAssignIdInAdd && !assignedClassIds.includes(classToAssignIdInAdd)) {
      setAssignedClassIds([...assignedClassIds, classToAssignIdInAdd]);
      setClassToAssignIdInAdd('');
    }
  };

  const handleRemoveClassInAdd = (cid: string) => {
    setAssignedClassIds(assignedClassIds.filter(id => id !== cid));
  };

  const handleStartAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khmerName || !englishName || !phone || selectedSubjects.length === 0) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់! Please fill all required fields.');
      return;
    }

    // Ensure we create a unique ID that does not colide with existing IDs
    const lastNum = teachers.reduce((acc, current) => {
      const match = current.id.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        return parsed > acc ? parsed : acc;
      }
      return acc;
    }, 0);
    const newId = `TCH${String(lastNum + 1).padStart(3, '0')}`;

    const newTeacher: Teacher = {
      id: newId,
      khmerName,
      englishName,
      phone,
      salary: Number(salary),
      subjects: selectedSubjects,
      joinedDate: new Date().toISOString().split('T')[0],
      photoUrl: photoUrl.trim() || undefined
    };

    const isPrivileged = currentRole === 'super_admin' || currentRole === 'school_admin';

    if (isPrivileged) {
      onAddTeacher(newTeacher);
      // Link the assigned classes
      if (onUpdateClass) {
        assignedClassIds.forEach(cid => {
          const targetClass = classes.find(c => c.id === cid);
          if (targetClass) {
            onUpdateClass({
              ...targetClass,
              teacherId: newTeacher.id
            });
          }
        });
      }
      onLogAction('CREATE_TEACHER', `បានបង្កើតប្រវត្តិរូបគ្រូបង្រៀនថ្មី៖ ${newTeacher.englishName} (${newTeacher.id})`);
      setIsAddOpen(false);
      resetAddForm();
    } else {
      // Prompt security passcode with class teachers for additions as expected for admin edits
      setPendingActionType('add');
      setPendingTeacherData(newTeacher);
      setPendingTeacher(teachers[0] || null); // Pick first teacher for convenience in passcode signature select
      setIsPasscodePromptOpen(true);
    }
  };

  const handleStartEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditKhmerName(teacher.khmerName);
    setEditEnglishName(teacher.englishName);
    setEditPhone(teacher.phone);
    setEditSalary(teacher.salary);
    setEditSelectedSubjects(teacher.subjects || []);
    setEditPhotoUrl(teacher.photoUrl || '');
    setIsEditOpen(true);
    setClassToAssignId(''); // reset
  };

  const handleRemoveClassFromTeacher = (cl: Class) => {
    if (editingTeacher && onUpdateClass) {
      onUpdateClass({
        ...cl,
        teacherId: '' // unassign
      });
      onLogAction('UPDATE_CLASS', `បានដកថ្នាក់រៀន ${cl.name} ចេញពីការគ្រប់គ្រងរបស់គ្រូ ID ${editingTeacher.id}`);
    }
  };

  const handleAssignClassToTeacher = () => {
    if (!classToAssignId || !editingTeacher || !onUpdateClass) return;
    const targetClass = classes.find(c => c.id === classToAssignId);
    if (targetClass) {
      onUpdateClass({
        ...targetClass,
        teacherId: editingTeacher.id
      });
      onLogAction('UPDATE_CLASS', `បានចាត់តាំងថ្នាក់រៀន ${targetClass.name} ទៅឱ្យគ្រូ ID ${editingTeacher.id}`);
      setClassToAssignId(''); // reset selection
    }
  };

  const handleConfirmDelete = () => {
    if (!teacherToDelete) return;
    const tId = teacherToDelete.id;
    onDeleteTeacher(tId);
    onLogAction('DELETE_TEACHER', `បានលុបគ្រូបង្រៀនចេញពីប្រព័ន្ធ៖ ID ${tId} (${teacherToDelete.khmerName})`);
    if (activeTeacherId === tId) {
      setActiveTeacherId(teachers.find(t => t.id !== tId)?.id || null);
    }
    setIsDeleteConfirmOpen(false);
    setTeacherToDelete(null);
  };

  const handleStartSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    if (!editKhmerName || !editEnglishName || !editPhone || editSelectedSubjects.length === 0) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់! Please fill all required fields.');
      return;
    }

    const updatedTeacher: Teacher = {
      ...editingTeacher,
      khmerName: editKhmerName,
      englishName: editEnglishName,
      phone: editPhone,
      salary: Number(editSalary),
      subjects: editSelectedSubjects,
      photoUrl: editPhotoUrl.trim() || undefined
    };

    const isPrivileged = currentRole === 'super_admin' || currentRole === 'school_admin';

    if (isPrivileged) {
      onUpdateTeacher(updatedTeacher);
      onLogAction('UPDATE_TEACHER', `បានកែសម្រួលទិន្នន័យសាស្រ្តាចារ្យ៖ ${updatedTeacher.englishName} (${updatedTeacher.id})`);
      setIsEditOpen(false);
      setEditingTeacher(null);
    } else {
      // Ask passcode on admin edit
      setPendingActionType('edit');
      setPendingTeacherData(updatedTeacher);
      setPendingTeacher(teachers.find(t => t.id !== editingTeacher.id) || teachers[0] || null);
      setIsPasscodePromptOpen(true);
    }
  };

  const handleTriggerDeleteTeacher = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteConfirmOpen(true);
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTeacher) return;

    const correctCode = getTeacherPasscode(pendingTeacher.id);
    if (passcodeValue.trim() !== correctCode) {
      setPasscodeError('លេខកូដអនុម័តមិនត្រឹមត្រូវទេ! Incorrect approval passcode. Please verify with the teacher.');
      return;
    }

    // Success code verification! Execute matching state action
    if (pendingActionType === 'add' && pendingTeacherData) {
      onAddTeacher(pendingTeacherData);
      // Link the assigned classes
      if (onUpdateClass) {
        assignedClassIds.forEach(cid => {
          const targetClass = classes.find(c => c.id === cid);
          if (targetClass) {
            onUpdateClass({
              ...targetClass,
              teacherId: pendingTeacherData.id
            });
          }
        });
      }
      onLogAction('CREATE_TEACHER', `បានបង្កើតប្រវត្តិរូបគ្រូបង្រៀនថ្មី៖ ${pendingTeacherData.englishName} (${pendingTeacherData.id}) [អនុម័តដោយ៖ ${pendingTeacher.khmerName}]`);
      setIsAddOpen(false);
      resetAddForm();
    } else if (pendingActionType === 'edit' && pendingTeacherData) {
      onUpdateTeacher(pendingTeacherData);
      onLogAction('UPDATE_TEACHER', `បានកែសម្រួលទិន្នន័យសាស្រ្តាចារ្យ៖ ${pendingTeacherData.englishName} (${pendingTeacherData.id}) [អនុម័តដោយ៖ ${pendingTeacher.khmerName}]`);
      setIsEditOpen(false);
      setEditingTeacher(null);
    } else if (pendingActionType === 'delete' && pendingDeleteId) {
      onDeleteTeacher(pendingDeleteId);
      onLogAction('DELETE_TEACHER', `បានលុបគ្រូបង្រៀនចេញពីប្រព័ន្ធ៖ ID ${pendingDeleteId} [អនុម័តដោយ៖ ${pendingTeacher.khmerName}]`);
      if (activeTeacherId === pendingDeleteId) {
        setActiveTeacherId(teachers.find(t => t.id !== pendingDeleteId)?.id || null);
      }
    }

    // Reset modals
    setIsPasscodePromptOpen(false);
    setPasscodeValue('');
    setPendingActionType(null);
    setPendingTeacherData(null);
    setPendingDeleteId(null);
    setPasscodeError('');
    setPendingTeacher(null);
  };

  const activeTeacher = teachers.find(t => t.id === activeTeacherId);
  const teacherClasses = activeTeacher ? classes.filter(c => c.teacherId === activeTeacher.id) : [];
  
  // Find receipts collected by this teacher
  const collectedReceipts = activeTeacher
    ? receipts.filter(r => r.collectedBy.toLowerCase().includes(activeTeacher.englishName.toLowerCase()) || r.collectedBy.includes(activeTeacher.khmerName))
    : [];

  const totalCollectedByTeacher = collectedReceipts.reduce((sum, r) => sum + r.amountPaid, 0);
  const isRestrictedRole = currentRole === 'student_parent';
  const isAdmin = currentRole === 'super_admin' || currentRole === 'school_admin';

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">គ្រប់គ្រងលោកគ្រូ អ្នកគ្រូ និងការប្រមូលថវិកា • Teachers Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">ការតាមដានប្រាក់បៀវត្សរ៍ មុខវិជ្ជាបង្រៀន និងសន្និធិថវិកាប្រមូលផ្ទាល់ដៃ</p>
        </div>
        {!isRestrictedRole && isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-[#104ac0] hover:bg-[#0d3b99] text-white text-xs font-bold px-5 py-2.5 transition-all cursor-pointer shadow-md rounded-full border-none animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              បន្ថែមគ្រូបង្រៀនថ្មី (Add Teacher)
            </button>
          </div>
        )}
      </div>

      {/* Teachers Roster and Detail Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start text-[13px]">
        {/* Left Hand: Profiles List with avatars on left as requested */}
        <div className="bg-white p-4 rounded-md shadow-sm space-y-3 lg:sticky lg:top-4 lg:h-[calc(100vh-100px)] flex flex-col border border-slate-200">
          <h3 className="font-extrabold text-[13px] uppercase tracking-wider text-slate-500">បញ្ជីសាស្រ្តាចារ្យ (Faculty Teachers)</h3>
          
          <div className="divide-y divide-slate-200 flex-1 overflow-y-auto pr-1">
            {teachers.map(tch => {
              const teachingCount = classes.filter(c => c.teacherId === tch.id).length;
              return (
                <div
                  key={tch.id}
                  onClick={() => setActiveTeacherId(tch.id)}
                  className={`w-full text-left p-3.5 transition-all cursor-pointer flex justify-between items-center relative gap-3 border-b border-slate-200 last:border-b-0 py-3 rounded-none ${
                    activeTeacherId === tch.id
                      ? 'bg-brand-50/80 text-brand-900 border-l-4 border-l-brand-600 pl-2.5'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Compact round avatar photo strictly left side of each item bar as requested */}
                    <img
                      src={tch.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tch.englishName)}&background=0284c7&color=fff&bold=true`}
                      alt={tch.englishName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                    />
                    
                    <div className="min-w-0">
                      <span className="text-[13px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {tch.id}
                      </span>
                      <h4 className="font-extrabold text-[13px] text-slate-900 mt-1 truncate">{tch.khmerName}</h4>
                      <p className="text-[13px] font-medium text-slate-500 font-mono leading-none truncate">{tch.englishName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="text-right font-sans">
                      <span className="text-[13px] bg-slate-100 border border-slate-200/50 text-slate-600 font-bold px-2 py-0.5 rounded-md block text-center">
                        {teachingCount} ថ្នាក់
                      </span>
                      {isAdmin && (
                        <span className="text-[13px] font-extrabold text-emerald-600 block mt-0.5 font-mono">${tch.salary}</span>
                      )}
                    </div>

                    {/* Inline edit controls always visible for admin as requested */}
                    {isAdmin && (
                      <div className="flex gap-1 pl-2 border-l border-slate-150" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleStartEditTeacher(tch)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50/80 transition-all cursor-pointer"
                          title="កែសម្រួលគ្រូ (Edit Teacher)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTriggerDeleteTeacher(tch)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-550 hover:bg-rose-50/80 transition-all cursor-pointer"
                          title="លុបគ្រូ (Delete Teacher)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Hand: Details & Live Collection list */}
        <div className="lg:col-span-2 flex flex-col gap-4 lg:h-[calc(100vh-100px)] lg:sticky lg:top-4">
          {activeTeacher ? (
            <>
              {/* Profile details summary card with custom shadows and rounded corners, no borders */}
              <div className="bg-white p-5 rounded-md shadow-sm shrink-0 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={activeTeacher.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeTeacher.englishName)}&background=0284c7&color=fff&bold=true`}
                      alt={activeTeacher.englishName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border border-slate-100 shadow-md shrink-0 animate-fade-in"
                    />
                    <div>
                      <h3 className="font-extrabold text-[13px] text-slate-900">{activeTeacher.khmerName}</h3>
                      <p className="text-[13px] font-mono text-slate-400 font-bold">{activeTeacher.englishName} ({activeTeacher.id})</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="text-right">
                      <span className="text-[13px] text-slate-400 font-bold block uppercase tracking-wide">ប្រាក់បៀវត្សរ៍មូលដ្ឋាន (Salary)</span>
                      <span className="text-[13px] font-extrabold text-emerald-700 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-lg inline-block mt-1">
                        ${activeTeacher.salary} USD / mo
                      </span>
                    </div>
                  )}
                </div>

                {/* Info row elements formatted cleanly */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-50/60 p-4 rounded-md text-[13px] text-slate-600 border border-slate-150/50">
                    <span className="text-[13px] text-slate-400 block font-bold">លេខទូរស័ព្ទ (Phone Number)</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {activeTeacher.phone}
                    </span>
                  </div>

                  <div className="bg-slate-50/60 p-4 rounded-md text-[13px] text-slate-600 border border-slate-150/50">
                    <span className="text-[13px] text-slate-400 block font-bold">ថ្ងៃចូលធ្វើការ (Joined Date)</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {activeTeacher.joinedDate}
                    </span>
                  </div>

                  <div className="bg-slate-50/60 p-4 rounded-md text-[13px] text-slate-600 border border-slate-150/50">
                    <span className="text-[13px] text-slate-400 block font-bold">ថ្នាក់កំពុងកាន់កាប់ (Workload Assignment)</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      {teacherClasses.length} ថ្នាក់សិក្សា
                    </span>
                  </div>
                </div>

                {/* Teaching tag curriculum specialties with pill aesthetics */}
                <div className="mt-4 text-[13px]">
                  <span className="text-[13px] text-slate-400 font-bold block uppercase mb-1.5">ជំនាញបង្រៀន (Competencies)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTeacher.subjects.map(subId => {
                      const maybeSub = subjects.find(s => s.id === subId);
                      return (
                        <span key={subId} className="text-[13px] font-bold bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-100">
                          {maybeSub ? `${maybeSub.khmerName} (${maybeSub.name})` : subId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* INCOME TRACKING INVOICE WITH SUBTLE SHADOWS, NO SURROUNDING BORDER */}
              <div className="bg-white p-5 rounded-md shadow-sm space-y-4 flex-1 flex flex-col min-h-0 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-3 gap-2 shrink-0">
                  <div>
                    <h4 className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5 font-sans">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      បញ្ជីប្រមូលថវិកាផ្ទាល់ដៃ • Live Income Cash Logs (${totalCollectedByTeacher.toLocaleString()})
                    </h4>
                    <p className="text-[13px] text-slate-500 font-medium">ចុចលើជួរដេកវិក្កយបត្រណាមួយដើម្បីពិនិត្យផ្ទៀងផ្ទាត់ (Click logs to verify details securely)</p>
                  </div>
                  <span className="text-[13px] bg-slate-100 text-slate-600 border border-slate-200/65 font-bold px-3 py-1 rounded-lg">
                    {collectedReceipts.length} វិក្កយបត្រ
                  </span>
                </div>

                {collectedReceipts.length > 0 ? (
                  <div className="border border-slate-200 rounded-md overflow-hidden shadow-xs flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200 text-[13px]">
                          <th className="p-3">លេខវិក្កយបត្រ (Receipt ID)</th>
                          <th className="p-3">សិស្ស (Student)</th>
                          <th className="p-3">ថ្នាក់ (Class)</th>
                          <th className="p-3">កាលបរិច្ឆេទ (Collected Time)</th>
                          <th className="p-3 text-right">ទឹកប្រាក់ (Amount)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-bold text-slate-700">
                        {collectedReceipts.map(rc => (
                          <tr
                            key={rc.id}
                            onClick={() => setSelectedReceipt(rc)}
                            className="hover:bg-slate-100 cursor-pointer transition-colors text-slate-700 font-bold text-[13px]"
                            title="ចុចដើម្បីពិនិត្យលម្អិត (Click to view details)"
                          >
                            <td className="p-3 text-brand-650 font-mono text-[13px] font-bold">
                              {rc.id}
                            </td>
                            <td className="p-3 text-slate-800 font-extrabold text-[13px]">{rc.studentName}</td>
                            <td className="p-3 text-slate-600 text-[13px]">{rc.className} (លើកទី{rc.installmentNumber})</td>
                            <td className="p-3 text-slate-400 font-mono text-[13px]">{rc.date}</td>
                            <td className="p-3 text-right text-brand-600 font-extrabold text-[13px]">${rc.amountPaid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50/55 rounded-md border border-dashed border-slate-200 text-[12px] flex-1 flex items-center justify-center">
                    <p className="text-slate-400 italic">មិនទាន់មានប្រវត្តិប្រមូលសាច់ប្រាក់នៅឡើយទេ (No collected funds recorded)</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06),0_4px_12px_-6px_rgba(0,0,0,0.04)]">
              <p className="text-slate-400 italic text-[12px]">សូមជ្រើសរើសសាស្រ្តាចារ្យម្នាក់ដើម្បីមើលលម្អិត</p>
            </div>
          )}
        </div>
      </div>


      {/* Add Teacher Modal with Image Upload */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-250 shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col justify-between animate-fade-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">ចុះឈ្មោះគ្រូថ្មីចូលបង្រៀន • Register New Educator</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ការកំណត់ប្រវត្តរូប ជំនាញ និងប្រាក់បៀវត្សរ៍មូលដ្ឋាន</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartAddTeacher} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-3.5">
                {/* Photo drag & drop upload component */}
                <ImageUploader
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  label="រូបថតគ្រូបង្រៀន (Teacher Portrait Photo)"
                  helperText="អូស និងទម្លាក់រូបថតផ្កាយគ្រូពីកុំព្យូទ័រ (Drag & drop profile image from your computer)"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name Khmer */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ឈ្មោះខ្មែរ (Name Khmer) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ឈឹម បូរិទ្ធ"
                      value={khmerName}
                      onChange={(e) => setKhmerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-brand-500 focus:outline-none bg-slate-5  0"
                    />
                  </div>

                  {/* Name English */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ឈ្មោះអង់គ្លេស (Name English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chhim Borith"
                      value={englishName}
                      onChange={(e) => setEnglishName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-brand-500 focus:outline-none bg-slate-5  0"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">លេខទូរស័ព្ទ (Phone Number) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. 012 888 777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-brand-500 focus:outline-none bg-slate-5  0"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ប្រាក់ខែមូលដ្ឋានដុល្លារ ($ Base Salary) *</label>
                    <input
                      type="number"
                      required
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-brand-500 focus:outline-none bg-slate-5  0 font-mono"
                    />
                  </div>
                </div>

                {/* Subject curriculum checkbox selector */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block">ជំនាញមុខវិជ្ជាបង្រៀន (Competencies & Subjects) *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subjects.map(su => (
                      <label key={su.id} className="flex items-center gap-2 p-2 px-2.5 border border-slate-150 hover:bg-slate-50 cursor-pointer text-[12px] font-bold text-slate-700 rounded-sm">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(su.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects([...selectedSubjects, su.id]);
                            } else {
                              setSelectedSubjects(selectedSubjects.filter(i => i !== su.id));
                            }
                          }}
                          className="text-brand-600 focus:ring-brand-500 font-bold"
                        />
                        <span>{su.khmerName} <span className="text-slate-400 font-mono text-[12px]">({su.name})</span></span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Class Assignment Selector inside Add Form */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-[12px] font-bold text-slate-600 block">ចាត់តាំងថ្នាក់សិក្សាកំពុងកាន់ការ</label>

                  {/* Selector to add/assign new class to this teacher */}
                  <div className="flex gap-2 items-center">
                    <select
                      value={classToAssignIdInAdd}
                      onChange={(e) => setClassToAssignIdInAdd(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none p-2 rounded text-[12px] font-medium text-slate-700 cursor-pointer select-none"
                    >
                      <option value="">ជ្រើសរើសថ្នាក់ដែលត្រូវការចាត់តាំង...</option>
                      {classes.filter(c => !assignedClassIds.includes(c.id)).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.teacherId ? `(គ្រូចាស់៖ ${teachers.find(t => t.id === c.teacherId)?.khmerName || c.teacherId})` : '(ទំនេរ)'}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAssignClassInAdd}
                      disabled={!classToAssignIdInAdd}
                      className={`p-2 rounded-md cursor-pointer transition-all border-none flex items-center justify-center ${
                        classToAssignIdInAdd
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                      title="ចាត់តាំងថ្នាក់ថ្មី"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Short sequential assigned classes list */}
                  <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                    {assignedClassIds.map(cid => {
                      const cl = classes.find(c => c.id === cid);
                      if (!cl) return null;
                      return (
                        <div key={cl.id} className="flex items-center justify-between bg-slate-50/80 p-2 rounded-md border border-slate-200 hover:bg-slate-104 transition-colors">
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="text-[12px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                              {cl.id}
                            </span>
                            <span className="font-bold text-slate-800">{cl.name}</span>
                            <span className="text-slate-400">({cl.scheduleTime})</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveClassInAdd(cl.id)}
                            className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors border-none flex items-center justify-center"
                            title="ដកថ្នាក់ចេញ"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                    {assignedClassIds.length === 0 && (
                      <p className="text-[12px] text-slate-400 italic">មិនទាន់មានថ្នាក់សិក្សាដែលត្រូវចាត់ចែងឡើយ</p>
                    )}
                  </div>
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 cursor-pointer shadow-sm hover:bg-slate-50 rounded-lg"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleStartAddTeacher}
                className="px-5 py-2 text-[12px] font-bold text-white bg-slate-900 hover:bg-slate-850 cursor-pointer shadow-md rounded-lg border-none"
              >
                ចុះឈ្មោះគ្រូ (Register Teacher)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal with Image Upload */}
      {isEditOpen && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-250 shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col justify-between animate-fade-in rounded-sm">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">កែសម្រួលព័ត៌មានគ្រូ</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ធ្វើបច្ចុប្បន្នភាពជំនាញ លេខទូរស័ព្ទ និងកម្រិតបៀវត្សរ៍</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingTeacher(null);
                }}
                className="p-1 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSaveEdit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {/* Photo upload */}
                <ImageUploader
                  value={editPhotoUrl}
                  onChange={setEditPhotoUrl}
                  label="រូបថតគ្រូបង្រៀន"
                  helperText="អូស និងទម្លាក់រូបថតថ្មីដើម្បីកែប្រែ"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name Khmer */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ឈ្មោះខ្មែរ *</label>
                    <input
                      type="text"
                      required
                      value={editKhmerName}
                      onChange={(e) => setEditKhmerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-[#104ac0] focus:outline-none bg-slate-50"
                    />
                  </div>

                  {/* Name English */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ឈ្មោះអង់គ្លេស *</label>
                    <input
                      type="text"
                      required
                      value={editEnglishName}
                      onChange={(e) => setEditEnglishName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-[#104ac0] focus:outline-none bg-slate-50"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">លេខទូរស័ព្ទ *</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-[#104ac0] focus:outline-none bg-slate-50"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ប្រាក់ខែមូលដ្ឋានជាដុល្លារ *</label>
                    <input
                      type="number"
                      required
                      value={editSalary}
                      onChange={(e) => setEditSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 text-xs font-semibold focus:border-[#104ac0] focus:outline-none bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                {/* Subject competencies checkboxes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block">ជំនាញមុខវិជ្ជាបង្រៀន *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subjects.map(su => (
                      <label key={su.id} className="flex items-center gap-2 p-2 px-2.5 border border-slate-150 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={editSelectedSubjects.includes(su.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSelectedSubjects([...editSelectedSubjects, su.id]);
                            } else {
                              setEditSelectedSubjects(editSelectedSubjects.filter(i => i !== su.id));
                            }
                          }}
                          className="text-[#104ac0] focus:ring-[#104ac0]"
                        />
                        <span>{su.khmerName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* បញ្ជីខ្លីៗបន្តគ្នានូវថ្នាក់ដែលគាត់កាន់ តែអាចដក ឬ ប្ដូរបាន */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-600 block">ចាត់តាំងថ្នាក់សិក្សាកំពុងកាន់ការខ្ពស់</label>

                  {/* Selector to add/assign new class to this teacher */}
                  <div className="flex gap-2 items-center">
                    <select
                      value={classToAssignId}
                      onChange={(e) => setClassToAssignId(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none p-2 rounded text-xs font-medium text-slate-705 cursor-pointer animate-fade-in"
                    >
                      <option value="">ជ្រើសរើសថ្នាក់ដែលត្រូវការចាត់តាំង...</option>
                      {classes.filter(c => c.teacherId !== editingTeacher.id).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.teacherId ? `(គ្រូចាស់៖ ${teachers.find(t => t.id === c.teacherId)?.khmerName || c.teacherId})` : '(ទំនេរ)'}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAssignClassToTeacher}
                      disabled={!classToAssignId}
                      className={`p-2 rounded cursor-pointer transition-all border-none flex items-center justify-center ${
                        classToAssignId
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold'
                          : 'bg-slate-100 text-slate-350 cursor-not-allowed'
                      }`}
                      title="ចាត់តាំងថ្នាក់ថ្មី"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Short sequential assigned classes list */}
                  <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                    {classes.filter(c => c.teacherId === editingTeacher.id).map(cl => (
                      <div key={cl.id} className="flex items-center justify-between bg-slate-50/80 p-2 rounded border border-slate-200 hover:bg-slate-100/50 transition-colors animate-fade-in">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                            {cl.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{cl.name}</span>
                          <span className="text-[10px] text-slate-450">({cl.scheduleTime})</span>
                        </div>

                        {/* Only show icon, NO text on buttons! */}
                        <button
                          type="button"
                          onClick={() => handleRemoveClassFromTeacher(cl)}
                          className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors border-none flex items-center justify-center"
                          title="ដកថ្នាក់ចេញ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {classes.filter(c => c.teacherId === editingTeacher.id).length === 0 && (
                      <p className="text-[11px] text-slate-400 italic">មិនទាន់មានថ្នាក់សិក្សាដែលត្រូវចាត់ចែងឡើយ</p>
                    )}
                  </div>
                </div>

              </div>
            </form>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2.5 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingTeacher(null);
                }}
                className="px-5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 cursor-pointer shadow-sm hover:bg-slate-50 rounded-full"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleStartSaveEdit}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 cursor-pointer shadow-md rounded-full border-none"
              >
                រក្សាបច្ចុប្បន្នភាព
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Deletion Confirmation Modal */}
      {isDeleteConfirmOpen && teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden rounded-md animate-fade-in p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 border border-rose-100 shadow-sm animate-pulse">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">បញ្ជាក់ការលុបប្រវត្តិរូបគ្រូ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                តើអ្នកពិតជាចង់លុបលោកគ្រូ/អ្នកគ្រូ <span className="font-extrabold text-rose-600">{teacherToDelete.khmerName}</span> ({teacherToDelete.englishName}) ចេញពីប្រព័ន្ធមែនទេ? ការលុបនេះនឹងមិនអាចសង្គ្រោះមកវិញបានឡើយ។
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setTeacherToDelete(null);
                }}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all rounded-full border-none cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all rounded-full border-none cursor-pointer shadow-md shadow-rose-600/10"
              >
                បញ្ជាក់ការលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Passcode Prompt Dialog - Cohesive Audit Control */}
      {isPasscodePromptOpen && pendingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-400 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between border-b border-amber-600">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span className="font-extrabold text-xs uppercase tracking-wide">តម្រូវការផ្ទៀងផ្ទាត់សោសុវត្ថិភាព (Passcode Authorization Required)</span>
              </div>
              <button
                onClick={() => {
                  setIsPasscodePromptOpen(false);
                  setPasscodeValue('');
                  setPasscodeError('');
                }}
                className="p-1 text-slate-950 hover:bg-amber-600 cursor-pointer transition-colors"
                title="បិទ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPasscode} className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-none flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed font-bold">
                  ដើម្បីធានាបាននូវគណនេយ្យភាព ប្រព័ន្ធតម្រូវឱ្យមានការអនុម័តដោយបញ្ចូលលេខកូដសម្ងាត់ពីគ្រូបង្រៀនម្នាក់។
                  (Administrative audit requires entering a teacher authorization passcode to confirm edits).
                </div>
              </div>

              {/* Selector for validating teacher */}
              <div id="verify-teacher-field" className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-600 block">ជ្រើសរើសសាស្រ្តាចារ្យអនុម័ត (Authorizing Teacher) *</label>
                <select
                  value={pendingTeacher?.id || ''}
                  onChange={(e) => {
                    const picked = teachers.find(t => t.id === e.target.value);
                    if (picked) setPendingTeacher(picked);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.khmerName} ({t.englishName}) - {t.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input for validation passcode */}
              <div id="verify-passcode-field" className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10.5px] font-bold text-slate-650 block">លេខកូដអនុម័ត ៤ ខ្ទង់ (4-Digit Approval Passcode) *</label>
                  <span className="text-[9px] text-amber-700 font-bold bg-amber-100/50 px-1 border border-amber-200">
                    Hint: {getTeacherPasscode(pendingTeacher.id)}
                  </span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="• • • •"
                  className="w-full text-center px-4 py-3 border border-slate-300 text-lg font-black font-mono tracking-widest bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                  value={passcodeValue}
                  onChange={(e) => {
                    setPasscodeValue(e.target.value.replace(/\D/g, ''));
                    setPasscodeError('');
                  }}
                />
                {passcodeError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 leading-snug">⚠️ {passcodeError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasscodePromptOpen(false);
                    setPasscodeValue('');
                    setPasscodeError('');
                  }}
                  className="px-4 py-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-205 cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[11px] font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 border border-amber-500 cursor-pointer shadow-sm shadow-amber-400/10 animate-pulse"
                >
                  បញ្ជាក់ការអនុម័ត (Authorize Change)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Detailed Receipt Modal Viewer */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 flex flex-col scale-in">
            {/* Header / Receipt Top */}
            <div className="bg-[#104ac0] text-white p-5 relative text-center">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2.5">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-extrabold text-base tracking-wide font-sans">វិក្កយបត្រផ្លូវការ / Official Receipt</h3>
              <p className="text-[10px] text-white/70 font-mono tracking-widest uppercase mt-0.5">ID: {selectedReceipt.id}</p>
            </div>

            {/* Receipt Body Tape */}
            <div className="p-6 space-y-4 font-sans bg-slate-50/30">
              {/* Payment Amount Display */}
              <div className="text-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/40">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">ទឹកប្រាក់ទទួលបាន (Amount Paid)</span>
                <span className="text-3xl font-extrabold font-mono text-[#104ac0]">${selectedReceipt.amountPaid}</span>
                <span className="text-[10.5px] font-bold text-[#104ac0]/80 block mt-1">ទូទាត់ជោគជ័យ (Paid Successfully)</span>
              </div>

              {/* Transaction Details List */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-400 font-medium">ឈ្មោះសិស្ស (Student Name)</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.studentName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-400 font-medium">ថ្នាក់សិក្សា (Class / Intake)</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.className}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-400 font-medium">បង់ប្រាក់សម្រាប់ (Installment Level)</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">លើកទី {selectedReceipt.installmentNumber}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-400 font-medium">សមតុល្យនៅសល់ (Remaining)</span>
                  <span className="font-bold text-slate-700">${selectedReceipt.remainingBalance} USD</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-400 font-medium">កាលបរិច្ឆេទ (Payment Date)</span>
                  <span className="font-mono text-slate-700 font-bold">{selectedReceipt.date}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">អ្នកទទួលសាច់ប្រាក់ (Collected By)</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedReceipt.collectedBy}
                  </span>
                </div>
              </div>

              {/* Decorative paper tape punch lines */}
              <div className="flex items-center justify-between gap-1 text-slate-300 select-none py-1.5 overflow-hidden">
                <span className="shrink-0">- - - - - - - - - - - - - - - - - - - - - -</span>
              </div>

              {/* Audit Signatures */}
              <div className="text-center space-y-1 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block">ប្រព័ន្ធសវនកម្មឌីជីថល (Digital Audit Seal)</span>
                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded break-all select-all block">
                  SECURE_TOKEN_{selectedReceipt.id}_{selectedReceipt.amountPaid}
                </span>
              </div>
            </div>

            {/* Footer Close */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 text-xs font-bold text-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
              >
                រួចរាល់ (Dismiss Receipt)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
