/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentMonthlyScore, Class, Subject, Student, UserRole, SubjectScore, Teacher } from '../types';
import { Trophy, Printer, BookOpen, Star, RefreshCw, Save, ChevronRight, Calculator, X, Sparkles, UserCheck } from 'lucide-react';

interface GradesProps {
  scores: StudentMonthlyScore[];
  classes: Class[];
  subjects: Subject[];
  students: Student[];
  teachers: Teacher[];
  currentRole: UserRole;
  currentUserId?: string;
  onSaveScores: (newScore: StudentMonthlyScore) => void;
  onLogAction: (action: string, details: string) => void;
}

// Helper to retrieve official subject multipliers (មេគុណ) for Khmer private school GPA formula
export const getSubjectMultiplier = (subjId: string, nameKhmer?: string) => {
  const norm = (subjId + ' ' + (nameKhmer || '')).toLowerCase();
  if (norm.includes('khr') || norm.includes('khm') || norm.includes('ខ្មែរ')) return 2;
  if (norm.includes('math') || norm.includes('គណិត')) return 2;
  if (norm.includes('eng') || norm.includes('អង់គ្លេស')) return 1.5;
  if (norm.includes('sci') || norm.includes('វិទ្យា') || norm.includes('phys') || norm.includes('chem')) return 1;
  return 1;
};

