/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Teacher, Subject, Class, Invoice, Payment, Receipt, DailyAttendance, StudentMonthlyScore, AuditLog, UserRole } from './types';

// Default subjects
export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'SUB001', name: 'Mathematics', khmerName: 'គណិតវិទ្យា' },
  { id: 'SUB002', name: 'Khmer Literature', khmerName: 'អក្សរសាស្ត្រខ្មែរ' },
  { id: 'SUB003', name: 'English Grammar', khmerName: 'វេយ្យាករណ៍អង់គ្លេស' },
  { id: 'SUB004', name: 'Computer Basics', khmerName: 'កុំព្យូទ័រមូលដ្ឋាន' },
  { id: 'SUB005', name: 'Science', khmerName: 'វិទ្យាសាស្ត្រ' }
];

// Prepopulated Teachers
export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'TCH001',
    khmerName: 'ឈឹម បូរិទ្ធ',
    englishName: 'Chhim Borith',
    phone: '012 888 777',
    salary: 450,
    subjects: ['SUB001', 'SUB005'],
    joinedDate: '2024-09-01',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH002',
    khmerName: 'មាស រតនា',
    englishName: 'Meas Ratana',
    phone: '017 555 111',
    salary: 380,
    subjects: ['SUB003'],
    joinedDate: '2025-01-15',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH003',
    khmerName: 'លាង ម៉ានិច',
    englishName: 'Leang Manich',
    phone: '098 444 333',
    salary: 400,
    subjects: ['SUB002', 'SUB004'],
    joinedDate: '2024-11-01',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH004',
    khmerName: 'សេង វណ្ណដា',
    englishName: 'Seng Vanda',
    phone: '012 345 678',
    salary: 500,
    subjects: ['SUB001'],
    joinedDate: '2024-05-01',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH005',
    khmerName: 'កែវ សុខា',
    englishName: 'Keo Sokha',
    phone: '092 111 222',
    salary: 420,
    subjects: ['SUB002'],
    joinedDate: '2024-06-15',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH006',
    khmerName: 'ចាន់ ដារ៉ា',
    englishName: 'Chan Dara',
    phone: '015 666 777',
    salary: 480,
    subjects: ['SUB003', 'SUB004'],
    joinedDate: '2023-08-10',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH007',
    khmerName: 'ទេព ផល្លា',
    englishName: 'Tep Phalla',
    phone: '077 999 000',
    salary: 410,
    subjects: ['SUB005'],
    joinedDate: '2024-01-20',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH008',
    khmerName: 'ឡុង វាសនា',
    englishName: 'Long Veasna',
    phone: '085 222 333',
    salary: 460,
    subjects: ['SUB001', 'SUB004'],
    joinedDate: '2024-10-05',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH009',
    khmerName: 'ស៊ូ ស្រីលីន',
    englishName: 'Sou Sreylin',
    phone: '010 333 444',
    salary: 430,
    subjects: ['SUB002', 'SUB003'],
    joinedDate: '2025-02-01',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH010',
    khmerName: 'លី ម៉េងហួរ',
    englishName: 'Ly Menghour',
    phone: '012 444 555',
    salary: 450,
    subjects: ['SUB001'],
    joinedDate: '2023-11-15',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH011',
    khmerName: 'ណាំ តុលា',
    englishName: 'Nam Tola',
    phone: '070 555 666',
    salary: 400,
    subjects: ['SUB005'],
    joinedDate: '2024-12-10',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH012',
    khmerName: 'អ៊ុំ ចរិយា',
    englishName: 'Um Choriya',
    phone: '093 777 888',
    salary: 440,
    subjects: ['SUB002', 'SUB005'],
    joinedDate: '2024-03-12',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH013',
    khmerName: 'ឃីម សុធារី',
    englishName: 'Khim Sotheary',
    phone: '099 888 999',
    salary: 420,
    subjects: ['SUB003'],
    joinedDate: '2024-07-18',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH014',
    khmerName: 'ញ៉ែម ពិសិដ្ឋ',
    englishName: 'Nhem Piseth',
    phone: '012 999 111',
    salary: 470,
    subjects: ['SUB001', 'SUB004'],
    joinedDate: '2023-09-25',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH015',
    khmerName: 'សេង ស្រីម៉ៅ',
    englishName: 'Seng Sreymao',
    phone: '088 111 222',
    salary: 410,
    subjects: ['SUB002'],
    joinedDate: '2025-03-01',
    photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH016',
    khmerName: 'ទួន ចាន់ថុល',
    englishName: 'Tuon Chanthol',
    phone: '098 777 999',
    salary: 490,
    subjects: ['SUB004', 'SUB005'],
    joinedDate: '2024-04-30',
    photoUrl: 'https://images.unsplash.com/photo-1504257404165-04254b759bef?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH017',
    khmerName: 'ងួន សុជាតិ',
    englishName: 'Nguon Socheat',
    phone: '017 222 444',
    salary: 460,
    subjects: ['SUB001', 'SUB003'],
    joinedDate: '2023-05-15',
    photoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH018',
    khmerName: 'អ៊ុង វុទ្ធី',
    englishName: 'Ung Vuthy',
    phone: '092 333 555',
    salary: 430,
    subjects: ['SUB002'],
    joinedDate: '2024-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH019',
    khmerName: 'កែវ លីដា',
    englishName: 'Keo Lida',
    phone: '078 444 666',
    salary: 420,
    subjects: ['SUB003', 'SUB005'],
    joinedDate: '2024-11-25',
    photoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH020',
    khmerName: 'លឹម បុប្ផា',
    englishName: 'Lim Bopha',
    phone: '085 555 777',
    salary: 450,
    subjects: ['SUB001', 'SUB004'],
    joinedDate: '2025-01-05',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250'
  }
];

