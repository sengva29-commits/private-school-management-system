/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'accountant' | 'student_parent';

export type StudentStatus = 'active' | 'suspended' | 'drop' | 'graduated';

export interface Student {
  id: string; // e.g., "STD0001"
  khmerName: string;
  englishName: string;
  gender: 'M' | 'F';
  dob: string;
  address: string;
  phone: string;
  photoUrl: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  status: StudentStatus;
  enrolledClasses: string[]; // List of class IDs
}

export interface Subject {
  id: string;
  name: string;
  khmerName: string;
}

export interface Class {
  id: string; // e.g., "CLS001"
  name: string; // e.g., "Grade 7A"
  subjects: string[]; // Subject IDs
  scheduleDays: string[]; // e.g., ["Mon", "Wed", "Fri"]
  scheduleTime: string; // e.g., "08:00 AM - 10:00 AM"
  room: string;
  teacherId: string; // Main class teacher ID
  fee: number; // Monthly fee in USD or Total Program fee
}

export interface Teacher {
  id: string; // e.g., "TCH001"
  khmerName: string;
  englishName: string;
  phone: string;
  salary: number; // Monthly salary in USD
  subjects: string[]; // List of subject names or IDs they teach
  joinedDate: string;
  photoUrl?: string;
}

export interface InvoiceInstallment {
  installmentNumber: number; // 1, 2, 3, etc.
  amount: number; // Amount owed for this installment
  dueDate: string;
  paidAmount: number;
  paidDate?: string;
  status: 'unpaid' | 'paid';
  receiptNumber?: string;
  collectedByTeacherId?: string; // If collected directly by a teacher
}

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface Invoice {
  id: string; // e.g., "INV2026001"
  studentId: string;
  classId: string;
  courseName: string;
  totalAmount: number;
  discount: number; // discount amount in USD
  installments: InvoiceInstallment[];
  paidAmount: number;
  remainingBalance: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface Payment {
  id: string; // e.g., "PM260001"
  invoiceId: string;
  installmentNumber: number;
  receiptId: string;
  studentId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'aba' | 'acleda' | 'wing';
  transactionId?: string; // QR code reference, ABA reference number, etc.
  collectedByUserId: string; // Can be accountant, school admin, or teacher
  collectedByUserRole: UserRole;
  isVerified: boolean; // Verified by Accountant
  verifiedAt?: string;
}

export interface Receipt {
  id: string; // e.g., "RCT260001"
  paymentId: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  className: string;
  installmentNumber: number;
  amountPaid: number;
  remainingBalance: number;
  collectedBy: string; // User's name
  date: string;
  qrVerifyToken: string; // MD5/UUID hash representing secure verification
  isApproved: boolean; // Cannot edit after approval
}

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface DailyAttendance {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
  takenById: string; // Teacher or school admin
  takenByName: string;
}

export interface SubjectScore {
  subjectId: string;
  attendanceScore: number; // 10% (0-100 scale then weighted)
  homeworkScore: number;  // 20%
  midtermScore: number;   // 30%
  finalScore: number;     // 40%
  totalScore: number;     // calculated out of 100
}

export interface StudentMonthlyScore {
  id: string; // e.g., "SCR0001"
  studentId: string;
  classId: string;
  month: string; // e.g., "2026-05" (May 2026)
  scores: SubjectScore[];
  averageScore: number;
  rank?: number;
  teacherRemarks?: string;
  isFinalized: boolean; // Locked by Accountant or Admin
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g., "APPROVE_PAYMENT", "UPDATE_SCORE", "DELETE_STUDENT"
  details: string; // description of changes
  ipAddress: string;
  device: string;
}
