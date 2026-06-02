/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { loadState, saveState, SchoolState } from './data';
import { UserRole, Student, Class, Teacher, Invoice, Payment, Receipt, DailyAttendance, StudentMonthlyScore, AuditLog } from './types';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Classes from './components/Classes';
import Teachers from './components/Teachers';
import Billing from './components/Billing';
import Attendance from './components/Attendance';
import Grades from './components/Grades';
import AuditLogs from './components/AuditLogs';
import ParentPortal from './components/ParentPortal';
import Login from './components/Login';
import Settings from './components/Settings';
import { LayoutDashboard, Users, BookOpen, GraduationCap, DollarSign, Calendar, ListOrdered, Shield, History, Settings as SettingsIcon, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  // Master Database State Loaded from LocalStorage
  const [dbState, setDbState] = useState<SchoolState>(() => loadState());

  // Individual logged-in user state
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole; username: string; avatarColor: string; photoUrl?: string } | null>(() => {
    const saved = localStorage.getItem('school_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sidebar visiblity state: 'expanded' | 'collapsed' | 'hidden'
  const [sidebarMode, setSidebarMode] = useState<'expanded' | 'collapsed' | 'hidden'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'hidden';
    }
    return 'expanded';
  });

  // Dynamic layout compact spacing state - default to true for "គម្លាតប្លុកតិចបំផុត" (minimal block gaps)
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('school_compact_mode');
    return saved !== 'false'; // default to true to guarantee tight spacing
  });

  // Navigation tab switcher state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync state
  useEffect(() => {
    saveState(dbState);
  }, [dbState]);

  // Access definitions for backward compatibility in sub-components
  const activeUser = currentUser || {
    id: 'GUEST_01',
    name: 'នាយកសាលា វីរៈជន',
    role: 'super_admin' as UserRole,
    username: 'guest',
    avatarColor: 'bg-[#0B1E43]',
    photoUrl: undefined
  };

  const selectedRole = activeUser.role;
  const actor = {
    name: activeUser.name,
    id: activeUser.id
  };

  const schoolNameKhmer = dbState.schoolNameKhmer || 'សាលាអន្តរជាតិ វីរៈជន';
  const schoolNameEnglish = dbState.schoolNameEnglish || 'HEROES INTERNATIONAL SCHOOL';
  const schoolSlogan = dbState.schoolSlogan || 'សសរទ្រទ្រង់ការសិក្សារៀនសូត្រ៖ « ចំណេះដឹង បំណិន និងឥរិយាបថ » (Knowledge, Skills, and Attitude)';
  const schoolLogo = dbState.schoolLogo || '⚔️';

  const getProfilePicture = () => {
    if (currentUser) {
      if (currentUser.photoUrl) {
        return currentUser.photoUrl;
      }
      if (currentUser.role === 'teacher') {
        const teach = dbState.teachers.find(t => t.id === currentUser.id);
        if (teach && teach.photoUrl) return teach.photoUrl;
      }
      if (currentUser.role === 'student_parent') {
        const stud = dbState.students.find(s => s.id === currentUser.id);
        if (stud && stud.photoUrl) return stud.photoUrl;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0284c7&color=fff&bold=true`;
    }
    return '';
  };

  // Helper log action
  const logAction = (action: string, details: string) => {
    const logUser = currentUser || activeUser;

    setDbState(prev => {
      const maxVal = prev.auditLogs.reduce((max, log) => {
        const num = parseInt(log.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const nextLogVal = maxVal + 1;
      const newLog: AuditLog = {
        id: `ALG${String(nextLogVal).padStart(3, '0')}`,
        timestamp: new Date().toLocaleString(),
        userId: logUser.id,
        userName: logUser.name,
        userRole: logUser.role,
        action,
        details,
        ipAddress: '158.82.164.218',
        device: typeof window !== 'undefined' ? `${window.navigator.appName} / Chrome Browser Client` : 'Client'
      };
      const logs = [...prev.auditLogs, newLog];
      const trimmedLogs = logs.slice(-200);
      return {
        ...prev,
        auditLogs: trimmedLogs
      };
    });
  };

  const handleToggleCompactMode = (val: boolean) => {
    setIsCompactMode(val);
    localStorage.setItem('school_compact_mode', String(val));
  };

  const handleLogin = (user: { id: string; name: string; role: UserRole; username: string; avatarColor: string }) => {
    setCurrentUser(user);
    localStorage.setItem('school_current_user', JSON.stringify(user));
    
    // Log login activity
    setDbState(prev => {
      const maxVal = prev.auditLogs.reduce((max, log) => {
        const num = parseInt(log.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const nextLogVal = maxVal + 1;
      const newLog: AuditLog = {
        id: `ALG${String(nextLogVal).padStart(3, '0')}`,
        timestamp: new Date().toLocaleString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGIN',
        details: `បានអនុញ្ញាតឱ្យចូលប្រើប្រាស់ប្រព័ន្ធជោគជ័យ៖ ${user.name} ក្នុងតួនាទី ${user.role.toUpperCase()}`,
        ipAddress: '158.82.164.218',
        device: typeof window !== 'undefined' ? `${window.navigator.appName} / Chrome Browser Client` : 'Client'
      };
      const logs = [...prev.auditLogs, newLog];
      const trimmedLogs = logs.slice(-200);
      return {
        ...prev,
        auditLogs: trimmedLogs
      };
    });
  };

  const handleLogout = () => {
    logAction('USER_LOGOUT', `គណនី ${currentUser?.name} បានចាកចេញពីប្រព័ន្ធដោយសុវត្ថិភាព`);
    setCurrentUser(null);
    localStorage.removeItem('school_current_user');
    setActiveTab('dashboard');
  };

  const handleAddStudent = (newStudent: Student) => {
    setDbState(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setDbState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    setDbState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
  };

  const handleUpdateStudentStatus = (studentId: string, newStatus: Student['status']) => {
    setDbState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
    }));
  };

  const handleAddClass = (newClass: Class) => {
    setDbState(prev => ({
      ...prev,
      classes: [...prev.classes, newClass]
    }));
  };

  const handleUpdateClass = (updatedClass: Class) => {
    setDbState(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === updatedClass.id ? updatedClass : c)
    }));
  };

  const handleAddTeacher = (newTeacher: Teacher) => {
    setDbState(prev => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher]
    }));
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setDbState(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t)
    }));
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setDbState(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== teacherId)
    }));
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setDbState(prev => ({
      ...prev,
      invoices: [...prev.invoices, newInvoice]
    }));
  };

  const handleAddPayment = (newPayment: Payment, updatedInvoice: Invoice) => {
    setDbState(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment],
      invoices: prev.invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i)
    }));
  };

  const handleAddReceipt = (newReceipt: Receipt) => {
    setDbState(prev => ({
      ...prev,
      receipts: [...prev.receipts, newReceipt]
    }));
  };

  const handleSaveAttendance = (newAttendance: DailyAttendance) => {
    setDbState(prev => {
      const idx = prev.attendances.findIndex(a => a.classId === newAttendance.classId && a.date === newAttendance.date);
      if (idx >= 0) {
        const updated = [...prev.attendances];
        updated[idx] = newAttendance;
        return { ...prev, attendances: updated };
      }
      return { ...prev, attendances: [...prev.attendances, newAttendance] };
    });
  };

  const handleSaveScores = (newScore: StudentMonthlyScore) => {
    setDbState(prev => {
      const idx = prev.scores.findIndex(s => s.id === newScore.id);
      if (idx >= 0) {
        const updated = [...prev.scores];
        updated[idx] = newScore;
        return { ...prev, scores: updated };
      }
      return { ...prev, scores: [...prev.scores, newScore] };
    });
  };

  const handleClearSystemData = () => {
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យ និងកំណត់ឡើងវិញមែនទេ? Are you sure you want to reset the entire database?')) {
      localStorage.removeItem('school_management_state');
      localStorage.removeItem('school_current_user');
      window.location.reload();
    }
  };

  const handleImportSampleSchoolData = () => {
    // Generate 10 Classes
    const demoClasses: Class[] = [
      { id: 'CLS001', name: 'Grade 7A', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Wed', 'Fri'], scheduleTime: '08:00 AM - 11:00 AM', room: 'Room 302', teacherId: 'TCH001', fee: 300 },
      { id: 'CLS002', name: 'Grade 7B', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Wed', 'Fri'], scheduleTime: '01:00 PM - 04:00 PM', room: 'Room 303', teacherId: 'TCH002', fee: 300 },
      { id: 'CLS003', name: 'Grade 8A', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Tue', 'Thu', 'Sat'], scheduleTime: '08:00 AM - 11:00 AM', room: 'Room 401', teacherId: 'TCH003', fee: 320 },
      { id: 'CLS004', name: 'Grade 8B', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Tue', 'Thu', 'Sat'], scheduleTime: '01:00 PM - 04:00 PM', room: 'Room 402', teacherId: 'TCH001', fee: 320 },
      { id: 'CLS005', name: 'Grade 9A', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Wed', 'Fri'], scheduleTime: '08:00 AM - 11:00 AM', room: 'Room 501', teacherId: 'TCH002', fee: 340 },
      { id: 'CLS006', name: 'Grade 9B', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Wed', 'Fri'], scheduleTime: '01:00 PM - 04:00 PM', room: 'Room 502', teacherId: 'TCH003', fee: 340 },
      { id: 'CLS007', name: 'Grade 10A', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '08:00 AM - 11:00 AM', room: 'Room 601', teacherId: 'TCH001', fee: 360 },
      { id: 'CLS008', name: 'Grade 10B', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '01:00 PM - 04:00 PM', room: 'Room 602', teacherId: 'TCH002', fee: 360 },
      { id: 'CLS009', name: 'Grade 11A', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '08:00 AM - 12:00 PM', room: 'Room 701', teacherId: 'TCH003', fee: 380 },
      { id: 'CLS010', name: 'Grade 11B', subjects: ['SUB001', 'SUB002', 'SUB005'], scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '01:00 PM - 05:00 PM', room: 'Room 702', teacherId: 'TCH001', fee: 380 },
    ];

    const khmerFamilyNames = ['សុខ', 'គង់', 'មាស', 'លឹម', 'ជា', 'សេង', 'កែវ', 'ងួន', 'ចាន់', 'ទេព', 'ឡុង', 'ស៊ូ', 'អ៊ុង', 'លី', 'ញ៉ែម', 'ណាំ', 'អ៊ុំ', 'ឃីម', 'ភួន', 'ទួន'];
    const englishFamilyNames = ['Sok', 'Kong', 'Meas', 'Lim', 'Chea', 'Seng', 'Keo', 'Nguon', 'Chan', 'Tep', 'Long', 'Sou', 'Ung', 'Ly', 'Nhem', 'Nam', 'Um', 'Khim', 'Phuon', 'Tuon'];

    const khmerMaleNames = ['គឹមហេង', 'ចាន់ត្រា', 'ហុង', 'តារា', 'វិបុល', 'ឧត្តម', 'សីហា', 'ពិសិដ្ឋ', 'សុជាតិ', 'សម្បត្តិ', 'រិទ្ធី', 'វីរៈ', 'សុជា', 'រតនា', 'តុលា', 'ចាន់ដារ៉ា', 'បូរិទ្ធ', 'កុសល', 'បញ្ញា', 'សុភ័ក្ត្រ'];
    const englishMaleNames = ['Kimheng', 'Chantra', 'Hong', 'Dara', 'Vibol', 'Odom', 'Seyha', 'Piseth', 'Socheat', 'Sambath', 'Rithy', 'Virak', 'Sochea', 'Ratana', 'Tola', 'Chandara', 'Borith', 'Kosal', 'Panha', 'Sopheak'];

    const khmerFemaleNames = ['ស្រីណុច', 'ម៉ារីណា', 'រចនា', 'សុភ័ក្ត្រ', 'រតនា', 'រស្មី', 'ទេវី', 'ម៉ាលី', 'ចរិយា', 'ធីតា', 'កុសុម៉ា', 'ផល្លា', 'វត្តី', 'សុជាតា', 'ស្រីណែត', 'លីហ្សា', 'សុភារី', 'វិច្ឆិកា', 'បុប្ផា', 'លក្ខិណា'];
    const englishFemaleNames = ['Sreynoch', 'Marina', 'Rachana', 'Sopheak', 'Ratana', 'Reasmey', 'Devy', 'Maly', 'Choriya', 'Thida', 'Kosuma', 'Phalla', 'Votei', 'Socheata', 'Sreynet', 'Liza', 'Sopheary', 'Vichhika', 'Bopha', 'Leakhena'];

    const generatedStudents: Student[] = [];
    const generatedInvoices: Invoice[] = [];
    let studentCount = 1;

    for (let cl = 1; cl <= 10; cl++) {
      const classId = `CLS${String(cl).padStart(3, '0')}`;
      const className = demoClasses[cl - 1].name;
      const classFee = demoClasses[cl - 1].fee;

      for (let st = 1; st <= 50; st++) {
        const isMale = (st % 2 === 0);
        const fIdx = (studentCount + cl + st) % khmerFamilyNames.length;
        const gIdx = (studentCount * 3 + cl * 7 + st * 11) % khmerMaleNames.length;

        const khmerName = `${khmerFamilyNames[fIdx]} ${isMale ? khmerMaleNames[gIdx] : khmerFemaleNames[gIdx]}`;
        const englishName = `${isMale ? englishMaleNames[gIdx] : englishFemaleNames[gIdx]} ${englishFamilyNames[fIdx]}`;
        const gender = isMale ? 'M' : 'F';
        const numStr = String(studentCount).padStart(4, '0');
        const id = `STD${numStr}`;

        generatedStudents.push({
          id,
          khmerName,
          englishName,
          gender,
          dob: `201${4 + (studentCount % 4)}-${String(1 + (studentCount % 12)).padStart(2, '0')}-${String(1 + (studentCount % 28)).padStart(2, '0')}`,
          address: `សង្កាត់ទឹកថ្លា ខណ្ឌសែនសុខ ភ្នំពេញ (ផ្ទះលេខ ${studentCount + 10})`,
          phone: `096 ${String(1000000 + studentCount * 1793).slice(1, 4)} ${String(1000000 + studentCount * 1793).slice(4, 8)}`,
          photoUrl: '',
          parentName: `${khmerFamilyNames[(fIdx + 2) % khmerFamilyNames.length]} ${khmerMaleNames[(gIdx + 3) % khmerMaleNames.length]}`,
          parentPhone: `012 ${String(2000000 + studentCount * 2315).slice(1, 4)} ${String(2000000 + studentCount * 2315).slice(4, 8)}`,
          enrollmentDate: '2026-01-10',
          status: 'active',
          enrolledClasses: [classId]
        });

        if (st <= 5) {
          const invId = `INV2026${String(generatedInvoices.length + 1).padStart(3, '0')}`;
          generatedInvoices.push({
            id: invId,
            studentId: id,
            classId,
            courseName: className,
            totalAmount: classFee,
            discount: 0,
            paidAmount: 0,
            remainingBalance: classFee,
            status: 'unpaid',
            createdAt: '2026-05-01',
            installments: [
              { installmentNumber: 1, amount: classFee / 3, dueDate: '2026-05-15', paidAmount: 0, status: 'unpaid' },
              { installmentNumber: 2, amount: classFee / 3, dueDate: '2026-06-15', paidAmount: 0, status: 'unpaid' },
              { installmentNumber: 3, amount: classFee / 3, dueDate: '2026-07-15', paidAmount: 0, status: 'unpaid' }
            ]
          });
        }

        studentCount++;
      }
    }

    setDbState(prev => {
      const maxVal = prev.auditLogs.reduce((max, log) => {
        const num = parseInt(log.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const nextLogVal = maxVal + 1;
      const nextLogs = [
        ...prev.auditLogs,
        {
          id: `ALG${String(nextLogVal).padStart(3, '0')}`,
          timestamp: new Date().toLocaleString(),
          userId: activeUser.id,
          userName: activeUser.name,
          userRole: activeUser.role,
          action: 'IMPORT_DEMO_DATA',
          details: 'បានជោគជ័យក្នុងការបង្កើតទិន្នន័យគំរូសាលា៖ ១០ថ្នាក់រៀនសរុប និងសិស្ស៥០០នាក់ (៥០នាក់ក្នុងមួយថ្នាក់)',
          ipAddress: '158.82.164.218',
          device: 'System Generator'
        }
      ].slice(-200);

      return {
        ...prev,
        classes: demoClasses,
        students: generatedStudents,
        invoices: generatedInvoices,
        payments: [],
        receipts: [],
        attendances: [],
        scores: [],
        auditLogs: nextLogs
      };
    });

    alert('ទិន្នន័យគំរូចំនួន ១០ថ្នាក់រៀន និងសិស្សចំនួន ៥០០នាក់ ត្រូវបាននាំចូលក្នុងប្រព័ន្ធដោយជោគជ័យពេញលេញ! (10 Classes & 500 Students imported successfully!)');
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  // Render modular panels
  const renderTabContent = () => {
    if (selectedRole === 'student_parent') {
      return (
        <ParentPortal
          students={dbState.students}
          invoices={dbState.invoices}
          receipts={dbState.receipts}
          attendances={dbState.attendances}
          scores={dbState.scores}
          classes={dbState.classes}
          subjects={dbState.subjects}
          teachers={dbState.teachers}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            students={dbState.students}
            teachers={dbState.teachers}
            classes={dbState.classes}
            invoices={dbState.invoices}
            payments={dbState.payments}
            receipts={dbState.receipts}
            currentRole={selectedRole}
            currentUserName={actor.name}
            currentUserId={actor.id}
            onNavigate={handleNavigate}
            onClearData={handleClearSystemData}
          />
        );
      case 'students':
        return (
          <Students
            students={dbState.students}
            classes={dbState.classes}
            teachers={dbState.teachers}
            currentRole={selectedRole}
            currentUserId={actor.id}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onLogAction={logAction}
          />
        );
      case 'classes':
        return (
          <Classes
            classes={dbState.classes}
            teachers={dbState.teachers}
            subjects={dbState.subjects}
            students={dbState.students}
            currentRole={selectedRole}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onLogAction={logAction}
          />
        );
      case 'teachers':
        return (
          <Teachers
            teachers={dbState.teachers}
            classes={dbState.classes}
            subjects={dbState.subjects}
            receipts={dbState.receipts}
            currentRole={selectedRole}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateClass={handleUpdateClass}
            onLogAction={logAction}
          />
        );
      case 'billing':
        return (
          <Billing
            invoices={dbState.invoices}
            students={dbState.students}
            classes={dbState.classes}
            teachers={dbState.teachers}
            payments={dbState.payments}
            receipts={dbState.receipts}
            currentRole={selectedRole}
            currentUserId={actor.id}
            currentUserName={actor.name}
            onAddInvoice={handleAddInvoice}
            onAddPayment={handleAddPayment}
            onAddReceipt={handleAddReceipt}
            onLogAction={logAction}
          />
        );
      case 'attendance':
        return (
          <Attendance
            attendances={dbState.attendances}
            classes={dbState.classes}
            students={dbState.students}
            teachers={dbState.teachers}
            currentRole={selectedRole}
            currentUserId={actor.id}
            currentUserName={actor.name}
            onSaveAttendance={handleSaveAttendance}
            onLogAction={logAction}
          />
        );
      case 'grades':
        return (
          <Grades
            scores={dbState.scores}
            classes={dbState.classes}
            subjects={dbState.subjects}
            students={dbState.students}
            teachers={dbState.teachers}
            currentRole={selectedRole}
            currentUserId={actor.id}
            onSaveScores={handleSaveScores}
            onLogAction={logAction}
          />
        );
      case 'audit':
        return <AuditLogs auditLogs={dbState.auditLogs} />;
      case 'settings':
        return (
          <Settings
            currentUser={currentUser}
            onUpdateSettings={(updated) => {
              const updatedUser = { ...currentUser, ...updated };
              setCurrentUser(updatedUser);
              localStorage.setItem('school_current_user', JSON.stringify(updatedUser));
            }}
            schoolNameKhmer={dbState.schoolNameKhmer || 'សាលាអន្តរជាតិ វីរៈជន'}
            schoolNameEnglish={dbState.schoolNameEnglish || 'HEROES INTERNATIONAL SCHOOL'}
            schoolSlogan={dbState.schoolSlogan || 'សសរទ្រទ្រង់ការសិក្សារៀនសូត្រ៖ « ចំណេះដឹង បំណិន និងឥរិយាបថ » (Knowledge, Skills, and Attitude)'}
            schoolLogo={dbState.schoolLogo || '⚔️'}
            onUpdateSchoolSettings={(updates) => {
              setDbState(prev => ({
                ...prev,
                ...updates
              }));
              logAction('UPDATE_SCHOOL_SETTINGS', 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានអត្តសញ្ញាណសាលា (School Identity Customized)');
            }}
            onClearData={handleClearSystemData}
            onImportSampleSchoolData={handleImportSampleSchoolData}
            isCompactMode={isCompactMode}
            onToggleCompactMode={handleToggleCompactMode}
            onLogAction={logAction}
          />
        );
      default:
        return <div className="text-center text-xs text-slate-400 py-12">Tab not implemented</div>;
    }
  };

  // Clean Khmer-only Navigation list items (completely emoji-free and English-free as requested)
  const isTeacherRole = selectedRole === 'teacher';
  const isAdminOrSuper = ['super_admin', 'school_admin'].includes(selectedRole);
  const canViewAuditLogs = selectedRole !== 'student_parent' && selectedRole !== 'student';

  const menuItems = [
    { id: 'dashboard', label: 'ផ្ទាំងព័ត៌មាន', icon: LayoutDashboard },
    { id: 'students', label: 'គ្រប់គ្រងសិស្ស', icon: Users },
    { id: 'classes', label: 'ថ្នាក់ និងកាលវិភាគ', icon: BookOpen },
    ...(!isTeacherRole ? [{ id: 'teachers', label: 'ព័ត៌មានគ្រូបង្រៀន', icon: GraduationCap }] : []),
    { id: 'billing', label: 'បង់ថ្លៃសិក្សា', icon: DollarSign },
    { id: 'attendance', label: 'គ្រប់គ្រងអវត្តមានសិស្ស', icon: Calendar },
    { id: 'grades', label: 'រង្វាយតម្លៃពិន្ទុ', icon: ListOrdered },
    ...(canViewAuditLogs ? [{ id: 'audit', label: 'សកម្មភាពសវនកម្ម', icon: History }] : []),
    {
      id: 'settings',
      label: isTeacherRole ? 'ការកំណត់គណនីផ្ទាល់ខ្លួន' : 'ការកំណត់ប្រព័ន្ធសាលារៀន',
      icon: SettingsIcon
    }
  ];

  // Determine width class for desktop aside based on sidebarMode
  const getSidebarWidthClass = () => {
    if (sidebarMode === 'hidden') return 'w-0 hidden';
    if (sidebarMode === 'collapsed') return 'w-20';
    return 'w-64';
  };

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarMode(prev => prev === 'hidden' ? 'expanded' : 'hidden');
    } else {
      setSidebarMode(prev => prev === 'expanded' ? 'collapsed' : 'expanded');
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      
      {/* BRAND NEW OFFICIAL SCHOOL HEADER - stable deep dark blue background and sharp clear white text as requested */}
      <div className="bg-[#104ac0] text-white border-b border-indigo-950 px-4 md:px-8 py-1 md:py-1.5 flex flex-row items-center justify-between gap-3 sticky top-0 z-50 shadow-sm rounded-none transition-colors duration-300">
        <div className="flex items-center gap-3">
          
          {/* Mobile menu toggle button - always visible on mobile, collapses/expands the navigation sidebar */}
          {selectedRole !== 'student_parent' && currentUser && (
            <button
              onClick={toggleSidebar}
              className="md:hidden flex items-center justify-center p-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-950/80 text-white cursor-pointer active:scale-95 transition-all outline-none border border-indigo-500/20"
              title="ម៉ឺនុយ"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          {/* Official Emblem Icon - plain crisp square box design with no surrounding gradients / circle trims */}
          <div className="w-10 h-10 text-white font-black flex items-center justify-center rounded-none shadow-none text-2xl shrink-0 overflow-hidden bg-transparent border-none">
            {schoolLogo.startsWith('data:image') || schoolLogo.startsWith('http') ? (
              <img src={schoolLogo} className="max-w-full max-h-full object-contain" alt="School logo" />
            ) : (
              <span>{schoolLogo}</span>
            )}
          </div>
          
          <div className="min-w-0">
            {/* School Title Khmer displayed in font-moul class as requested */}
            <h1 className="text-base md:text-[18px] font-bold font-moul tracking-wide text-white leading-[1.7] py-0.5 truncate">
              {schoolNameKhmer}
            </h1>
            {/* School slogan / minor detail */}
            <span className="hidden sm:block text-[13px] text-indigo-200 font-semibold truncate py-0 leading-[1.5] max-w-xl md:max-w-2xl">
              {schoolSlogan}
            </span>
          </div>
        </div>

        {/* Active Logged-in profile badge & logout tool - fully transparent background and no borders as requested */}
        <div className="flex items-center gap-3.5 bg-transparent p-0 border-none rounded-none shrink-0">
          {currentUser && (
            <div className="flex items-center gap-2.5">
              <img 
                src={getProfilePicture()} 
                alt={currentUser.name} 
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-white/30 shadow-xs shrink-0" 
              />
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-[13px] font-bold text-white leading-tight">{currentUser.name}</span>
                <span className="text-[11px] text-amber-400 font-semibold uppercase">{selectedRole === 'super_admin' ? 'អភិបាលជាន់ខ្ពស់' : selectedRole === 'school_admin' ? 'អភិបាលសាលា' : selectedRole === 'teacher' ? 'លោកគ្រូ/អ្នកគ្រូ' : selectedRole === 'accountant' ? 'គណនេយ្យករ' : 'សិស្ស/អាណាព្យាបាល'}</span>
              </div>
            </div>
          )}
          <div className="h-5 w-px bg-indigo-900"></div>

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 hover:text-amber-400 text-slate-100 text-[13px] font-bold py-1 px-2 hover:bg-slate-800 rounded-none transition-all cursor-pointer"
              title="ចាកចេញពីប្រព័ន្ធ"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden md:inline">ចាកចេញ</span>
            </button>
          ) : (
            <span className="text-[13px] text-amber-400 font-bold block">ភ្ញៀវចូលមើល</span>
          )}
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Backdrop glass translucent overlay for mobile to auto-close sidebar when clicking outside */}
        {selectedRole !== 'student_parent' && sidebarMode === 'expanded' && (
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden"
            onClick={() => setSidebarMode('hidden')}
          />
        )}

        {/* Left Drawer / Sidebar Navigation */}
        {selectedRole !== 'student_parent' ? (
          <aside className={`bg-slate-900 text-slate-200 p-4 shrink-0 transition-all duration-300 flex flex-col justify-start shadow-lg z-35 group relative overflow-visible
            ${getSidebarWidthClass()}
            ${sidebarMode === 'expanded' ? 'fixed inset-y-0 left-0 top-[57px] md:relative md:top-0 h-[calc(100vh-57px)] md:h-full' : 'hidden md:flex md:relative md:top-0 h-full'}
          `}>
            <div className="space-y-4 overflow-y-auto h-full">
              
              {/* Navigation lists with highly rounded, comfortable sizes buttons as requested */}
              <nav className="space-y-2">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isCollapsed = sidebarMode === 'collapsed';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        // Auto-hide when selecting option on mobile
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setSidebarMode('hidden');
                        }
                      }}
                      className={`w-full text-left transition-colors duration-150 cursor-pointer flex items-center gap-3.5 rounded-none border-y-0 border-l-0 border-r-4
                        ${isCollapsed ? 'justify-center px-2 py-3.5' : 'px-4 py-3 text-[14px] font-semibold'}
                        ${isActive
                          ? 'bg-slate-800/40 border-r-amber-500 text-amber-500 font-extrabold'
                          : 'border-r-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }
                      `}
                      title={item.label}
                    >
                      <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-amber-500' : 'text-slate-450 hover:text-white'}`} />
                      {!isCollapsed && <span className="font-bold leading-none">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* FLOATING SIDEBAR TOGGLE BUTTON — desktop only, anchored right of sidebar, triggers only on hover */}
            {currentUser && (
              <button
                onClick={toggleSidebar}
                title={sidebarMode === 'expanded' ? 'លាក់ម៉ឺនុយ' : sidebarMode === 'collapsed' ? 'បង្ហាញម៉ឺនុយ' : 'បង្ហាញម៉ឺនុយ'}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  right: '-20px',
                  zIndex: 45,
                }}
                className="hidden md:flex items-center justify-center w-5 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg border-y border-r border-amber-600 rounded-r-lg cursor-pointer focus:outline-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              >
                {sidebarMode === 'expanded' ? (
                  <ChevronLeft className="w-3.5 h-3.5 font-black" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 font-black" />
                )}
              </button>
            )}
          </aside>
        ) : null}

        {/* Right workspace panels with compact options */}
        <main 
          onClick={() => {
            // Auto hide sidebar on mobile if clicked on main content area
            if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarMode === 'expanded') {
              setSidebarMode('hidden');
            }
          }}
          className={`flex-1 overflow-x-hidden overflow-y-scroll h-full ${isCompactMode ? 'p-3 space-y-3' : 'p-6 space-y-6'}`}
        >
          {renderTabContent()}
        </main>
      </div>

      {/* FLOAT GLASSMORPHIC MODAL OVER THE BG FOR INITIAL VISITORS AS REQUESTED */}
      {!currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md overflow-y-auto p-4 animate-fade-in">
          <Login onLogin={handleLogin} />
        </div>
      )}

    </div>
  );
}