// Prepopulated Classes
export const DEFAULT_CLASSES: Class[] = [
  {
    id: 'CLS001',
    name: 'Grade 7A',
    subjects: ['SUB001', 'SUB002', 'SUB005'],
    scheduleDays: ['Mon', 'Wed', 'Fri'],
    scheduleTime: '08:00 AM - 11:00 AM',
    room: 'Room 302',
    teacherId: 'TCH001',
    fee: 300 // $300 installment split (e.g., $100 x 3 installments)
  },
  {
    id: 'CLS002',
    name: 'English Level Intermediate',
    subjects: ['SUB003'],
    scheduleDays: ['Tue', 'Thu'],
    scheduleTime: '01:30 PM - 03:00 PM',
    room: 'Room 105',
    teacherId: 'TCH002',
    fee: 150 // Split $50 x 3 installments
  },
  {
    id: 'CLS003',
    name: 'Computer Basics Suite',
    subjects: ['SUB004'],
    scheduleDays: ['Sat', 'Sun'],
    scheduleTime: '09:00 AM - 11:00 AM',
    room: 'Lab 1',
    teacherId: 'TCH003',
    fee: 90 // Split $30 x 3 installments
  }
];

// Prepopulated Students with unique profile avatars
export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'STD0001',
    khmerName: 'គង់ គឹមហេង',
    englishName: 'Kong Kimheng',
    gender: 'M',
    dob: '2012-04-12',
    address: 'ផ្ទះលេខ 24, ផ្លូវ 110, សង្កាត់វត្តភ្នំ, ភ្នំពេញ',
    phone: '096 888 1234',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    parentName: 'គង់ សុផា',
    parentPhone: '012 345 678',
    enrollmentDate: '2025-01-05',
    status: 'active',
    enrolledClasses: ['CLS001', 'CLS002']
  },
  {
    id: 'STD0002',
    khmerName: 'សេង ស្រីណុច',
    englishName: 'Seng Sreynoch',
    gender: 'F',
    dob: '2013-09-22',
    address: 'បុរីពិភពថ្មី ចំការដូង, ភ្នំពេញ',
    phone: '088 777 5678',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    parentName: 'លឹម ជា',
    parentPhone: '095 898 321',
    enrollmentDate: '2025-02-10',
    status: 'active',
    enrolledClasses: ['CLS001', 'CLS003']
  },
  {
    id: 'STD0003',
    khmerName: 'ជា ចាន់ត្រា',
    englishName: 'Chea Chantra',
    gender: 'M',
    dob: '2011-06-30',
    address: 'ផ្ទះល្វែង ផ្លូវ ២៧១, សង្កាត់ទឹកថ្លា, ភ្នំពេញ',
    phone: '099 222 333',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    parentName: 'ជា ធានី',
    parentPhone: '015 999 888',
    enrollmentDate: '2024-11-20',
    status: 'active',
    enrolledClasses: ['CLS002']
  },
  {
    id: 'STD0004',
    khmerName: 'សុវណ្ណ ម៉ារីណា',
    englishName: 'Sovann Marina',
    gender: 'F',
    dob: '2012-11-15',
    address: 'ខណ្ឌពោធិ៍សែនជ័យ, ភ្នំពេញ',
    phone: '093 121 454',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    parentName: 'សុវណ្ណ តារា',
    parentPhone: '012 909 090',
    enrollmentDate: '2025-01-12',
    status: 'active',
    enrolledClasses: ['CLS001', 'CLS002', 'CLS003']
  },
  {
    id: 'STD0005',
    khmerName: 'សៀង ហុង',
    englishName: 'Seang Hong',
    gender: 'M',
    dob: '2012-01-18',
    address: 'ផ្ទះ កែវចិន្តា, ជ្រោយចង្វារ, ភ្នំពេញ',
    phone: '012 777 999',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    parentName: 'សៀង សុជាតិ',
    parentPhone: '017 333 444',
    enrollmentDate: '2025-03-01',
    status: 'active',
    enrolledClasses: ['CLS003']
  }
];