export default function Grades({
  scores,
  classes,
  subjects,
  students,
  teachers,
  currentRole,
  currentUserId,
  onSaveScores,
  onLogAction
}: GradesProps) {
  const isTeacher = currentRole === 'teacher';
  const displayClasses = isTeacher && currentUserId ? classes.filter(c => c.teacherId === currentUserId) : classes;

  const [selectedClassId, setSelectedClassId] = useState(displayClasses[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState('2026-05');

  // Selected student to input grades for
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Score sheet inputs
  const [subjectInputs, setSubjectInputs] = useState<Record<string, { attendance: number; homework: number; midterm: number; final: number }>>({});
  const [remarks, setRemarks] = useState('');

  // Printable report card modal
  const [activeReportCard, setActiveReportCard] = useState<StudentMonthlyScore | null>(null);

  const matchedClass = displayClasses.find(c => c.id === selectedClassId);

  // Sync selectedClassId if displayClasses changes (e.g. login/role switch)
  React.useEffect(() => {
    if (displayClasses.length > 0 && !displayClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(displayClasses[0]?.id);
    }
  }, [displayClasses, selectedClassId]);
  const classStudents = matchedClass ? students.filter(s => s.enrolledClasses.includes(matchedClass.id)) : [];
  const classSubjects = matchedClass ? subjects.filter(s => matchedClass.subjects.includes(s.id)) : [];

  // Recount / retrieve active scores for student
  React.useEffect(() => {
    if (classStudents.length > 0 && !activeStudentId) {
      setActiveStudentId(classStudents[0].id);
    }
  }, [selectedClassId, classStudents.length]);

  React.useEffect(() => {
    if (!activeStudentId || !selectedClassId || !selectedMonth) return;

    const currentScore = scores.find(s => s.studentId === activeStudentId && s.classId === selectedClassId && s.month === selectedMonth);
    
    if (currentScore) {
      const inputs: typeof subjectInputs = {};
      currentScore.scores.forEach(s => {
        inputs[s.subjectId] = {
          attendance: s.attendanceScore,
          homework: s.homeworkScore,
          midterm: s.midtermScore,
          final: s.finalScore
        };
      });
      setSubjectInputs(inputs);
      setRemarks(currentScore.teacherRemarks || '');
    } else {
      // Default empty structures
      const inputs: typeof subjectInputs = {};
      classSubjects.forEach(s => {
        inputs[s.id] = { attendance: 90, homework: 85, midterm: 80, final: 85 };
      });
      setSubjectInputs(inputs);
      setRemarks('');
    }
  }, [activeStudentId, selectedClassId, selectedMonth, scores.length]);

  const handleUpdateScoreInput = (subjectId: string, field: 'attendance' | 'homework' | 'midterm' | 'final', val: number) => {
    const minMaxVal = Math.min(Math.max(val, 0), 100);
    setSubjectInputs(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: minMaxVal
      }
    }));
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentId || !selectedClassId) return;

    // Build subject scores calculating weighted averages
    const scoresList: SubjectScore[] = classSubjects.map(sub => {
      const inp = subjectInputs[sub.id] || { attendance: 90, homework: 85, midterm: 80, final: 85 };
      
      // Weightage: Att (10%) + HW (20%) + Mid (30%) + Final (40%)
      const totalWeighted = (inp.attendance * 0.1) + (inp.homework * 0.2) + (inp.midterm * 0.3) + (inp.final * 0.4);
      return {
        subjectId: sub.id,
        attendanceScore: inp.attendance,
        homeworkScore: inp.homework,
        midtermScore: inp.midterm,
        finalScore: inp.final,
        totalScore: Math.round(totalWeighted * 100) / 100
      };
    });

    let weightedSum = 0;
    let totalMultiplier = 0;
    scoresList.forEach(s => {
      const subObj = classSubjects.find(sub => sub.id === s.subjectId);
      const m = getSubjectMultiplier(s.subjectId, subObj?.khmerName);
      weightedSum += (s.totalScore * m);
      totalMultiplier += m;
    });
    const overallAverage = weightedSum / (totalMultiplier || 1);
    const roundedAvg = Math.round(overallAverage * 100) / 100;

    const studentScoreSheet: StudentMonthlyScore = {
      id: `SCR${selectedClassId}${activeStudentId}${selectedMonth.replace('-', '')}`,
      studentId: activeStudentId,
      classId: selectedClassId,
      month: selectedMonth,
      scores: scoresList,
      averageScore: roundedAvg,
      teacherRemarks: remarks,
      isFinalized: false
    };

    // Save active score first
    onSaveScores(studentScoreSheet);

    // Auto-Rank and cascade ranks across class of this month for true reactive system
    setTimeout(() => {
      const latestScores = [...scores];
      const existIdx = latestScores.findIndex(s => s.id === studentScoreSheet.id);
      if (existIdx >= 0) {
        latestScores[existIdx] = studentScoreSheet;
      } else {
        latestScores.push(studentScoreSheet);
      }

      const classScores = latestScores.filter(s => s.classId === selectedClassId && s.month === selectedMonth);
      const sorted = [...classScores].sort((a, b) => b.averageScore - a.averageScore);
      sorted.forEach((sc, idx) => {
        onSaveScores({
          ...sc,
          rank: idx + 1
        });
      });
    }, 50);

    const matchS = students.find(s => s.id === activeStudentId);
    onLogAction('SAVE_GRADES', `បានបញ្ចូលពិន្ទុ និងគណនាចំណាត់ថ្នាក់ស្វ័យប្រវត្តសម្រាប់សិស្ស ${matchS?.englishName} ថ្នាក់ ${matchedClass?.name} មធ្យមភាគ៖ ${roundedAvg}`);
    alert('រក្សាទុកពិន្ទុ និងគណនាចំណាត់ថ្នាក់ថ្នាក់ដោយស្វ័យប្រវត្តិជោគជ័យ! Scores saved and class auto-ranked.');
  };

  // Automated class-ranking calculation formula trigger
  const handleCalculateRanks = () => {
    if (!selectedClassId || !selectedMonth) return;

    // Filter relevant monthly records
    const classScores = scores.filter(s => s.classId === selectedClassId && s.month === selectedMonth);
    if (classScores.length === 0) {
      alert('មិនទាន់មានសិស្សណាម្នាក់ត្រូវបានបញ្ចូលពិន្ទុសម្រាប់ថ្នាក់នេះក្នុងខែនេះនៅឡើយទេ! Please input grades for some students first.');
      return;
    }

    // Sort by average score high to low
    const sorted = [...classScores].sort((a, b) => b.averageScore - a.averageScore);
    
    // Assign sorted index rank
    sorted.forEach((sc, idx) => {
      const updatedSheet: StudentMonthlyScore = {
        ...sc,
        rank: idx + 1
      };
      onSaveScores(updatedSheet);
    });

    onLogAction('CALCULATE_RANKS', `បានគណនាលំដាប់ថ្នាក់ (Rank Ranking) ស្វ័យប្រវត្តសរុប ${classScores.length} នាក់ ថ្នាក់ ${matchedClass?.name}`);
    alert('គណនាចំណាត់ថ្នាក់សិក្សា (Ranks) រួចរាល់! Ranking generated perfectly.');
  };

  const handleInlineScoreUpdate = (
    studentId: string,
    subjectId: string,
    value: number
  ) => {
    // limit value between 0 and 100
    const cleanValue = Math.min(Math.max(Number(value) || 0, 0), 100);

    // Find existing score object or construct a default one
    let studentScoreObj = scores.find(
      s => s.studentId === studentId && s.classId === selectedClassId && s.month === selectedMonth
    );

    let updatedScoresList: SubjectScore[] = [];

    if (studentScoreObj) {
      updatedScoresList = [...studentScoreObj.scores];
      const existSubScoreIdx = updatedScoresList.findIndex(sc => sc.subjectId === subjectId);

      if (existSubScoreIdx >= 0) {
        // Update existing subject score
        const target = { ...updatedScoresList[existSubScoreIdx] };
        target.attendanceScore = cleanValue;
        target.homeworkScore = cleanValue;
        target.midtermScore = cleanValue;
        target.finalScore = cleanValue;
        target.totalScore = cleanValue;
        updatedScoresList[existSubScoreIdx] = target;
      } else {
        // Add new subject score
        const target: SubjectScore = {
          subjectId,
          attendanceScore: cleanValue,
          homeworkScore: cleanValue,
          midtermScore: cleanValue,
          finalScore: cleanValue,
          totalScore: cleanValue
        };
        updatedScoresList.push(target);
      }
    } else {
      // Create new list for all subjects
      updatedScoresList = classSubjects.map(sub => {
        const isCurrent = sub.id === subjectId;
        const scoreVal = isCurrent ? cleanValue : 0;
        return {
          subjectId: sub.id,
          attendanceScore: scoreVal,
          homeworkScore: scoreVal,
          midtermScore: scoreVal,
          finalScore: scoreVal,
          totalScore: scoreVal
        };
      });
    }

    // Now calculate weighted average across updatedScoresList
    let weightedSum = 0;
    let totalMultiplier = 0;
    updatedScoresList.forEach(s => {
      const subObj = classSubjects.find(sub => sub.id === s.subjectId);
      const m = getSubjectMultiplier(s.subjectId, subObj?.khmerName);
      weightedSum += (s.totalScore * m);
      totalMultiplier += m;
    });
    const overallAverage = weightedSum / (totalMultiplier || 1);

    const studentScoreSheet: StudentMonthlyScore = {
      id: studentScoreObj?.id || `SCR${selectedClassId}${studentId}${selectedMonth.replace('-', '')}`,
      studentId,
      classId: selectedClassId,
      month: selectedMonth,
      scores: updatedScoresList,
      averageScore: Math.round(overallAverage * 100) / 100,
      teacherRemarks: studentScoreObj?.teacherRemarks || '',
      isFinalized: false
    };

    onSaveScores(studentScoreSheet);

    // Dynamic class auto-ranking cascade
    setTimeout(() => {
      const latestScores = [...scores];
      const existIdx = latestScores.findIndex(s => s.id === studentScoreSheet.id);
      if (existIdx >= 0) {
        latestScores[existIdx] = studentScoreSheet;
      } else {
        latestScores.push(studentScoreSheet);
      }

      const classScores = latestScores.filter(s => s.classId === selectedClassId && s.month === selectedMonth);
      const sorted = [...classScores].sort((a, b) => b.averageScore - a.averageScore);
      sorted.forEach((sc, idx) => {
        onSaveScores({
          ...sc,
          rank: idx + 1
        });
      });
    }, 50);
  };

  const isRestrictedRole = currentRole === 'student_parent';

  // Load active score sheet specifically for reports
  const activeStudent = students.find(s => s.id === activeStudentId);
  const currentMonthlyScoreObject = scores.find(s => s.studentId === activeStudentId && s.classId === selectedClassId && s.month === selectedMonth);

  const isTeacherRole = currentRole === 'teacher';

  return (
    <div className="space-y-4">
      {/* Selectors - Sticky at Top */}
      <div className="sticky top-0 z-30 bg-white p-4 rounded-xl border border-slate-100 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] font-semibold text-slate-600 block mb-1">ជ្រើសរើសថ្នាក់ (Select Class)</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-700"
          >
            {displayClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-slate-600 block mb-1">ជ្រើសរើសខែសិក្សា (Select Month)</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-700"
          >
            <option value="2026-04">មេសា • April 2026</option>
            <option value="2026-05">ឧសភា • May 2026</option>
            <option value="2026-06">មិថុនា • June 2026</option>
          </select>
        </div>
      </div>

      {/* EXCEL STYLE CONSOLIDATED GRADE SHEET FOR SELECTED CLASS */}
      <div id="excel-grade-sheet-container" className="bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden h-[calc(100vh-200px)] flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-none shrink-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="font-extrabold text-[14px] uppercase tracking-wider text-slate-750">តារាងរង្វាយតម្លៃពិន្ទុសិស្សរួមប្រចាំថ្នាក់</h3>
              <p className="text-[13px] text-slate-500 mt-0.5 font-medium">ថ្នាក់ {matchedClass?.name} សម្រាប់ខែ {selectedMonth}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 relative">
          <table className="min-w-full border-collapse border border-slate-200/50 text-left text-[13px] font-semibold text-slate-800 bg-white">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#104ac0] text-white font-extrabold border-b border-slate-200 text-center text-[13px]">
                <th className="border border-slate-200/60 p-3 text-center w-14 bg-[#104ac0] font-extrabold text-white">ល.រ</th>
                <th className="border border-slate-200/60 p-3 text-center w-24 bg-[#104ac0] font-extrabold text-white">អត្តលេខ</th>
                <th className="border border-slate-200/60 p-3 text-center w-16 bg-[#104ac0] font-extrabold text-white">រូបថត</th>
                <th className="border border-slate-200/60 p-3 text-left min-w-[200px] bg-[#104ac0] font-extrabold text-white">គោត្តនាម-នាម</th>
                <th className="border border-slate-200/60 p-3 text-center w-16 bg-[#104ac0] font-extrabold text-white">ភេទ</th>
                <th className="border border-slate-200/60 p-3 text-center w-36 bg-[#104ac0] font-extrabold text-white">ថ្ងៃខែឆ្នាំកំណើត</th>
                
                {/* Dynamically render each subject name */}
                {classSubjects.map(sub => {
                  return (
                    <th key={sub.id} className="border border-slate-200/60 p-3 text-center bg-[#104ac0] min-w-[100px] text-white font-extrabold">
                      <span className="block text-[13px] font-extrabold leading-tight">{sub.khmerName}</span>
                    </th>
                  );
                })}

                <th className="border border-slate-200/60 p-3 text-center bg-[#104ac0] text-white font-extrabold w-28">ពិន្ទុសរុប</th>
                <th className="border border-slate-200/60 p-3 text-center bg-[#104ac0] text-white font-extrabold w-28">មធ្យមភាគ</th>
                <th className="border border-slate-200/60 p-3 text-center bg-[#104ac0] text-white font-extrabold w-24">ចំណាត់ថ្នាក់</th>
                <th className="border border-slate-200/60 p-3 text-center bg-[#104ac0] text-white font-extrabold w-20">និទ្ទេស</th>
                <th className="border border-slate-200/60 p-3 text-center w-28 bg-[#104ac0] text-white font-extrabold">សន្លឹកពិន្ទុ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length > 0 ? (
                classStudents.map((student, idx) => {
                  const sScoreObj = scores.find(s => s.studentId === student.id && s.classId === selectedClassId && s.month === selectedMonth);
                  
                  // Compute dynamic weighted average and sum for maximum reliability and sync
                  let calculatedTotal = 0;
                  let calculatedAvg = 0;
                  let gradeLetter = '-';
                  
                  if (sScoreObj) {
                    calculatedAvg = sScoreObj.averageScore;
                    let sumOfWeighted = 0;
                    classSubjects.forEach(sub => {
                      const totalSubScore = sScoreObj.scores.find(sc => sc.subjectId === sub.id)?.totalScore || 0;
                      const mult = getSubjectMultiplier(sub.id, sub.khmerName);
                      sumOfWeighted += (totalSubScore * mult);
                    });
                    calculatedTotal = Math.round(sumOfWeighted * 100) / 100;
                    
                    if (sScoreObj.averageScore >= 90) gradeLetter = 'A';
                    else if (sScoreObj.averageScore >= 80) gradeLetter = 'B';
                    else if (sScoreObj.averageScore >= 70) gradeLetter = 'C';
                    else if (sScoreObj.averageScore >= 50) gradeLetter = 'D';
                    else gradeLetter = 'F';
                  }

                  // Live rank lookup
                  const classScoresForMonth = scores.filter(s => s.classId === selectedClassId && s.month === selectedMonth);
                  const sortedScores = [...classScoresForMonth].sort((a, b) => b.averageScore - a.averageScore);
                  const dynamicRankIndex = sortedScores.findIndex(s => s.studentId === student.id);
                  const rankDisplayValue = dynamicRankIndex !== -1 ? dynamicRankIndex + 1 : sScoreObj?.rank;

                  const formattedGender = student.gender === 'F' ? 'ស្រី' : 'ប្រុស';

                  return (
                    <tr key={student.id} className={`hover:bg-slate-50/50 transition-all font-semibold ${activeStudentId === student.id ? 'bg-indigo-50/10' : ''}`}>
                      <td className="border border-slate-100 p-3 text-center text-slate-900 font-bold text-[13px]">{idx + 1}</td>
                      <td className="border border-slate-100 p-3 text-center font-mono font-bold text-slate-750 text-[13px]">{student.id}</td>
                      <td className="border border-slate-100 p-1 bg-slate-50/30 text-center">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt="" className="w-9 h-9 rounded-md object-cover mx-auto border border-slate-200 shadow-3xs" />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-500 font-extrabold flex items-center justify-center font-mono text-[13px] mx-auto border border-slate-200 shadow-3xs">
                            {student.englishName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-100 p-3 text-left">
                        <span className="block text-[13px] font-bold text-slate-950">{student.khmerName}</span>
                        <span className="block text-[13px] text-slate-450 font-mono font-semibold uppercase tracking-wide mt-1">{student.englishName}</span>
                      </td>
                      <td className="border border-slate-100 p-3 text-center font-bold text-slate-900 text-[13px]">
                        {formattedGender}
                      </td>
                      <td className="border border-slate-100 p-3 text-center font-mono text-slate-650 text-[13px]">{student.dob}</td>
                      
                      {/* Individual Subject columns with direct score entry */}
                      {classSubjects.map(sub => {
                        const scoreItem = sScoreObj?.scores.find(sc => sc.subjectId === sub.id);
                        return (
                          <td key={sub.id} className="border border-slate-100 p-0 text-center bg-white min-w-[100px]">
                            <input
                              type="number"
                              disabled={!isTeacherRole}
                              value={scoreItem ? (scoreItem.totalScore || '') : ''}
                              placeholder="-"
                              onChange={(e) => handleInlineScoreUpdate(student.id, sub.id, Number(e.target.value))}
                              className="w-full text-center font-bold font-mono focus:bg-indigo-50/30 border-0 outline-none focus:outline-none focus:ring-1 focus:ring-indigo-550 py-3.5 text-slate-950 bg-transparent text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                            />
                          </td>
                        );
                      })}
                      
                      <td className="border border-slate-100 p-3 text-center font-bold font-mono text-slate-900 text-[13px]">
                        {sScoreObj ? calculatedTotal : <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="border border-slate-100 p-3 text-center font-bold font-mono text-indigo-950 text-[13px]">
                        {sScoreObj ? calculatedAvg : <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="border border-slate-100 p-3 text-center font-bold font-mono text-amber-950 text-[13px]">
                        {rankDisplayValue ? rankDisplayValue : <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="border border-slate-100 p-3 text-center font-bold font-mono text-emerald-950 text-[13px]">
                        {sScoreObj ? gradeLetter : <span className="text-slate-300 italic">-</span>}
                      </td>
                      <td className="border border-slate-100 p-2 text-center">
                        {sScoreObj ? (
                          <button
                            onClick={() => setActiveReportCard(sScoreObj)}
                            className="bg-[#0B1E43] text-white rounded-md hover:bg-slate-900 text-[13px] font-bold px-3 py-2 flex items-center gap-1.5 mx-auto cursor-pointer border-none shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Printer className="w-3 h-3" />
                            <span>ព្រីនស្លីប</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11 + classSubjects.length} className="text-center p-8 text-slate-400 italic text-[13px]">
                    មិនទាន់មានសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT CARD PRINTOUT CERTIFICATE MODAL */}
      {activeReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            {/* Cambodian Ministry Style Frame */}
            <div className="p-8 space-y-6" id="printable-cambodian-report-card">
              <div className="text-center font-semibold">
                <span className="text-[14px] uppercase font-bold text-slate-400 tracking-widest block">ព្រះរាជាណាចក្រកម្ពុជា • Kingdom of Cambodia</span>
                <span className="text-[14px] font-bold text-slate-500 block mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</span>
                <div className="w-16 h-0.5 bg-brand-500 mx-auto my-3"></div>
                <h2 className="text-lg font-black text-[#03487c] tracking-widest font-sans">សាលារៀន ព្រីវ៉េត អុីនធឺណេសិនណល</h2>
                <h3 className="text-xs uppercase text-slate-400 font-mono tracking-wider mt-0.5">Elite Private International Academy</h3>
                <h1 className="text-base font-extrabold text-gold-600 border border-gold-500 px-4 py-1.5 inline-block rounded-lg mt-3 bg-gold-50/20">
                  ព្រឹត្តិបត្រពិន្ទុព្រឹត្តិបត្រសិក្សា • STUDENT REPORT CARD
                </h1>
              </div>

              {/* Student Metadata Table */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-[14px] text-slate-700 grid grid-cols-2 gap-y-2.5 gap-x-4">
                <div>
                  <span className="text-slate-400 block text-[14px]">ឈ្មោះខ្មែរ (Name)៖</span>
                  <span className="font-extrabold text-slate-900 block mt-0.5">
                    {students.find(s => s.id === activeReportCard.studentId)?.khmerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[14px]">ឈ្មោះអង់គ្លេស (Latin)៖</span>
                  <span className="font-bold text-slate-800 font-mono block mt-0.5">
                    {students.find(s => s.id === activeReportCard.studentId)?.englishName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[14px]">អត្តលេខសិស្ស (Student ID)៖</span>
                  <span className="font-bold font-mono text-brand-700 block mt-0.5">{activeReportCard.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[14px]">កម្រិតថ្នាក់ (Class Group)៖</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{matchedClass?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[14px]">ខែរៀន (Study month)៖</span>
                  <span className="font-bold text-slate-700 block mt-0.5">{activeReportCard.month}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[14px]">លំដាប់ថ្នាក់ Rank (Ranking)៖</span>
                  <span className="font-black text-[#03487c] text-[14px] block mt-0.5">
                    {activeReportCard.rank ? `លេខ ${activeReportCard.rank} / ${classStudents.length} នាក់` : 'បោះឆ្នោតទាន់'}
                  </span>
                </div>
              </div>

              {/* Roster matrix grades table */}
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[14px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-center">
                      <th className="p-2.5 text-left">មុខវិជ្ជា (Subject)</th>
                      <th className="p-2.5">វត្តមាន 10%</th>
                      <th className="p-2.5">កិច្ចការផ្ទះ 20%</th>
                      <th className="p-2.5">ពាក់កណ្តាល 30%</th>
                      <th className="p-2.5">ប្រលងឆមាស 40%</th>
                      <th className="p-2.5 text-right">សរុប weighted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-center">
                    {activeReportCard.scores.map(sc => {
                      const maybeSubject = subjects.find(s => s.id === sc.subjectId);
                      return (
                        <tr key={sc.subjectId} className="hover:bg-slate-50/20">
                          <td className="p-2.5 text-left font-bold text-slate-900 border-r border-slate-100 text-[14px]">
                            {maybeSubject ? maybeSubject.khmerName : sc.subjectId}
                          </td>
                          <td className="p-2.5 font-mono text-slate-500 text-[14px]">{sc.attendanceScore}</td>
                          <td className="p-2.5 font-mono text-slate-500 text-[14px]">{sc.homeworkScore}</td>
                          <td className="p-2.5 font-mono text-slate-500 text-[14px]">{sc.midtermScore}</td>
                          <td className="p-2.5 font-mono text-slate-500 text-[14px]">{sc.finalScore}</td>
                          <td className="p-2.5 text-right font-black text-slate-900 font-mono text-[14px]">
                            {sc.totalScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Weighted totals and core outcomes */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="bg-emerald-50 rounded-lg p-3 text-emerald-800 text-[14px] border border-emerald-100">
                  <span className="font-bold text-[14px] uppercase block text-emerald-600">ពិន្ទុមធ្យមភាគសរុប (Monthly Average Score)</span>
                  <span className="text-[14px] font-black font-mono block mt-1">{activeReportCard.averageScore} / 100</span>
                </div>
                <div className="bg-sky-50 rounded-lg p-3 text-sky-800 text-[14px] border border-sky-100">
                  <span className="font-bold text-[14px] uppercase block text-sky-600">សរុបនិទ្ទេស (Weighted Grade)</span>
                  <span className="text-[14px] font-black block mt-1">
                    {activeReportCard.averageScore >= 90 ? 'និទ្ទេស A (Excellent)' :
                     activeReportCard.averageScore >= 80 ? 'និទ្ទេស B (Good)' :
                     activeReportCard.averageScore >= 70 ? 'និទ្ទេស C (Average)' :
                     activeReportCard.averageScore >= 50 ? 'និទ្ទេស D (Pass)' : 'និទ្ទេស F (Fail)'}
                  </span>
                </div>
              </div>

              {/* Remarks block */}
              <div className="text-[14px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[14px] font-bold text-slate-400 block uppercase">មតិប្រធានថ្នាក់/សាស្រ្តាចារ្យ (Principal & Teacher Remarks)</span>
                <p className="font-bold mt-1 text-slate-800 italic text-[14px]">
                  &ldquo; {activeReportCard.teacherRemarks || 'សិស្សមានវត្តមានសិក្សាគ្រប់គ្រាន់យល់ដឹង និងខិតខំប្រឹងប្រែង។'} &rdquo;
                </p>
              </div>

              {/* Study Card Khmer Footer Seals */}
              <div className="grid grid-cols-3 text-center text-[14px] font-bold pt-6 text-slate-400">
                <div>
                  <span>សិស្សសាមី (Student)</span>
                  <div className="h-14"></div>
                  <span className="text-slate-500 font-bold block mt-1 text-[14px]">គង់ គឹមហេង</span>
                </div>
                <div>
                  <span>គ្រូបង្រៀន (Teacher)</span>
                  <div className="h-14"></div>
                  <span className="text-slate-500 font-bold block mt-1 text-[14px]">
                    {teachers.find(t => t.id === matchedClass?.teacherId)?.englishName || 'Chhim Borith'}
                  </span>
                </div>
                <div>
                  <span className="text-[14px] text-slate-500 font-black">នាយកសាលា (Director Seal)</span>
                  <div className="h-14 flex items-center justify-center relative">
                    {/* Simulated visual red circular Ministry stamp */}
                    <div className="absolute w-12 h-12 border-2 border-dashed border-red-500 rounded-full flex items-center justify-center opacity-40 transform rotate-12 text-red-500 font-bold text-[8px] font-sans">
                      ELITE ACADEMY
                    </div>
                  </div>
                  <span className="text-slate-500 font-bold block mt-1 text-[14px]">KEO SOPHEA</span>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                ព្រីនតេស្ត (Print Study Card)
              </button>
              <button
                onClick={() => setActiveReportCard(null)}
                className="px-4 py-2 border border-slate-200 text-[14px] text-slate-600 bg-white rounded-xl hover:text-slate-800 cursor-pointer"
              >
                បិទ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
