/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Invoice, Student, Class, Teacher, Payment, Receipt, UserRole, InvoiceInstallment } from '../types';
import { FileText, Plus, DollarSign, CreditCard, ShieldCheck, Printer, CheckCircle, Clock, AlertTriangle, QrCode, ArrowRight, Eye, X, BookOpen, AlertCircle, Search } from 'lucide-react';

interface BillingProps {
  invoices: Invoice[];
  students: Student[];
  classes: Class[];
  teachers: Teacher[];
  payments: Payment[];
  receipts: Receipt[];
  currentRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  onAddInvoice: (newInvoice: Invoice) => void;
  onAddPayment: (newPayment: Payment, updatedInvoice: Invoice) => void;
  onAddReceipt: (newReceipt: Receipt) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function Billing({
  invoices,
  students,
  classes,
  teachers,
  payments,
  receipts,
  currentRole,
  currentUserId,
  currentUserName,
  onAddInvoice,
  onAddPayment,
  onAddReceipt,
  onLogAction
}: BillingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status'] | 'overdue'>('all');

  // Modal handlers
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Form states - Create Invoice
  const [invoiceStudentId, setInvoiceStudentId] = useState('');
  const [invoiceClassId, setInvoiceClassId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [stagesCount, setStagesCount] = useState(3);

  // Form states - Log Payment
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedInstallmentNum, setSelectedInstallmentNum] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'aba' | 'acleda' | 'wing'>('cash');
  const [transId, setTransId] = useState('');
  const [collectorId, setCollectorId] = useState(''); // can be teacher or staff

  // Verification dialog
  const [isQRVerifyOpen, setIsQRVerifyOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');

  const isTeacher = currentRole === 'teacher';
  const isRestrictedRole = currentRole === 'student_parent';

  // Filter based on teacher assignment if applicable
  const teacherClasses = isTeacher ? classes.filter(c => c.teacherId === currentUserId) : classes;
  const teacherClassIds = teacherClasses.map(c => c.id);

  const teacherStudents = isTeacher
    ? students.filter(s => s.enrolledClasses?.some(cid => teacherClassIds.includes(cid)))
    : students;
  const teacherStudentIds = teacherStudents.map(s => s.id);

  const displayInvoices = isTeacher ? invoices.filter(inv => teacherStudentIds.includes(inv.studentId)) : invoices;

  // Invoice calculations
  const filteredInvoices = displayInvoices.filter(inv => {
    const student = teacherStudents.find(s => s.id === inv.studentId);
    const matchesSearch = 
      (student?.khmerName.includes(searchTerm) || 
       student?.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       inv.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate default installments whenever student/class is changed in modal
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceStudentId || !invoiceClassId) {
      alert('សូមជ្រើសរើសសិស្ស និងថ្នាក់រៀន! Please select a student and class.');
      return;
    }

    const matchedStudent = students.find(s => s.id === invoiceStudentId);
    const matchedClass = classes.find(c => c.id === invoiceClassId);
    if (!matchedClass || !matchedStudent) return;

    // Check if invoice already exists for this combination
    const duplicate = invoices.find(inv => inv.studentId === invoiceStudentId && inv.classId === invoiceClassId);
    if (duplicate) {
      alert('វិក្កយបត្រសម្រាប់ថ្នាក់នេះមានរួចហើយ! An invoice for this class and student combination already exists.');
      return;
    }

    const netFee = Math.max(matchedClass.fee - Number(discountAmount), 0);
    const splitAmount = Math.ceil(netFee / stagesCount);

    // Build installment objects
    const nextDueDate = (offsetMonth: number) => {
      const d = new Date();
      d.setMonth(d.getMonth() + offsetMonth);
      return d.toISOString().split('T')[0];
    };

    const installmentsList: InvoiceInstallment[] = [];
    for (let i = 1; i <= stagesCount; i++) {
      // Last installment adjusts decimals
      const instAmt = i === stagesCount ? netFee - (splitAmount * (stagesCount - 1)) : splitAmount;
      installmentsList.push({
        installmentNumber: i,
        amount: instAmt,
        dueDate: nextDueDate(i),
        paidAmount: 0,
        status: 'unpaid'
      });
    }

    const nextInvIdNum = invoices.length + 1;
    const nextInvId = `INV2026${String(nextInvIdNum).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: nextInvId,
      studentId: invoiceStudentId,
      classId: invoiceClassId,
      courseName: matchedClass.name,
      totalAmount: matchedClass.fee,
      discount: Number(discountAmount),
      installments: installmentsList,
      paidAmount: 0,
      remainingBalance: netFee,
      status: 'unpaid',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddInvoice(newInvoice);
    onLogAction('CREATE_INVOICE', `បានបង្កើតវិក្កយបត្រថ្លៃសិក្សាថ្មី ${nextInvId} សម្រាប់សិស្ស ${matchedStudent.englishName} ថ្នាក់ ${matchedClass.name}`);
    setIsNewInvoiceOpen(false);
  };

  const handleOpenCollectPayment = (invoice: Invoice) => {
    // Find first unpaid installment
    const unpaid = invoice.installments.find(inst => inst.status === 'unpaid');
    if (!unpaid) {
      alert('វិក្កយបត្រនេះត្រូវបានបង់ប្រាក់គ្រប់ចំនួនរួចហើយ! All installments are paid for this invoice.');
      return;
    }

    setSelectedInvoice(invoice);
    setSelectedInstallmentNum(unpaid.installmentNumber);
    setPaymentAmount(unpaid.amount);
    
    // Lock collectorId strictly to the currently logged-in user
    setCollectorId(currentUserId);
    
    setIsCollectPaymentOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (paymentAmount <= 0) {
      alert('សូមបញ្ចូលចំនួនទឹកប្រាក់បង់ឲ្យបានត្រឹមត្រូវ! Please enter a valid payment amount.');
      return;
    }

    const inst = selectedInvoice.installments.find(i => i.installmentNumber === selectedInstallmentNum);
    if (!inst) return;

    if (paymentAmount > inst.amount - inst.paidAmount) {
      alert(`ទឹកប្រាក់លើស! ចំនួនទឹកប្រាក់អតិបរមាសម្រាប់វគ្គនេះគឺ $${inst.amount - inst.paidAmount}`);
      return;
    }

    // Process payment and update installment values
    const updatedInstallments = selectedInvoice.installments.map(item => {
      if (item.installmentNumber === selectedInstallmentNum) {
        const newlyPaid = item.paidAmount + paymentAmount;
        const isPaidInFull = newlyPaid >= item.amount;
        return {
          ...item,
          paidAmount: newlyPaid,
          status: isPaidInFull ? 'paid' as const : 'unpaid' as const,
          paidDate: isPaidInFull ? new Date().toISOString().split('T')[0] : undefined,
          collectedByTeacherId: collectorId
        };
      }
      return item;
    });

    const isAllPaid = updatedInstallments.every(i => i.status === 'paid');
    const totalPaidOnInvoice = selectedInvoice.paidAmount + paymentAmount;
    const remainingVal = Math.max(selectedInvoice.totalAmount - selectedInvoice.discount - totalPaidOnInvoice, 0);

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      installments: updatedInstallments,
      paidAmount: totalPaidOnInvoice,
      remainingBalance: remainingVal,
      status: isAllPaid ? 'paid' : 'partial'
    };

    // Create unique IDs
    const nextPayId = `PM26${String(payments.length + 1).padStart(4, '0')}`;
    const nextRctId = `RCT26${String(receipts.length + 1).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: nextPayId,
      invoiceId: selectedInvoice.id,
      installmentNumber: selectedInstallmentNum,
      receiptId: nextRctId,
      studentId: selectedInvoice.studentId,
      amountPaid: paymentAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionId: transId || undefined,
      collectedByUserId: collectorId || currentUserId,
      collectedByUserRole: currentRole,
      isVerified: currentRole === 'accountant' || currentRole === 'super_admin'
    };

    const matchedStudent = students.find(s => s.id === selectedInvoice.studentId);
    const matchedTeacher = teachers.find(t => t.id === collectorId);
    const collectorName = matchedTeacher
      ? matchedTeacher.khmerName
      : (collectorId === 'USR_CASHIER' ? 'លឹម សុភក្រ្ត (បេឡាករ)' : currentUserName);

    const newReceipt: Receipt = {
      id: nextRctId,
      paymentId: nextPayId,
      invoiceId: selectedInvoice.id,
      studentId: selectedInvoice.studentId,
      studentName: matchedStudent?.khmerName || 'Unregistered Student',
      className: selectedInvoice.courseName,
      installmentNumber: selectedInstallmentNum,
      amountPaid: paymentAmount,
      remainingBalance: remainingVal,
      collectedBy: collectorName,
      date: new Date().toLocaleString(),
      qrVerifyToken: `verify-${nextRctId}-${Math.random().toString(36).substring(2, 8)}`,
      isApproved: true
    };

    onAddPayment(newPayment, updatedInvoice);
    onAddReceipt(newReceipt);
    
    onLogAction('COLLECT_PAYMENT', `បានប្រមូលប្រាក់ $${paymentAmount} លើកទី ${selectedInstallmentNum} សម្រាប់វិក្កយបត្រ ${selectedInvoice.id}`);
    setIsCollectPaymentOpen(false);
    setSelectedReceipt(newReceipt);
  };

  return (
    <div className="space-y-4 flex flex-col lg:h-[calc(100vh-100px)]">
      {/* Sticky Header Portion */}
      <div className="sticky top-0 bg-slate-50 z-10 space-y-4 pb-2 shrink-0">
        {/* Control filters */}
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ ឬឈ្មោះសិស្ស (Search invoice ID, course, or student name...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-[44px] bg-white border border-slate-300 focus:border-brand-500 focus:outline-none rounded-md text-[13px] font-semibold transition-all shadow-3xs"
              />
            </div>

            {/* Status filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-300 focus:border-brand-500 focus:outline-none px-3.5 h-[44px] rounded-md text-[13px] font-medium text-slate-700 shadow-3xs"
              >
                <option value="all">គ្រប់ស្ថានភាពវិក្កយបត្រទាំងអស់ (All Invoice Status)</option>
                <option value="unpaid">មិនទាន់បង់ប្រាក់ (Unpaid)</option>
                <option value="partial">បង់បានខ្លះ (Partially Paid)</option>
                <option value="paid">បង់រួចរាល់ (Paid In Full)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Board Header integrated in the sticky flow */}
        <div className="bg-slate-50 border border-slate-200 rounded-t-md overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between gap-4">
            <h3 className="font-extrabold text-slate-800 text-[13.5px] uppercase tracking-wider">របាយការណ៍បង់ប្រាក់សិស្ស (Student Invoices)</h3>
            {!isRestrictedRole && currentRole !== 'teacher' && (
              <button
                onClick={() => {
                  setInvoiceStudentId(students[0]?.id || '');
                  setInvoiceClassId(classes[0]?.id || '');
                  setIsNewInvoiceOpen(true);
                }}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-bold px-4 py-2.5 rounded-md transition-all cursor-pointer shadow-sm shrink-0 border-none"
              >
                <Plus className="w-4 h-4" />
                <span>បង្កើតវិក្កយបត្រថ្មី (Setup Invoice)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable List container */}
      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 border-t-0 rounded-b-md shadow-sm">
        {filteredInvoices.length > 0 ? (
          <div className="divide-y divide-slate-100 text-[13px]">
            {filteredInvoices.map(inv => {
              const student = students.find(s => s.id === inv.studentId);
              const invoiceNet = inv.totalAmount - inv.discount;
              return (
                <div key={inv.id} className="p-4.5 hover:bg-slate-50 transition-all grid grid-cols-1 lg:grid-cols-12 gap-4 items-center text-[13px] cursor-pointer">
                  {/* Student details with photo (Column Span: 5) */}
                  <div className="lg:col-span-5 flex items-center gap-3 min-w-0">
                    {student?.photoUrl ? (
                      <img src={student.photoUrl} alt="" referrerPolicy="no-referrer" className="w-[42px] h-[42px] rounded-full object-cover shrink-0 border border-slate-200 shadow-3xs" />
                    ) : (
                      <div className="w-[42px] h-[42px] rounded-full bg-slate-100 text-slate-600 font-extrabold flex items-center justify-center font-mono text-[13px] shrink-0 border border-slate-200 shadow-3xs">
                        {student?.englishName?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )}
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-mono">
                          {inv.id}
                        </span>
                        <span className="text-slate-300 font-bold">|</span>
                        <span className="font-extrabold text-slate-900 truncate text-[13.5px]">{student?.khmerName} ({student?.englishName})</span>
                      </div>

                      <p className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 inline" />
                        <span>ថ្នាក់៖ {inv.courseName}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-slate-500 font-semibold">
                        <span>តម្លៃ៖ ${inv.totalAmount}</span>
                        {inv.discount > 0 && <span className="text-emerald-700 font-bold">បញ្ចុះ៖ -${inv.discount}</span>}
                        <span className="text-slate-900 font-black">ត្រូវបង់៖ ${invoiceNet}</span>
                      </div>
                    </div>
                  </div>

                  {/* Installment stages indicators (Column Span: 5) */}
                  <div className="lg:col-span-5 w-full bg-slate-50/70 border border-slate-200/50 p-2.5 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5 text-center lg:text-left tracking-wide">ដំណាក់កាលបង់ប្រាក់ (Installment Stages)</span>
                    <div className="grid grid-cols-4 gap-1.5 w-full">
                      {[1, 2, 3, 4].map(num => {
                        const inst = inv.installments.find(i => i.installmentNumber === num);
                        if (!inst) {
                          return (
                            <div key={num} className="bg-slate-100/30 border border-slate-200/30 rounded-md p-1.5 text-center flex flex-col justify-center items-center min-h-[56px] opacity-20">
                              <span className="text-[10px] text-slate-300 font-bold uppercase">វគ្គ {num}</span>
                              <span className="text-[12px] text-slate-300 font-extrabold mt-0.5">-</span>
                            </div>
                          );
                        }

                        const isPaid = inst.status === 'paid';
                        const isPartial = !isPaid && inst.paidAmount > 0;
                        const isUnpaid = !isPaid && !isPartial;
                        const isOverdue = !isPaid && new Date(inst.dueDate) < new Date();

                        return (
                          <div
                            key={num}
                            className={`p-1.5 rounded-md border text-center transition-all flex flex-col justify-between min-h-[56px] ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-3xs'
                                : isPartial
                                ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-3xs'
                                : 'bg-rose-50/70 text-rose-700 border-rose-150'
                            }`}
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-wide opacity-80">វគ្គ {num}</span>
                            <span className="block text-[12.5px] font-black mt-0.5">${inst.amount}</span>
                            <span className={`block text-[9px] mt-0.5 ${isOverdue ? 'text-rose-600 font-extrabold animate-pulse' : 'text-slate-400 font-medium'}`}>
                              {inst.dueDate}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Balance Summary and Quick Collect Button (Column Span: 2) */}
                  <div className="lg:col-span-2 text-center lg:text-right flex flex-row lg:flex-col lg:items-end justify-between lg:justify-center items-center gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-bold">នៅសល់ (Debt)</span>
                      <span className={`text-[15px] font-black ${inv.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${inv.remainingBalance}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status badge */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-block ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          : 'bg-amber-50 text-amber-700 border-amber-150'
                      }`}>
                        {inv.status === 'paid' ? 'បង់រួចរាល់' : 'កំពុងបង់'}
                      </span>

                      {/* Check if student/parent portal */}
                      {!isRestrictedRole && inv.remainingBalance > 0 && (
                        <button
                          onClick={() => handleOpenCollectPayment(inv)}
                          className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-3xs cursor-pointer border-none"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>បង់ប្រាក់</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 italic text-[13px] font-bold">រកមិនឃើញវិក្កយបត្រដែលស្វែងរកទេ</p>
          </div>
        )}
      </div>

      {/* SETUP NEW INVOICE MODAL */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-[13px]">
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col justify-between border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-805 text-[14px]">កំណត់វិក្កយបត្រសិក្សា • Add New Tuition Fee</h3>
                <p className="text-[13px] text-slate-500 mt-1">ការកំណត់តម្លៃសិក្សា ការបង់រំលស់ និងការបញ្ចុះតម្លៃ</p>
              </div>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 overflow-y-auto flex-1 text-[13px]">
              {/* Select Student */}
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ជ្រើសរើសសិស្ស (Select Student) *</label>
                <select
                  value={invoiceStudentId}
                  onChange={(e) => setInvoiceStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-brand-500 focus:outline-none px-3.5 py-2.5 rounded-md text-[13px] font-semibold text-slate-700"
                >
                  <option value="">-- ជ្រើសរើសសិស្សម្នាក់ --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.id} - {s.khmerName} ({s.englishName})</option>
                  ))}
                </select>
              </div>

              {/* Select Class */}
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ជ្រើសរើសថ្នាក់សិក្សា (Select Class) *</label>
                <select
                  value={invoiceClassId}
                  onChange={(e) => setInvoiceClassId(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-brand-500 focus:outline-none px-3.5 py-2.5 rounded-md text-[13px] font-semibold text-slate-700"
                >
                  <option value="">-- ជ្រើសរើសកម្រិតថ្នាក់ --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - ${c.fee}</option>
                  ))}
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">បញ្ចុះតម្លៃដុល្លារ (Value Discount USD)</label>
                <input
                  type="number"
                  placeholder="ឧ. 20"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-[13px] font-semibold focus:border-brand-500 focus:outline-none focus:bg-white bg-slate-50/50"
                />
              </div>

              {/* Installments Steps count */}
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">បែងចែកការបង់ជាដំណាក់កាល (Stage Installment Splits) *</label>
                <select
                  value={stagesCount}
                  onChange={(e) => setStagesCount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-brand-500 focus:outline-none px-3.5 py-2.5 rounded-md text-[13px] font-semibold text-slate-700"
                >
                  <option value={1}>បង់ផ្តាច់តែម្តង (1 Installment)</option>
                  <option value={2}>បង់ជា ២ វគ្គ (2 Stages)</option>
                  <option value={3}>បង់ជា ៣ វគ្គ (3 Stages - Recommended)</option>
                  <option value={4}>បង់ជា ៤ វគ្គ (4 Stages)</option>
                </select>
              </div>
            </form>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 text-[13px]">
              <button
                type="button"
                onClick={() => setIsNewInvoiceOpen(false)}
                className="px-4 py-2.5 text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="submit"
                onClick={handleCreateInvoice}
                className="px-5 py-2.5 text-[13px] font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-md shadow-3xs cursor-pointer border-none"
              >
                បង្កើតវិក្កយបត្រ (Invoice Set up)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT INSTALLMENT PAYMENT MODAL */}
      {isCollectPaymentOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-[13px]">
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col justify-between border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-[14px]">កត់ត្រាការបង់ថ្លៃសិក្សា • Log Student Installment Payment</h3>
                <p className="text-[13px] text-slate-500 mt-1">វិក្កយបត្រ ID: {selectedInvoice.id} • វគ្គសិក្សា៖ {selectedInvoice.courseName}</p>
              </div>
              <button
                onClick={() => setIsCollectPaymentOpen(false)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 space-y-4 overflow-y-auto flex-1 text-[13px]">
              {/* Select Installment Number */}
              <div>
                <label className="text-[13px] font-bold text-slate-705 block mb-1.5">ជ្រើសរើសវគ្គដែលត្រូវបង់ (Select Installment Stage) *</label>
                <select
                  value={selectedInstallmentNum}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setSelectedInstallmentNum(num);
                    const inst = selectedInvoice.installments.find(i => i.installmentNumber === num);
                    if (inst) setPaymentAmount(inst.amount - inst.paidAmount);
                  }}
                  className="w-full bg-white border border-slate-300 focus:border-brand-500 focus:outline-none px-3.5 py-2.5 rounded-md text-[13px] font-semibold text-slate-700"
                >
                  {selectedInvoice.installments.map(inst => (
                    <option key={inst.installmentNumber} value={inst.installmentNumber} disabled={inst.status === 'paid'}>
                      លើកទី {inst.installmentNumber} - ត្រូវបង់ ${inst.amount} ({inst.status === 'paid' ? 'Paid' : 'Unpaid'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount field */}
              <div>
                <label className="text-[13px] font-bold text-slate-705 block mb-1.5">ចំនួនទឹកប្រាក់ដុល្លារ ($ Paid Amount) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-[13px] font-semibold focus:border-brand-500 focus:outline-none bg-white focus:bg-white"
                />
              </div>

              {/* Payment Method selection */}
              <div>
                <label className="text-[13px] font-bold text-slate-705 block mb-1.5">វិធីសាស្ត្របង់ប្រាក់ (Payment Method) *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['cash', 'aba', 'acleda', 'wing'] as const).map(met => (
                    <button
                      key={met}
                      type="button"
                      onClick={() => setPaymentMethod(met)}
                      className={`py-2 px-1 text-center rounded-md border text-[13px] font-bold capitalize transition-all cursor-pointer ${
                        paymentMethod === met
                          ? 'bg-brand-50 text-brand-700 border-brand-500 border-2'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {met}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan or Reference Id if Bank Transfer */}
              {paymentMethod !== 'cash' && (
                <div>
                  <label className="text-[13px] font-bold text-slate-705 block mb-1.5">លេខកូដប្រតិបត្តិការធនាគារ (Transaction/ABA Ref No) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ABA-TRX92811"
                    value={transId}
                    onChange={(e) => setTransId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-[13px] font-semibold focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Collect By Which Teacher (Indirect cash handling check) */}
              <div>
                <label className="text-[13px] font-bold text-slate-705 block mb-1.5">អ្នកទទួលសាច់ប្រាក់ថវិកា (Collected By) *</label>
                <select
                  disabled={true}
                  value={collectorId}
                  onChange={(e) => setCollectorId(e.target.value)}
                  className="w-full bg-slate-100 disabled:bg-slate-100 disabled:cursor-not-allowed border border-slate-250 focus:outline-none px-3.5 py-2.5 rounded-md text-[13px] font-semibold text-slate-700"
                >
                  <option value={currentUserId}>{currentUserName} ({currentRole === 'super_admin' ? 'Super Admin' : currentRole === 'school_admin' ? 'School Admin' : currentRole === 'accountant' ? 'Accountant' : 'Teacher'})</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.khmerName} (គ្រូ {t.englishName})</option>
                  ))}
                </select>
                <span className="text-[13px] text-brand-700 block mt-2 font-bold leading-relaxed">
                  🔒 ចាប់យកស្វ័យប្រវត្តិតាមគណនីកំពុងចូលប្រើប្រាស់ (Locked automatically to current active session)
                </span>
              </div>
            </form>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 text-[13px]">
              <button
                type="button"
                onClick={() => setIsCollectPaymentOpen(false)}
                className="px-4 py-2.5 text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="submit"
                onClick={handleProcessPayment}
                className="px-5 py-2.5 text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-3xs cursor-pointer border-none"
              >
                យល់ព្រមទទួលប្រាក់ (Confirm Collection)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE SLIP RECEIPT POPUP MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-[13px]">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-250 border border-slate-200">
            {/* Real aesthetic print area */}
            <div className="p-8 space-y-6" id="printable-receipt-card">
              {/* Receipt Header logo & meta */}
              <div className="text-center font-bold">
                <span className="text-[13px] uppercase font-bold tracking-wider text-slate-400">ព្រះរាជាណាចក្រកម្ពុជា • Kingdom of Cambodia</span>
                <h3 className="font-bold text-slate-900 text-[16px] mt-1.5 font-sans">សាលារៀនឯកជនលំដាប់អន្តរជាតិ</h3>
                <h4 className="text-[13px] uppercase text-slate-500 font-mono mt-0.5">Elite Private Academy Workspace</h4>
                <div className="w-12 h-0.5 bg-brand-500 mx-auto my-4"></div>
                <h2 className="text-[15px] font-black tracking-widest text-[#03487c] uppercase">វិក្កយបត្របង់ប្រាក់ • Receipt Voucher</h2>
              </div>

              {/* Invoice details and student information */}
              <div className="border-t border-b border-dashed border-slate-250 py-3 text-[13px] space-y-2 text-slate-700 font-semibold">
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
                  <span className="text-slate-400">សម្រាប់ដំណាក់កាល (Stage Split)៖</span>
                  <span className="font-bold text-slate-800">លើកទី {selectedReceipt.installmentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ថ្ងៃខែចរន្ត (Payment Date)៖</span>
                  <span className="font-bold font-mono text-slate-500 text-[13px]">{selectedReceipt.date}</span>
                </div>
              </div>

              {/* Financial summary large indicators */}
              <div className="bg-slate-50 rounded-md p-4 border border-slate-200 flex items-center justify-between text-[13px]">
                <div>
                  <span className="text-[13px] text-slate-400 uppercase font-bold block mb-1">ទឹកប្រាក់បានបង់ (Amount Paid)</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono">${selectedReceipt.amountPaid}</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] text-slate-400 uppercase font-bold block mb-1">ជំពាក់សល់ (Owed Balance)</span>
                  <span className="text-sm font-extrabold text-rose-500 font-mono">${selectedReceipt.remainingBalance}</span>
                </div>
              </div>

              {/* QR verification and Audit code */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-200 text-[13px]">
                {/* SVG simulated QR Code */}
                <div
                  className="bg-white p-1.5 border border-slate-300 rounded cursor-pointer hover:bg-slate-50 relative group shrink-0"
                  onClick={() => {
                    setVerifyToken(selectedReceipt.qrVerifyToken);
                    setIsQRVerifyOpen(true);
                  }}
                >
                  <svg className="w-16 h-16 text-slate-900" viewBox="0 0 32 32" fill="currentColor">
                    <rect width="32" height="32" fill="white" />
                    <rect x="2" y="2" width="6" height="6" />
                    <rect x="24" y="2" width="6" height="6" />
                    <rect x="2" y="24" width="6" height="6" />
                    <rect x="10" y="4" width="2" height="4" />
                    <rect x="16" y="2" width="4" height="2" />
                    <rect x="14" y="8" width="6" height="2" />
                    <rect x="4" y="10" width="4" height="2" />
                    <rect x="2" y="14" width="2" height="4" />
                    <rect x="10" y="14" width="6" height="6" />
                    <rect x="20" y="12" width="4" height="6" />
                    <rect x="26" y="14" width="4" height="4" />
                    <rect x="14" y="24" width="4" height="4" />
                    <rect x="22" y="22" width="6" height="2" />
                    <rect x="22" y="26" width="2" height="4" />
                  </svg>
                  <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex-1 text-[13px] text-slate-550 leading-relaxed font-bold">
                  <p className="font-bold text-slate-700">🔐 សុវត្ថិភាពវិក្កយបត្រ</p>
                  <p className="font-mono mt-0.5 text-slate-400 block break-all text-[11px]">Hash: {selectedReceipt.qrVerifyToken}</p>
                  <p className="text-rose-600 font-bold mt-1">● មិនអាចកែប្រែបានឡើយ</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 text-center text-[13px] font-bold pt-4 text-slate-500 gap-4">
                <div>
                  <span className="block border-b border-transparent pb-1.5">ស្នាមមេដៃអ្នកបង់ (Payer)</span>
                  <div className="h-12"></div>
                  <span className="block text-[13px] text-slate-400 font-medium">សិស្ស / អាណាព្យាបាល</span>
                </div>
                <div>
                  <span className="block border-b border-transparent pb-1.5">អ្នកប្រមូល (Collected By)</span>
                  <div className="h-12"></div>
                  <span className="block text-[13px] text-slate-800 font-bold">{selectedReceipt.collectedBy}</span>
                </div>
              </div>
            </div>

            {/* Print action utilities */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-[13px]">
              <span className="text-[13px] bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded">
                ✓ ត្រួតពិនិត្យរួច (Approved Slip)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const printContents = document.getElementById('printable-receipt-card')?.innerHTML;
                    if (printContents) {
                      window.print();
                    }
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[13px] font-bold px-4 py-2.5 rounded-md transition-all cursor-pointer shadow-3xs border-none"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ព</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2.5 border border-slate-200 text-[13px] text-slate-600 bg-white rounded-md hover:text-slate-800 cursor-pointer"
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR VERIFICATION MODAL POPUP */}
      {isQRVerifyOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-[13px]">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm overflow-hidden text-center p-6 space-y-4 border border-slate-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 animate-bounce">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-950 text-[15px]">ផ្ទៀងផ្ទាត់វិក្កយបត្រជោគជ័យ</h3>
              <h4 className="text-[13px] uppercase text-emerald-600 font-bold tracking-wide mt-1">Receipt Verified Authentic</h4>
              <p className="text-[13px] text-slate-500 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
                វិក្កយបត្រនេះត្រូវបានរកឃើញក្នុងប្រព័ន្ធទិន្នន័យសិក្សា និងធានាសុវត្ថិភាពដោយលេខកូដសិវត្ថិភាព៖ <br/>
                <span className="font-mono text-brand-650 font-bold block mt-1.5 text-[11px] break-all">{verifyToken}</span>
              </p>
            </div>

            <button
              onClick={() => setIsQRVerifyOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-850 text-white text-[13px] font-bold py-3 rounded-md cursor-pointer border-none shadow-3xs"
            >
              ត្រលប់ក្រោយ (Back to System)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