// Prepopulated Invoices with multi-stage installment setups
export const DEFAULT_INVOICES: Invoice[] = [
  // Kong Kimheng - CLS001 ($300)
  {
    id: 'INV2026001',
    studentId: 'STD0001',
    classId: 'CLS001',
    courseName: 'Grade 7A',
    totalAmount: 300,
    discount: 10, // $10 discount -> Total $290, let's distribute as 100, 100, 90
    paidAmount: 200,
    remainingBalance: 90,
    status: 'partial',
    createdAt: '2026-02-01',
    installments: [
      { installmentNumber: 1, amount: 100, dueDate: '2026-03-01', paidAmount: 100, status: 'paid', paidDate: '2026-02-28', receiptNumber: 'RCT26001', collectedByTeacherId: 'TCH001' },
      { installmentNumber: 2, amount: 100, dueDate: '2026-04-15', paidAmount: 100, status: 'paid', paidDate: '2026-04-12', receiptNumber: 'RCT26004', collectedByTeacherId: 'TCH001' },
      { installmentNumber: 3, amount: 90, dueDate: '2026-06-01', paidAmount: 0, status: 'unpaid' }
    ]
  },
  // Kong Kimheng - CLS002 ($150)
  {
    id: 'INV2026002',
    studentId: 'STD0001',
    classId: 'CLS002',
    courseName: 'English Level Intermediate',
    totalAmount: 150,
    discount: 0,
    paidAmount: 150,
    remainingBalance: 0,
    status: 'paid',
    createdAt: '2026-02-01',
    installments: [
      { installmentNumber: 1, amount: 50, dueDate: '2026-03-01', paidAmount: 50, status: 'paid', paidDate: '2026-03-01', receiptNumber: 'RCT26002', collectedByTeacherId: 'TCH002' },
      { installmentNumber: 2, amount: 50, dueDate: '2026-04-01', paidAmount: 50, status: 'paid', paidDate: '2026-03-29', receiptNumber: 'RCT26005', collectedByTeacherId: 'TCH002' },
      { installmentNumber: 3, amount: 50, dueDate: '2026-05-01', paidAmount: 50, status: 'paid', paidDate: '2026-04-30', receiptNumber: 'RCT26008', collectedByTeacherId: 'TCH002' }
    ]
  },
  // Seng Sreynoch - CLS001 ($300)
  {
    id: 'INV2026003',
    studentId: 'STD0002',
    classId: 'CLS001',
    courseName: 'Grade 7A',
    totalAmount: 300,
    discount: 0,
    paidAmount: 100,
    remainingBalance: 200,
    status: 'partial',
    createdAt: '2026-02-15',
    installments: [
      { installmentNumber: 1, amount: 100, dueDate: '2026-03-15', paidAmount: 100, status: 'paid', paidDate: '2026-03-14', receiptNumber: 'RCT26003', collectedByTeacherId: 'TCH001' },
      { installmentNumber: 2, amount: 100, dueDate: '2026-05-15', paidAmount: 0, status: 'unpaid' }, // Overdue!
      { installmentNumber: 3, amount: 100, dueDate: '2026-07-15', paidAmount: 0, status: 'unpaid' }
    ]
  },
  // Chea Chantra - CLS002 ($150)
  {
    id: 'INV2026004',
    studentId: 'STD0003',
    classId: 'CLS002',
    courseName: 'English Level Intermediate',
    totalAmount: 150,
    discount: 15, // $15 discount -> $135 (45 x 3)
    paidAmount: 45,
    remainingBalance: 90,
    status: 'partial',
    createdAt: '2026-02-22',
    installments: [
      { installmentNumber: 1, amount: 45, dueDate: '2026-03-01', paidAmount: 45, status: 'paid', paidDate: '2026-02-28', receiptNumber: 'RCT26006', collectedByTeacherId: 'TCH002' },
      { installmentNumber: 2, amount: 45, dueDate: '2026-05-01', paidAmount: 0, status: 'unpaid' }, // Overdue
      { installmentNumber: 3, amount: 45, dueDate: '2026-07-01', paidAmount: 0, status: 'unpaid' }
    ]
  },
  // Sovann Marina - CLS001 ($300)
  {
    id: 'INV2026005',
    studentId: 'STD0004',
    classId: 'CLS001',
    courseName: 'Grade 7A',
    totalAmount: 300,
    discount: 30, // $270 (90 x 3)
    paidAmount: 90,
    remainingBalance: 180,
    status: 'partial',
    createdAt: '2026-02-05',
    installments: [
      { installmentNumber: 1, amount: 90, dueDate: '2026-03-05', paidAmount: 90, status: 'paid', paidDate: '2026-03-02', receiptNumber: 'RCT26007', collectedByTeacherId: 'TCH001' },
      { installmentNumber: 2, amount: 90, dueDate: '2026-05-05', paidAmount: 0, status: 'unpaid' }, // Overdue
      { installmentNumber: 3, amount: 90, dueDate: '2026-07-05', paidAmount: 0, status: 'unpaid' }
    ]
  },
  // Seang Hong - CLS003 ($90)
  {
    id: 'INV2026006',
    studentId: 'STD0005',
    classId: 'CLS003',
    courseName: 'Computer Basics Suite',
    totalAmount: 90,
    discount: 0,
    paidAmount: 0,
    remainingBalance: 90,
    status: 'unpaid',
    createdAt: '2026-03-05',
    installments: [
      { installmentNumber: 1, amount: 30, dueDate: '2026-04-05', paidAmount: 0, status: 'unpaid' }, // Overdue
      { installmentNumber: 2, amount: 30, dueDate: '2026-05-05', paidAmount: 0, status: 'unpaid' }, // Overdue
      { installmentNumber: 3, amount: 30, dueDate: '2026-06-05', paidAmount: 0, status: 'unpaid' }
    ]
  }
];

