/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Class, Teacher, UserRole } from '../types';
import { Search, Plus, Eye, Pencil, Trash2, X, User, Phone, MapPin, Calendar, Check, AlertTriangle, Key } from 'lucide-react';
import { getTeacherPasscode } from '../utils';
import ImageUploader from './ImageUploader';

interface StudentsProps {
  students: Student[];
  classes: Class[];
  teachers: Teacher[];
  currentRole: UserRole;
  currentUserId?: string;
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateStudentStatus: (studentId: string, newStatus: Student['status']) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function Students({
  students,
  classes,
  teachers,
  currentRole,
  currentUserId,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onUpdateStudentStatus,
  onLogAction
}: StudentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Student['status']>('all');
  const [classFilter, setClassFilter] = useState('all');

  const isTeacher = currentRole === 'teacher';

  // Filter based on teacher assignment if applicable
  const teacherClasses = isTeacher && currentUserId ? classes.filter(c => c.teacherId === currentUserId) : classes;
  const teacherClassIds = teacherClasses.map(c => c.id);

  const displayStudents = isTeacher && currentUserId
    ? students.filter(s => s.enrolledClasses?.some(cid => teacherClassIds.includes(cid)))
    : students;
  
  // Add Student State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [khmerName, setKhmerName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [dob, setDob] = useState('2012-01-01');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editKhmerName, setEditKhmerName] = useState('');
  const [editEnglishName, setEditEnglishName] = useState('');
  const [editGender, setEditGender] = useState<'M' | 'F'>('M');
  const [editDob, setEditDob] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editSelectedClasses, setEditSelectedClasses] = useState<string[]>([]);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editStatus, setEditStatus] = useState<Student['status']>('active');

  // Teacher Passcode Prompt States for Admin actions
  const [isPasscodePromptOpen, setIsPasscodePromptOpen] = useState(false);
  const [passcodeValue, setPasscodeValue] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [pendingActionType, setPendingActionType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [pendingStudentData, setPendingStudentData] = useState<Student | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingTeacher, setPendingTeacher] = useState<{ id: string; khmerName: string; englishName: string } | null>(null);

  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const imagesPlaceholder = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  ];

  // Filters calculation
  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch = 
      student.khmerName.includes(searchTerm) || 
      student.englishName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesClass = classFilter === 'all' || student.enrolledClasses.includes(classFilter);
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Calculate which class teacher's authorization code is required
  const getRequiredTeacherSignature = (enrolledClassesList: string[]): { id: string; khmerName: string; englishName: string } => {
    if (enrolledClassesList && enrolledClassesList.length > 0) {
      const cls = classes.find(c => enrolledClassesList.includes(c.id));
      if (cls && cls.teacherId) {
        const teacher = teachers.find(t => t.id === cls.teacherId);
        if (teacher) return teacher;
      }
    }
    // Default fallback to first teacher
    return teachers[0] || { id: 'TCH001', khmerName: 'ឈឹម បូរិទ្ធ', englishName: 'Chhim Borith' };
  };

  const isAdmin = ['super_admin', 'school_admin', 'accountant'].includes(currentRole);

  const resetAddForm = () => {
    setKhmerName('');
    setEnglishName('');
    setGender('M');
    setPhone('');
    setAddress('');
    setParentName('');
    setParentPhone('');
    setSelectedClasses([]);
    setPhotoUrl('');
  };

  const handleTriggerAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khmerName || !englishName || !parentName || !parentPhone) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់! Please fill out all required fields.');
      return;
    }

    const nextIdVal = students.length + 1;
    const newId = `STD${String(nextIdVal).padStart(4, '0')}`;
    const fallbackPhoto = imagesPlaceholder[nextIdVal % imagesPlaceholder.length];

    const studentToSave: Student = {
      id: newId,
      khmerName,
      englishName,
      gender,
      dob,
      address,
      phone: phone || parentPhone,
      photoUrl: photoUrl.trim() || fallbackPhoto,
      parentName,
      parentPhone,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      enrolledClasses: selectedClasses
    };

    if (isAdmin) {
      // Prompt for class teacher authorization passcode
      const authTeacher = getRequiredTeacherSignature(selectedClasses);
      setPendingTeacher(authTeacher);
      setPendingActionType('add');
      setPendingStudentData(studentToSave);
      setIsPasscodePromptOpen(true);
    } else {
      onAddStudent(studentToSave);
      onLogAction('CREATE_STUDENT', `បានចុះឈ្មោះសិស្សថ្មី៖ ${englishName} (${newId})`);
      setIsAddOpen(false);
      resetAddForm();
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudent(student);
    setEditKhmerName(student.khmerName);
    setEditEnglishName(student.englishName);
    setEditGender(student.gender);
    setEditDob(student.dob);
    setEditPhone(student.phone);
    setEditAddress(student.address);
    setEditParentName(student.parentName);
    setEditParentPhone(student.parentPhone);
    setEditSelectedClasses(student.enrolledClasses || []);
    setEditPhotoUrl(student.photoUrl || '');
    setEditStatus(student.status);
  };

  const handleTriggerSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editKhmerName || !editEnglishName || !editParentName || !editParentPhone) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់! Please fill out all fields.');
      return;
    }

    const updatedStudent: Student = {
      ...editingStudent,
      khmerName: editKhmerName,
      englishName: editEnglishName,
      gender: editGender,
      dob: editDob,
      phone: editPhone,
      address: editAddress,
      parentName: editParentName,
      parentPhone: editParentPhone,
      enrolledClasses: editSelectedClasses,
      photoUrl: editPhotoUrl.trim() || editingStudent.photoUrl,
      status: editStatus
    };

    if (isAdmin) {
      // Prompt for class teacher authorization passcode
      const authTeacher = getRequiredTeacherSignature(editSelectedClasses);
      setPendingTeacher(authTeacher);
      setPendingActionType('edit');
      setPendingStudentData(updatedStudent);
      setIsPasscodePromptOpen(true);
    } else {
      onUpdateStudent(updatedStudent);
      onLogAction('UPDATE_STUDENT', `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសិស្ស៖ ${updatedStudent.englishName} (${updatedStudent.id})`);
      setEditingStudent(null);
    }
  };

  const handleTriggerDelete = (student: Student) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបសិស្សឈ្មោះ ${student.englishName} មែនទេ? Are you sure you want to delete this student?`)) {
      return;
    }

    if (isAdmin) {
      const authTeacher = getRequiredTeacherSignature(student.enrolledClasses);
      setPendingTeacher(authTeacher);
      setPendingActionType('delete');
      setPendingDeleteId(student.id);
      setIsPasscodePromptOpen(true);
    } else {
      onDeleteStudent(student.id);
      onLogAction('DELETE_STUDENT', `បានលុបព័ត៌មានសិស្ស៖ ID ${student.id}`);
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent(null);
      }
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTeacher) return;

    const correctCode = getTeacherPasscode(pendingTeacher.id);
    if (passcodeValue.trim() !== correctCode) {
      setPasscodeError('លេខកូដអនុម័តមិនត្រឹមត្រូវទេ! Incorrect approval passcode. Please verify with the teacher.');
      return;
    }

    // Passcode code matches! Execute action
    if (pendingActionType === 'add' && pendingStudentData) {
      onAddStudent(pendingStudentData);
      onLogAction('CREATE_STUDENT', `បានចុះឈ្មោះសិស្សថ្មី៖ ${pendingStudentData.englishName} (${pendingStudentData.id}) [គ្រូអនុម័ត៖ ${pendingTeacher.khmerName}]`);
      setIsAddOpen(false);
      resetAddForm();
    } else if (pendingActionType === 'edit' && pendingStudentData) {
      onUpdateStudent(pendingStudentData);
      onLogAction('UPDATE_STUDENT', `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសិស្ស៖ ${pendingStudentData.englishName} (${pendingStudentData.id}) [គ្រូអនុម័ត៖ ${pendingTeacher.khmerName}]`);
      setEditingStudent(null);
    } else if (pendingActionType === 'delete' && pendingDeleteId) {
      onDeleteStudent(pendingDeleteId);
      onLogAction('DELETE_STUDENT', `បានលុបព័ត៌មានសិស្ស៖ ID ${pendingDeleteId} [គ្រូអនុម័ត៖ ${pendingTeacher.khmerName}]`);
      if (selectedStudent && selectedStudent.id === pendingDeleteId) {
        setSelectedStudent(null);
      }
    }

    // Clean up
    setIsPasscodePromptOpen(false);
    setPasscodeValue('');
    setPendingActionType(null);
    setPendingStudentData(null);
    setPendingDeleteId(null);
    setPasscodeError('');
    setPendingTeacher(null);
  };

  const statusTags = {
    active: { text: 'កំពុងសិក្សា (Active)', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    suspended: { text: 'ព្យួរការសិក្សា (Suspended)', style: 'bg-amber-50 text-amber-700 border-amber-100' },
    drop: { text: 'ឈប់រៀន (Drop)', style: 'bg-rose-50 text-rose-700 border-rose-100' },
    graduated: { text: 'បញ្ចប់ការសិក្សា (Graduated)', style: 'bg-purple-50 text-purple-700 border-purple-100' }
  };

  const isRestrictedRole = currentRole === 'student_parent';

  return (
    <div className="space-y-4 font-sans">
      {/* Module Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">គ្រប់គ្រងព័ត៌មានសិស្ស • Student Directory</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">ការចុះឈ្មោះ លក្ខខណ្ឌសិក្សា និងស្ថានភាពសិស្សម្នាក់ៗ</p>
        </div>
        {!isRestrictedRole && currentRole !== 'accountant' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 bg-[#104ac0] hover:bg-[#0d3b99] text-white text-[13px] font-bold px-5 py-2 transition-all cursor-pointer shadow-sm rounded-full border-none"
            >
              <Plus className="w-4 h-4" />
              ចុះឈ្មោះសិស្សថ្មី (Add Student)
            </button>
          </div>
        )}
      </div>

      {/* Control Filters Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_-4px_24px_rgba(0,0,0,0.04)] space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមលេខសម្គាល់ ឬឈ្មោះសិស្ស (Search ID, English/Khmer name...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-slate-50/60 border border-slate-200/80 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl text-[13px] font-medium text-slate-700 transition-all shadow-sm"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50/60 border border-slate-200/80 focus:border-indigo-500 focus:bg-white focus:outline-none px-4 h-11 rounded-xl text-[13px] font-medium text-slate-700 cursor-pointer transition-all shadow-sm"
            >
              <option value="all">គ្រប់ស្ថានភាពទាំងអស់ (All Status)</option>
              <option value="active">កំពុងសិក្សា (Active)</option>
              <option value="suspended">ព្យួរការសិក្សា (Suspended)</option>
              <option value="drop">ឈប់រៀន (Drop)</option>
              <option value="graduated">បញ្ចប់ការសិក្សា (Graduated)</option>
            </select>
          </div>

          {/* Class enrolled filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200/80 focus:border-indigo-500 focus:bg-white focus:outline-none px-4 h-11 rounded-xl text-[13px] font-medium text-slate-700 cursor-pointer transition-all shadow-sm"
            >
              <option value="all">គ្រប់កម្រិតថ្នាក់ (All Classes)</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[12.5px] text-slate-400 font-semibold flex items-center gap-1.5 pl-1.5 pt-0.5">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          រកឃើញសិស្សចំនួន {filteredStudents.length} នាក់ / Found {filteredStudents.length} pupils
        </div>
      </div>

      {/* Roster Table (Excel style) */}
      <div className="overflow-auto max-h-[calc(100vh-340px)] sm:max-h-[calc(100vh-280px)] bg-white relative">
        <table className="min-w-full border-collapse text-left">
          <thead className="sticky top-0 z-20 shadow-xs">
            <tr className="bg-sky-50 text-sky-950 font-extrabold border-b border-sky-100 text-[13px] select-none font-sans">
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 text-center w-12 font-extrabold text-sky-950">ល.រ</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950 w-20">អត្តលេខ</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-[#03487c] text-center w-14">រូបថត</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950">គោត្តនាម-នាម</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950 font-mono">English Name</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 text-center font-extrabold text-sky-950 w-12">ភេទ</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950 w-24">ថ្ងៃខែឆ្នាំកំណើត</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950">លេខទូរស័ព្ទ</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950">អាណាព្យាបាល</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950">ទូរស័ព្ទអាណាព្យាបាល</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 font-extrabold text-sky-950">ថ្នាក់រៀន</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 text-center font-extrabold text-sky-950 w-32">ស្ថានភាពសិក្សា</th>
              <th className="sticky top-0 bg-sky-50 z-20 border border-slate-100 p-2.5 text-center font-extrabold text-sky-950 w-32">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13px]">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => {
                const studentClasses = classes.filter(c => student.enrolledClasses.includes(c.id));
                return (
                  <tr
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="border border-slate-100 p-2 text-center font-sans text-slate-400">{idx + 1}</td>
                    <td className="border border-slate-100 p-2 font-mono font-bold text-slate-700">{student.id}</td>
                    <td className="border border-slate-100 p-1.5 text-center">
                      <div className="flex justify-center">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.englishName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-100/50"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center font-mono text-[11px] border border-slate-100/50">
                            {student.englishName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-slate-100 p-2 font-bold text-slate-900">{student.khmerName}</td>
                    <td className="border border-slate-100 p-2 font-mono font-medium text-slate-600">{student.englishName}</td>
                    <td className="border border-slate-100 p-2 text-center text-slate-700">
                      {student.gender === 'M' ? 'ប្រុស' : 'ស្រី'}
                    </td>
                    <td className="border border-slate-100 p-2 text-slate-700">{student.dob}</td>
                    <td className="border border-slate-100 p-2 font-mono text-slate-700">{student.phone}</td>
                    <td className="border border-slate-100 p-2 text-slate-700">{student.parentName}</td>
                    <td className="border border-slate-100 p-2 font-mono text-slate-700">{student.parentPhone}</td>
                    <td className="border border-slate-100 p-2">
                      <div className="flex flex-wrap gap-1">
                        {studentClasses.length > 0 ? (
                          studentClasses.map(c => (
                            <span key={c.id} className="text-[12px] bg-slate-100 border border-slate-200/50 text-slate-700 font-bold px-1.5 py-0.5 rounded-sm">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">គ្មាន</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-slate-100 p-2 text-center">
                      <span className={`text-[12px] font-bold px-1.5 py-0.5 border rounded-sm ${statusTags[student.status].style}`}>
                        {statusTags[student.status].text.split(' ')[0]}
                      </span>
                    </td>
                    <td className="border border-slate-100 p-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 py-1 px-2 border border-slate-200 rounded-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>លម្អិត</span>
                        </button>
                        {!isRestrictedRole && currentRole !== 'accountant' && (
                          <>
                            <button
                              onClick={() => handleStartEdit(student)}
                              className="flex items-center gap-1 text-[12px] hover:text-slate-900 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 py-1 px-2 border border-amber-600 rounded-sm cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>កែ</span>
                            </button>
                            <button
                              onClick={() => handleTriggerDelete(student)}
                              className="flex items-center justify-center text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 p-1 border border-rose-200 rounded-sm cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center p-8 text-slate-400">
                  មិនមានទិន្នន័យដើម្បីបង្ហាញទេ (No student matches criteria)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal Popup */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
            <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">ចុះឈ្មោះសិស្សថ្មី • New Student Enrolment</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">បំពេញព័ត៌មានខាងក្រោមដើម្បីបញ្ចូលក្នុងប្រព័ន្ធ</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerAddStudent} className="p-4 space-y-3.5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Khmer Name */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ឈ្មោះខ្មែរ (Name Khmer) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. គង់ គឹមហេង"
                    value={khmerName}
                    onChange={(e) => setKhmerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ឈ្មោះអង់គ្លេស (Name English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kong Kimheng"
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ភេទ (Gender) *</label>
                  <div className="flex gap-4 pt-1.5">
                    <label className="flex items-center gap-1.5 text-[13px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={gender === 'M'}
                        onChange={() => setGender('M')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      ប្រុស (Male)
                    </label>
                    <label className="flex items-center gap-1.5 text-[13px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={gender === 'F'}
                        onChange={() => setGender('F')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      ស្រី (Female)
                    </label>
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ថ្ងៃខែឆ្នាំកំណើត (DOB) *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Student Phone */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">លេខទូរស័ព្ទសិស្ស (Student Phone)</label>
                  <input
                    type="text"
                    placeholder="ឧ. 096 888 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Student Address */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">អាសយដ្ឋានបច្ចុប្បន្ន (Address)</label>
                  <input
                    type="text"
                    placeholder="ភ្នំពេញ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ឈ្មោះអាណាព្យាបាល (Parent Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. គង់ សុផា"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">លេខទូរស័ព្ទអាណាព្យាបាល (Parent Phone) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. 012 345 678"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Photo Drag & Drop Upload */}
                <div className="md:col-span-2">
                  <ImageUploader
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    label="រូបថតសិស្ស (Student Photo)"
                    helperText="អូស និងទំលាក់រូបថតសិស្សពីឧបករណ៍របស់អ្នក (Drag & Drop student photo from your device)"
                  />
                </div>
              </div>

              {/* Class Registration Selector */}
              <div>
                <label className="text-[13px] font-bold text-slate-600 block mb-1.5">ចុះឈ្មោះចូលរៀនថ្នាក់វិទ្យាល័យ/ភាសា (Class Enrolments)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center gap-2 p-2.5 border border-slate-205 hover:bg-slate-50 rounded-none cursor-pointer text-[13px] font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                          }
                        }}
                        className="rounded-none text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-extrabold">{cls.name}</span>
                        <span className="text-slate-400 block text-[13px] font-bold">តម្លៃ៖ ${cls.fee}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-150 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-[13px] font-bold text-slate-600 bg-white border border-slate-202 rounded-none cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="submit"
                onClick={handleTriggerAddStudent}
                className="px-5 py-2 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-none cursor-pointer shadow-sm"
              >
                រក្សាទុក (Save Student)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal as requested with directly editable fields */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-fade-in">
            <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">កែប្រែព័ត៌មានសិស្ស • Edit Student Block Info</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">កែតម្រូវទិន្នន័យដោយផ្ទាល់ និងរក្សាទុកក្នុងប្រព័ន្ធ</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerSaveEdit} className="p-4 space-y-3.5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Khmer Name */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ឈ្មោះខ្មែរ (Name Khmer) *</label>
                  <input
                    type="text"
                    required
                    value={editKhmerName}
                    onChange={(e) => setEditKhmerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ឈ្មោះអង់គ្លេស (Name English) *</label>
                  <input
                    type="text"
                    required
                    value={editEnglishName}
                    onChange={(e) => setEditEnglishName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ភេទ (Gender) *</label>
                  <div className="flex gap-4 pt-1.5">
                    <label className="flex items-center gap-1.5 text-[13px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={editGender === 'M'}
                        onChange={() => setEditGender('M')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      ប្រុស (Male)
                    </label>
                    <label className="flex items-center gap-1.5 text-[13px] text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        checked={editGender === 'F'}
                        onChange={() => setEditGender('F')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      ស្រី (Female)
                    </label>
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ថ្ងៃខែឆ្នាំកំណើត (DOB) *</label>
                  <input
                    type="date"
                    required
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Student Phone */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">លេខទូរស័ព្ទសិស្ស (Student Phone)</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Student Address */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">អាសយដ្ឋានបច្ចុប្បន្ន (Address)</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ឈ្មោះអាណាព្យាបាល (Parent Name) *</label>
                  <input
                    type="text"
                    required
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">លេខទូរស័ព្ទអាណាព្យាបាល (Parent Phone) *</label>
                  <input
                    type="text"
                    required
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-none text-[13px] font-semibold focus:border-brand-500"
                  />
                </div>

                {/* Photo Drag & Drop Upload */}
                <div className="md:col-span-2">
                  <ImageUploader
                    value={editPhotoUrl}
                    onChange={setEditPhotoUrl}
                    label="រូបថតសិស្ស (Student Photo)"
                    helperText="អូស និងទំលាក់រូបថតសិស្សពីឧបករណ៍របស់អ្នកដើម្បីកែប្រែ (Drag & Drop student photo from your device to update)"
                  />
                </div>

                {/* Status Options */}
                <div>
                  <label className="text-[13px] font-bold text-slate-600 block mb-1">ស្ថានភាពសិក្សា (Student Status)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none px-3 py-2 rounded-none text-[13px] font-bold text-slate-700"
                  >
                    <option value="active">កំពុងសិក្សា (Active)</option>
                    <option value="suspended">ព្យួរការសិក្សា (Suspended)</option>
                    <option value="drop">ឈប់រៀន (Drop)</option>
                    <option value="graduated">បញ្ចប់ការសិក្សា (Graduated)</option>
                  </select>
                </div>
              </div>

              {/* Class Registration Selector */}
              <div>
                <label className="text-[13px] font-bold text-slate-600 block mb-1.5">ថ្នាក់ដែលបានចុះឈ្មោះ (Class Enrolments)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center gap-2 p-2.5 border border-slate-205 hover:bg-slate-50 rounded-none cursor-pointer text-[13px] font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editSelectedClasses.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSelectedClasses([...editSelectedClasses, cls.id]);
                          } else {
                            setEditSelectedClasses(editSelectedClasses.filter(id => id !== cls.id));
                          }
                        }}
                        className="rounded-none text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-extrabold">{cls.name}</span>
                        <span className="text-slate-400 block text-[13px] font-bold">តម្លៃ៖ ${cls.fee}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-150 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => handleTriggerDelete(editingStudent)}
                className="px-4 py-2 text-[13px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-none cursor-pointer"
              >
                លុបព័ត៌មានខាងលើ (Delete Student)
              </button>
              
              <div className="flex gap-2">
                <button
                   type="button"
                   onClick={() => setEditingStudent(null)}
                   className="px-4 py-2 text-[13px] font-bold text-slate-600 bg-white border border-slate-202 rounded-none cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  onClick={handleTriggerSaveEdit}
                  className="px-5 py-2 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-none cursor-pointer shadow-sm"
                >
                  កត់ត្រាកែប្រែ (Save Edit Details)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Teacher Passcode security prompt for Admin adjustments */}
      {isPasscodePromptOpen && pendingTeacher && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-400 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-150 flex items-center bg-amber-500 text-slate-950 gap-2 font-black text-sm">
              <Key className="w-5 h-5 text-slate-900 animate-pulse" />
              <span>ការផ្ទៀងផ្ទាត់សិទ្ធិពិសេស • Authorization Required</span>
            </div>

            <form onSubmit={handleVerifyPasscode} className="p-4 space-y-4">
              <div className="space-y-1 text-[13px]">
                <p className="font-bold text-slate-800">
                  រាល់ពេល Admin ធ្វើការកែប្រែ ឬលុបទិន្នន័យ អ្នកត្រូវតែបញ្ចូលលេខកូដសម្ងាត់ពីគ្រូបង្រៀនជាចាំបាច់។
                </p>
                <p className="text-slate-600 leading-relaxed font-semibold bg-slate-50 p-2.5 border border-slate-150">
                  សូមសួរលេខកូដសម្ងាត់ពីលោកគ្រូ/អ្នកគ្រូ៖ <span className="text-amber-700 font-extrabold">{pendingTeacher.khmerName} ({pendingTeacher.englishName})</span> ដែលគ្រូបង្រៀនរូបនេះអាចចូលគណនីគាត់ដើម្បីមើលកូដនេះ នៅក្នុងផ្នែក <strong className="text-slate-900">«ការកំណត់គណនី»</strong>!
                </p>
              </div>

              {passcodeError && (
                <div className="p-2 border border-rose-250 bg-rose-50 text-rose-700 text-[13px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 block select-none">
                  លេខកូដសម្ងាត់អនុម័តរបស់គ្រូ (Teacher Approval Passcode) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: 2580"
                  autoFocus
                  value={passcodeValue}
                  onChange={(e) => setPasscodeValue(e.target.value)}
                  className="w-full text-center px-4 py-3 border border-slate-300 rounded-none text-lg font-black font-mono tracking-widest bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 text-[13px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasscodePromptOpen(false);
                    setPasscodeValue('');
                    setPendingActionType(null);
                    setPendingStudentData(null);
                    setPendingDeleteId(null);
                    setPasscodeError('');
                    setPendingTeacher(null);
                  }}
                  className="px-4 py-2 font-bold text-slate-600 bg-white border border-slate-205 rounded-none cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 border border-amber-500 rounded-none cursor-pointer shadow-sm shadow-amber-400/10"
                >
                  ផ្ទៀងផ្ទាត់កូដ (Verify Passcode)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details & Status Update Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">ប្រវត្តិរូបសិស្ស • Student Portal Card</h3>
                <span className="text-[13px] font-mono text-slate-400 font-bold">{selectedStudent.id}</span>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="flex items-center gap-3.5 bg-slate-50 p-3 border border-slate-150 rounded-none">
                {selectedStudent.photoUrl ? (
                  <img
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.englishName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 font-black flex items-center justify-center font-mono text-xl shrink-0 border border-brand-200">
                    {selectedStudent.englishName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedStudent.khmerName}</h4>
                  <p className="text-[13px] font-bold text-slate-500 font-mono">{selectedStudent.englishName}</p>
                  <p className="text-[13px] text-slate-400 font-bold mt-1">ថ្ងៃចុះឈ្មោះ៖ {selectedStudent.enrollmentDate}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px] text-slate-700">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-none">
                    <span className="text-[13px] text-slate-400 font-bold block mb-0.5">ភេទ (Gender)</span>
                    <span className="font-bold">{selectedStudent.gender === 'M' ? 'ប្រុស (Male)' : 'ស្រី (Female)'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-none">
                    <span className="text-[13px] text-slate-400 font-bold block mb-0.5">ថ្ងៃកំណើត (DOB)</span>
                    <span className="font-bold">{selectedStudent.dob}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-none">
                  <span className="text-[13px] text-slate-400 font-bold block mb-0.5">លេខទូរស័ព្ទ (Contact)</span>
                  <span className="font-bold">{selectedStudent.phone}</span>
                </div>

                <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-none">
                  <span className="text-[13px] text-slate-400 font-bold block mb-0.5">អាណាព្យាបាល (Parent Name & Phone)</span>
                  <span className="font-bold">{selectedStudent.parentName} • {selectedStudent.parentPhone}</span>
                </div>

                <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-none">
                  <span className="text-[13px] text-slate-400 font-bold block mb-0.5">អាសយដ្ឋាន (Home Address)</span>
                  <span className="font-bold">{selectedStudent.address}</span>
                </div>

                <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-none">
                  <span className="text-[13px] text-slate-400 font-bold block mb-1">ថ្នាក់ដែលបានចុះឈ្មោះ (Enrolled Classes)</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {classes.filter(c => selectedStudent.enrolledClasses.includes(c.id)).map(c => (
                      <span key={c.id} className="text-[13px] bg-slate-100 border border-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded-none">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status modifier - Restricted based on role */}
                {!isRestrictedRole && currentRole !== 'accountant' ? (
                  <div className="pt-2 border-t border-slate-150">
                    <span className="text-[13px] text-slate-400 font-bold block mb-1">កែប្រែស្ថានភាពសិស្ស (Modify Student Status)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      {(['active', 'suspended', 'drop', 'graduated'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            onUpdateStudentStatus(selectedStudent.id, st);
                            onLogAction('CHANGE_STUDENT_STATUS', `បានប្តូរស្ថានភាពសិស្ស ${selectedStudent.englishName} ទៅជា ${st}`);
                            setSelectedStudent({ ...selectedStudent, status: st });
                          }}
                          className={`px-2 py-1 border text-[13px] font-bold text-center capitalize transition-all cursor-pointer ${
                            selectedStudent.status === st
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-205'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1.5">
                    <span className="text-[13px] text-slate-400 font-bold block">ស្ថានភាពសិក្សា (Student Status)</span>
                    <span className={`text-[13px] font-bold inline-block px-2.5 py-0.5 border mt-1 rounded-none ${statusTags[selectedStudent.status].style}`}>
                      {statusTags[selectedStudent.status].text}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-150 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-[13px] font-bold text-slate-600 bg-white border border-slate-202 rounded-none hover:text-slate-800 cursor-pointer"
              >
                បិទ (Close Window)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