// Prepopulated Receipts matching installments
export const DEFAULT_RECEIPTS: Receipt[] = [
  {
    id: 'RCT26001',
    paymentId: 'PM26001',
    invoiceId: 'INV2026001',
    studentId: 'STD0001',
    studentName: 'Kong Kimheng',
    className: 'Grade 7A',
    installmentNumber: 1,
    amountPaid: 100,
    remainingBalance: 190,
    collectedBy: 'Chhim Borith',
    date: '2026-02-28 09:30 AM',
    qrVerifyToken: 'verify-rct26001-f2f3f4',
    isApproved: true
  },
  {
    id: 'RCT26002',
    paymentId: 'PM26002',
    invoiceId: 'INV2026002',
    studentId: 'STD0001',
    studentName: 'Kong Kimheng',
    className: 'English Level Intermediate',
    installmentNumber: 1,
    amountPaid: 50,
    remainingBalance: 100,
    collectedBy: 'Meas Ratana',
    date: '2026-03-01 14:15 PM',
    qrVerifyToken: 'verify-rct26002-a1b2c3',
    isApproved: true
  },
  {
    id: 'RCT26003',
    paymentId: 'PM26003',
    invoiceId: 'INV2026003',
    studentId: 'STD0002',
    studentName: 'Seng Sreynoch',
    className: 'Grade 7A',
    installmentNumber: 1,
    amountPaid: 100,
    remainingBalance: 200,
    collectedBy: 'Chhim Borith',
    date: '2026-03-14 10:00 AM',
    qrVerifyToken: 'verify-rct26003-8ad5c2',
    isApproved: true
  },
  {
    id: 'RCT26004',
    paymentId: 'PM26004',
    invoiceId: 'INV2026001',
    studentId: 'STD0001',
    studentName: 'Kong Kimheng',
    className: 'Grade 7A',
    installmentNumber: 2,
    amountPaid: 100,
    remainingBalance: 90,
    collectedBy: 'Chhim Borith',
    date: '2026-04-12 08:45 AM',
    qrVerifyToken: 'verify-rct26004-9ef01a',
    isApproved: true
  },
  {
    id: 'RCT26005',
    paymentId: 'PM26005',
    invoiceId: 'INV2026002',
    studentId: 'STD0001',
    studentName: 'Kong Kimheng',
    className: 'English Level Intermediate',
    installmentNumber: 2,
    amountPaid: 50,
    remainingBalance: 50,
    collectedBy: 'Meas Ratana',
    date: '2026-03-29 16:30 PM',
    qrVerifyToken: 'verify-rct26005-4ef24c',
    isApproved: true
  },
  {
    id: 'RCT26006',
    paymentId: 'PM26006',
    invoiceId: 'INV2026004',
    studentId: 'STD0003',
    studentName: 'Chea Chantra',
    className: 'English Level Intermediate',
    installmentNumber: 1,
    amountPaid: 45,
    remainingBalance: 90,
    collectedBy: 'Meas Ratana',
    date: '2026-02-28 15:40 PM',
    qrVerifyToken: 'verify-rct26006-2cd38f',
    isApproved: true
  },
  {
    id: 'RCT26007',
    paymentId: 'PM26007',
    invoiceId: 'INV2026005',
    studentId: 'STD0004',
    studentName: 'Sovann Marina',
    className: 'Grade 7A',
    installmentNumber: 1,
    amountPaid: 90,
    remainingBalance: 180,
    collectedBy: 'Chhim Borith',
    date: '2026-03-02 08:30 AM',
    qrVerifyToken: 'verify-rct26007-bb891d',
    isApproved: true
  },
  {
    id: 'RCT26008',
    paymentId: 'PM26008',
    invoiceId: 'INV2026002',
    studentId: 'STD0001',
    studentName: 'Kong Kimheng',
    className: 'English Level Intermediate',
    installmentNumber: 3,
    amountPaid: 50,
    remainingBalance: 0,
    collectedBy: 'Meas Ratana',
    date: '2026-04-30 14:00 PM',
    qrVerifyToken: 'verify-rct26008-8ee7ac',
    isApproved: true
  }
];

// Prepopulated Payments records
export const DEFAULT_PAYMENTS: Payment[] = [
  { id: 'PM26001', invoiceId: 'INV2026001', installmentNumber: 1, receiptId: 'RCT26001', studentId: 'STD0001', amountPaid: 100, paymentDate: '2026-02-28', paymentMethod: 'cash', collectedByUserId: 'TCH001', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-02-28' },
  { id: 'PM26002', invoiceId: 'INV2026002', installmentNumber: 1, receiptId: 'RCT26002', studentId: 'STD0001', amountPaid: 50, paymentDate: '2026-03-01', paymentMethod: 'aba', transactionId: 'ABA-TRX55421', collectedByUserId: 'TCH002', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-03-01' },
  { id: 'PM26003', invoiceId: 'INV2026003', installmentNumber: 1, receiptId: 'RCT26003', studentId: 'STD0002', amountPaid: 100, paymentDate: '2026-03-14', paymentMethod: 'cash', collectedByUserId: 'TCH001', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-03-14' },
  { id: 'PM26004', invoiceId: 'INV2026001', installmentNumber: 2, receiptId: 'RCT26004', studentId: 'STD0001', amountPaid: 100, paymentDate: '2026-04-12', paymentMethod: 'cash', collectedByUserId: 'TCH001', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-04-12' },
  { id: 'PM26005', invoiceId: 'INV2026002', installmentNumber: 2, receiptId: 'RCT26005', studentId: 'STD0001', amountPaid: 50, paymentDate: '2026-03-29', paymentMethod: 'wing', transactionId: 'WNG-83109312', collectedByUserId: 'TCH002', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-03-30' },
  { id: 'PM26006', invoiceId: 'INV2026004', installmentNumber: 1, receiptId: 'RCT26006', studentId: 'STD0003', amountPaid: 45, paymentDate: '2026-02-28', paymentMethod: 'acleda', transactionId: 'ACL-9912093', collectedByUserId: 'TCH002', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-02-28' },
  { id: 'PM26007', invoiceId: 'INV2026005', installmentNumber: 1, receiptId: 'RCT26007', studentId: 'STD0004', amountPaid: 90, paymentDate: '2026-03-02', paymentMethod: 'aba', transactionId: 'ABA-TRX92811', collectedByUserId: 'TCH001', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-03-02' },
  { id: 'PM26008', invoiceId: 'INV2026002', installmentNumber: 3, receiptId: 'RCT26008', studentId: 'STD0001', amountPaid: 50, paymentDate: '2026-04-30', paymentMethod: 'aba', transactionId: 'ABA-TRX10398', collectedByUserId: 'TCH002', collectedByUserRole: 'teacher', isVerified: true, verifiedAt: '2026-04-30' }
];

// Prepopulated Attendance lists
export const DEFAULT_ATTENDANCES: DailyAttendance[] = [
  {
    id: 'ATD001',
    classId: 'CLS001',
    date: '2026-05-25',
    takenById: 'TCH001',
    takenByName: 'Chhim Borith',
    records: [
      { studentId: 'STD0001', status: 'present' },
      { studentId: 'STD0002', status: 'late', remarks: 'យឺត ១០ នាទី (ឡានខូច)' },
      { studentId: 'STD0004', status: 'present' }
    ]
  },
  {
    id: 'ATD002',
    classId: 'CLS002',
    date: '2026-05-25',
    takenById: 'TCH002',
    takenByName: 'Meas Ratana',
    records: [
      { studentId: 'STD0001', status: 'present' },
      { studentId: 'STD0003', status: 'absent', remarks: 'សុំច្បាប់គ្រុនក្តៅ' },
      { studentId: 'STD0004', status: 'present' }
    ]
  },
  {
    id: 'ATD003',
    classId: 'CLS001',
    date: '2026-05-26',
    takenById: 'TCH001',
    takenByName: 'Chhim Borith',
    records: [
      { studentId: 'STD0001', status: 'present' },
      { studentId: 'STD0002', status: 'present' },
      { studentId: 'STD0004', status: 'absent', remarks: 'អវត្តមានគ្មានច្បាប់' }
    ]
  }
];

// Prepopulated Student Scores
export const DEFAULT_SCORES: StudentMonthlyScore[] = [
  {
    id: 'SCR001',
    studentId: 'STD0001',
    classId: 'CLS001',
    month: '2026-04',
    isFinalized: true,
    scores: [
      { subjectId: 'SUB001', attendanceScore: 90, homeworkScore: 85, midtermScore: 80, finalScore: 88, totalScore: 85.2 },
      { subjectId: 'SUB002', attendanceScore: 95, homeworkScore: 90, midtermScore: 88, finalScore: 92, totalScore: 90.7 },
      { subjectId: 'SUB005', attendanceScore: 90, homeworkScore: 80, midtermScore: 85, finalScore: 85, totalScore: 84.5 }
    ],
    averageScore: 86.8,
    rank: 1,
    teacherRemarks: 'សិស្សរៀនពូកែ និងមានវត្តមានទៀងទាត់'
  },
  {
    id: 'SCR002',
    studentId: 'STD0002',
    classId: 'CLS001',
    month: '2026-04',
    isFinalized: true,
    scores: [
      { subjectId: 'SUB001', attendanceScore: 80, homeworkScore: 75, midtermScore: 78, finalScore: 82, totalScore: 79.2 },
      { subjectId: 'SUB002', attendanceScore: 90, homeworkScore: 82, midtermScore: 80, finalScore: 85, totalScore: 83.4 },
      { subjectId: 'SUB005', attendanceScore: 85, homeworkScore: 70, midtermScore: 75, finalScore: 78, totalScore: 76.2 }
    ],
    averageScore: 79.6,
    rank: 3,
    teacherRemarks: 'គួរខិតខំប្រឹងប្រែងបន្ថែមលើផ្នែកគណិតវិទ្យា'
  },
  {
    id: 'SCR003',
    studentId: 'STD0004',
    classId: 'CLS001',
    month: '2026-04',
    isFinalized: true,
    scores: [
      { subjectId: 'SUB001', attendanceScore: 85, homeworkScore: 80, midtermScore: 86, finalScore: 85, totalScore: 84.3 },
      { subjectId: 'SUB002', attendanceScore: 92, homeworkScore: 88, midtermScore: 85, finalScore: 87, totalScore: 87.1 },
      { subjectId: 'SUB005', attendanceScore: 90, homeworkScore: 85, midtermScore: 84, finalScore: 83, totalScore: 84.1 }
    ],
    averageScore: 85.17,
    rank: 2,
    teacherRemarks: 'កែវភ្នែកប្រុងប្រយ័ត្ន និងឆ្លាតវៃ'
  }
];

// Prepopulated Audit Logs
export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'ALG001',
    timestamp: '2026-05-24 08:31 AM',
    userId: 'USR_ADMIN1',
    userName: 'KEO SOPHEA (School Admin)',
    userRole: 'school_admin',
    action: 'CREATE_STUDENT',
    details: 'ចុះឈ្មោះសិស្សថ្មី Seang Hong (STD0005) លេខទូរស័ព្ទអាណាព្យាបាល 017 333 444',
    ipAddress: '192.168.1.5',
    device: 'MacBook Pro / Chrome'
  },
  {
    id: 'ALG002',
    timestamp: '2026-05-24 10:45 AM',
    userId: 'USR_SUPER1',
    userName: 'SENG VANDA (Super Admin)',
    userRole: 'super_admin',
    action: 'CREATE_CLASS',
    details: 'បង្កើតថ្នាក់ថ្មី Computer Basics Suite (CLS003) ថ្លៃសិក្សា $90',
    ipAddress: '110.152.12.91',
    device: 'Windows 11 / Edge'
  },
  {
    id: 'ALG003',
    timestamp: '2026-05-25 11:30 AM',
    userId: 'TCH001',
    userName: 'CHHIM BORITH (Teacher)',
    userRole: 'teacher',
    action: 'COLLECT_PAYMENT',
    details: 'ទទួលប្រាក់ថ្លៃសិក្សាដំណាក់កាលទី២ ចំនួន $100 ពីសិស្ស Kong Kimheng (STD0001) - វិក្កយបត្រ RCT26004',
    ipAddress: '192.168.1.18',
    device: 'Android Phone / Chrome'
  },
  {
    id: 'ALG004',
    timestamp: '2026-05-26 17:00 PM',
    userId: 'USR_ACCT1',
    userName: 'LIM SOPHEAK (Accountant)',
    userRole: 'accountant',
    action: 'VERIFY_PAYMENT',
    details: 'ផ្ទៀងផ្ទាត់ការបង់ប្រាក់ចំនួន $50 (រេខា ABA) សម្រាប់សិស្ស Kong Kimheng (STD0001)',
    ipAddress: '192.168.1.12',
    device: 'iMac / Safari'
  }
];

// LocalStorage helpers to load/save state easily
export interface SchoolState {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  invoices: Invoice[];
  payments: Payment[];
  receipts: Receipt[];
  attendances: DailyAttendance[];
  scores: StudentMonthlyScore[];
  auditLogs: AuditLog[];
  schoolLogo?: string;
}

export function generateDefaultBigState(): SchoolState {
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
  const generatedScores: StudentMonthlyScore[] = [];
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
          createdAt: '2569-05-01',
          installments: [
            { installmentNumber: 1, amount: classFee / 3, dueDate: '2026-05-15', paidAmount: 0, status: 'unpaid' },
            { installmentNumber: 2, amount: classFee / 3, dueDate: '2026-06-15', paidAmount: 0, status: 'unpaid' },
            { installmentNumber: 3, amount: classFee / 3, dueDate: '2026-07-15', paidAmount: 0, status: 'unpaid' }
          ]
        });
      }

      if (st <= 10) {
        const scrId = `SCR${String(generatedScores.length + 1).padStart(4, '0')}`;
        const mathScr = 70 + (studentCount % 26);
        const khmScr = 75 + (studentCount % 21);
        const sciScr = 65 + (studentCount % 31);
        const avg = parseFloat(((mathScr + khmScr + sciScr) / 3).toFixed(1));
        
        generatedScores.push({
          id: scrId,
          studentId: id,
          classId,
          month: '2026-04',
          isFinalized: true,
          scores: [
            { subjectId: 'SUB001', attendanceScore: 90, homeworkScore: 85, midtermScore: 80, finalScore: mathScr, totalScore: mathScr },
            { subjectId: 'SUB002', attendanceScore: 95, homeworkScore: 90, midtermScore: 85, finalScore: khmScr, totalScore: khmScr },
            { subjectId: 'SUB005', attendanceScore: 90, homeworkScore: 80, midtermScore: 82, finalScore: sciScr, totalScore: sciScr }
          ],
          averageScore: avg,
          rank: (st % 10) + 1,
          teacherRemarks: avg > 80 ? 'សិស្សរៀនពូកែ និងមានសីលធម៌ល្អ' : 'គួរខិតខំប្រឹងប្រែងបន្ថែមទៀត'
        });
      }

      studentCount++;
    }
  }

  const initialLogs: AuditLog[] = [
    {
      id: 'ALG001',
      timestamp: new Date().toLocaleString(),
      userId: 'USR_SUPER1',
      userName: 'SENG VANDA (Super Admin)',
      userRole: 'super_admin',
      action: 'IMPORT_DEMO_DATA',
      details: 'ប្រព័ន្ធបានបញ្ចូលទិន្នន័យគំរូចំនួន ១០ថ្នាក់ និងសិស្ស ៥០០នាក់ ដោយស្វ័យប្រវត្តិកាលពីចាប់ផ្តើម',
      ipAddress: '127.0.0.1',
      device: 'Server Automatic Startup'
    }
  ];

  return {
    students: generatedStudents,
    teachers: DEFAULT_TEACHERS,
    subjects: DEFAULT_SUBJECTS,
    classes: demoClasses,
    invoices: generatedInvoices,
    payments: [],
    receipts: [],
    attendances: [],
    scores: generatedScores,
    auditLogs: initialLogs,
    schoolLogo: undefined
  };
}

export function loadState(): SchoolState {
  if (typeof window === 'undefined') {
    return generateDefaultBigState();
  }

  try {
    const data = localStorage.getItem('school_management_state');
    if (data) {
      const parsed = JSON.parse(data);
      // Validate that it has the required fields
      if (parsed.students && parsed.classes && parsed.invoices) {
        // Upgrade on the fly if class count is small (e.g. old default state)
        if (parsed.classes.length < 10) {
          const bigState = generateDefaultBigState();
          saveState(bigState);
          return bigState;
        }

        // Dynamic upgrade: Ensure we have all default teachers available
        if (parsed.teachers) {
          let hasUpdated = false;
          const existingIds = new Set(parsed.teachers.map((t: Teacher) => t.id));
          DEFAULT_TEACHERS.forEach(defaultT => {
            if (!existingIds.has(defaultT.id)) {
              parsed.teachers.push(defaultT);
              hasUpdated = true;
            }
          });
          if (hasUpdated) {
            saveState(parsed);
          }
        }

        // Sanitize audit logs to prevent duplicate IDs or collisions
        if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
          let hasUpdatedLogs = false;
          const seenIds = new Set<string>();
          parsed.auditLogs = parsed.auditLogs.map((log: AuditLog, idx: number) => {
            if (!log.id || seenIds.has(log.id)) {
              // Create a unique padded ID
              const uniqueId = `ALG${String(idx + 1).padStart(3, '0')}`;
              seenIds.add(uniqueId);
              hasUpdatedLogs = true;
              return { ...log, id: uniqueId };
            }
            seenIds.add(log.id);
            return log;
          });
          if (hasUpdatedLogs) {
            saveState(parsed);
          }
        }

        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  // Fallback to defaults and save them
  const fallback = generateDefaultBigState();
  saveState(fallback);
  return fallback;
}

export function saveState(state: SchoolState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('school_management_state', JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }
}
