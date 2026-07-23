'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins, FileText, CheckCircle, Clock, AlertCircle, Plus, X,
  Download, ReceiptText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageContainer from '../../../components/PageContainer';
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';

type PaymentTransaction = {
  paidAmount: number;
  paidDate: string;
  paymentMode: string;
  transactionId?: string;
  chequeNumber?: string;
  bankName?: string;
  accountLast4?: string;
  recordedBy: string;
  recordedAt: string;
};

type FeeInvoice = {
  id: string;
  receiptNo?: string;
  studentId: string;
  studentName: string;
  parentId?: string;
  parentName?: string;
  classCourse?: string;
  rollNo?: string;
  academicYear?: string;
  mobileNo?: string;
  title: string;
  particulars?: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
  notes?: string;
  paymentMode?: string;
  month?: string;
  transactions: PaymentTransaction[];
  createdBy: string;
  createdAt: string;
};

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatCurrency(n: number) {
  return `\u20B9${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatReceiptDate(iso: string) {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function numberToWords(n: number): string {
  if (n === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelow1000(num: number): string {
    let result = '';
    if (num >= 100) { result += ones[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
    if (num >= 20) { result += tens[Math.floor(num / 10)] + ' '; num %= 10; }
    if (num > 0) result += ones[num] + ' ';
    return result.trim();
  }

  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  let result = '';
  if (crore) result += convertBelow1000(crore) + ' Crore ';
  if (lakh) result += convertBelow1000(lakh) + ' Lakh ';
  if (thousand) result += convertBelow1000(thousand) + ' Thousand ';
  if (n > 0) result += convertBelow1000(n) + ' ';
  return result.trim() + ' Rupees Only';
}

function downloadInvoiceReceipt(invoice: FeeInvoice) {
  const popup = window.open('', '_blank', 'width=900,height=800,scrollbars=yes');
  if (!popup) return;

  const paidAmount = invoice.paidAmount ?? 0;
  const balance = Math.max(invoice.amount - paidAmount, 0);
  const receiptNo = invoice.receiptNo || invoice.id;
  const logoUrl = `${window.location.origin}/stpl.jpeg`;
  const signatureUrl = `${window.location.origin}/founder-sign.png`;
  const transactions = invoice.transactions ?? [];
  const now = new Date();
  const printDateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const amountInWords = numberToWords(invoice.amount);

  const statusLabels: Record<string, string> = {
    paid: 'PAID', partial: 'PAID (Partially)', unpaid: 'UNPAID', overdue: 'OVERDUE',
  };
  const statusBadgeColors: Record<string, string> = {
    paid: 'background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;',
    partial: 'background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;',
    unpaid: 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;',
    overdue: 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;',
  };
  const badgeStyle = statusBadgeColors[invoice.status] ?? statusBadgeColors.unpaid;
  const statusLabel = statusLabels[invoice.status] ?? 'UNPAID';

  function renderTransactionRows(): string {
    if (!transactions.length) return '';
    const rows = transactions.map((t, i) => `
      <tr>
        <td class="hist-td">${i + 1}</td>
        <td class="hist-td">${escapeHtml(formatReceiptDate(t.paidDate))}</td>
        <td class="hist-td" style="text-align:right;font-weight:700;">${escapeHtml(formatCurrency(t.paidAmount))}</td>
        <td class="hist-td">${escapeHtml(t.paymentMode)}</td>
        <td class="hist-td">${escapeHtml(t.transactionId || t.chequeNumber || '-')}</td>
        <td class="hist-td">${escapeHtml(t.bankName || '-')}</td>
      </tr>`).join('');

    return `
      <div style="margin-top:20px;">
        <div class="sec-head">Payment History</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #d1d5db;">
          <thead><tr>
            <th class="hist-th" style="width:40px;">#</th>
            <th class="hist-th">Date</th>
            <th class="hist-th" style="text-align:right;">Amount</th>
            <th class="hist-th">Mode</th>
            <th class="hist-th">Transaction Ref</th>
            <th class="hist-th">Bank</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  const NAVY = '#0f1f45';
  const receiptHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fee Receipt - ${escapeHtml(receiptNo)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; overflow-x: hidden; }
    body { padding: 16px; background: #e5e7eb; color: #111827; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .receipt-wrap { max-width: 850px; width: 100%; margin: 0 auto; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .receipt-box { border: 1.5px solid ${NAVY}; margin: 8px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: hidden; }
    .sec-head { background: ${NAVY} !important; color: #fff !important; padding: 6px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .detail-cell { flex: 1; display: flex; padding: 6px 10px; align-items: center; min-width: 0; overflow: hidden; }
    .detail-cell:first-child { border-right: 1px solid #d1d5db; }
    .detail-lbl { width: 100px; font-weight: 700; color: #374151; white-space: nowrap; flex-shrink: 0; font-size: 11px; }
    .detail-sep { margin: 0 4px; color: #9ca3af; flex-shrink: 0; }
    .detail-val { color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
    .fee-th { border: 1px solid #d1d5db; padding: 6px 8px; background: ${NAVY} !important; color: #fff !important; font-weight: 600; text-align: center; font-size: 11px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .fee-td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: center; font-size: 12px; word-break: break-word; }
    .hist-th { padding: 6px 8px; border: 1px solid #d1d5db; background: #f1f5f9 !important; font-size: 11px; text-align: center; font-weight: 700; color: #334155; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .hist-td { padding: 6px 8px; border: 1px solid #d1d5db; text-align: center; font-size: 12px; word-break: break-word; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .print-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; background: ${NAVY} !important; color: #fff !important; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-bottom: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .fee-table-wrap { overflow-x: auto; width: 100%; }
    @media print {
      html, body { width: 100%; overflow: visible; padding: 0; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-btn { display: none !important; }
      .receipt-wrap { margin: 0; border: none; max-width: none; width: 100%; }
      .receipt-box { margin: 0; border: none; }
      .receipt-box img { width: 100% !important; height: auto !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .detail-val, .fee-td, .hist-td { white-space: normal !important; word-break: break-word !important; overflow: visible !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:850px;width:100%;margin:0 auto;">
    <button class="print-btn" onclick="window.print();">Print Receipt</button>
  </div>
  <div class="receipt-wrap">
    <div class="receipt-box">
      <div style="width:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
        <img src="${escapeHtml(logoUrl)}" alt="Smart Tutors" style="width:100%;display:block;height:auto;" />
      </div>
      <div style="padding:16px 20px;">
        <div style="text-align:center;font-size:20px;font-weight:900;color:${NAVY};margin:10px 0 12px;letter-spacing:0.08em;">FEE RECEIPT</div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#1e293b;margin-bottom:12px;flex-wrap:wrap;gap:4px;">
          <div><span>Receipt No.</span><span style="margin:0 6px;">:</span><span style="font-weight:500;color:#475569;">${escapeHtml(receiptNo)}</span></div>
          <div><span>Receipt Date</span><span style="margin:0 6px;">:</span><span style="font-weight:500;color:#475569;">${escapeHtml(formatReceiptDate(invoice.createdAt || invoice.dueDate))}</span></div>
        </div>
        <div class="sec-head">Student Details</div>
        <div style="border:1px solid #d1d5db;font-size:12px;margin-bottom:14px;">
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Student Name</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.studentName || '\u2014')}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Parent Name</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.parentName || '\u2014')}</span></div>
          </div>
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Class / Board</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.classCourse || '\u2014')}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Enrollment No.</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml((invoice.studentId || '\u2014').replace('-', '').substring(0, 8).toUpperCase())}</span></div>
          </div>
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Academic Year</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.academicYear || '\u2014')}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Payment Mode</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.paymentMode || '\u2014')}</span></div>
          </div>
          <div style="display:flex;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Mobile No.</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.mobileNo || '\u2014')}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Invoice ID</span><span class="detail-sep">:</span><span class="detail-val">${escapeHtml(invoice.id || '\u2014')}</span></div>
          </div>
        </div>
        <div class="sec-head">Fee Details</div>
        <div class="fee-table-wrap">
          <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #d1d5db;table-layout:fixed;">
            <thead>
              <tr>
                <th class="fee-th" style="width:36px;">#</th>
                <th class="fee-th" style="text-align:left;">Particulars</th>
                <th class="fee-th">Month</th>
                <th class="fee-th">Due Date</th>
                <th class="fee-th" style="text-align:right;">Amount</th>
                <th class="fee-th" style="text-align:right;">Paid</th>
                <th class="fee-th" style="text-align:right;">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="fee-td">1</td>
                <td class="fee-td" style="text-align:left;font-weight:600;">${escapeHtml(invoice.title || 'Fee')}${invoice.particulars ? ' \u2014 ' + escapeHtml(invoice.particulars) : ''}</td>
                <td class="fee-td">${escapeHtml(invoice.month || '\u2014')}</td>
                <td class="fee-td">${escapeHtml(formatReceiptDate(invoice.dueDate))}</td>
                <td class="fee-td" style="text-align:right;font-weight:700;">${escapeHtml(formatCurrency(invoice.amount))}</td>
                <td class="fee-td" style="text-align:right;font-weight:700;">${escapeHtml(formatCurrency(paidAmount))}</td>
                <td class="fee-td" style="text-align:right;font-weight:700;color:${balance > 0 ? '#dc2626' : '#16a34a'};">${escapeHtml(formatCurrency(balance))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;padding:8px 10px;background:#f8fafc !important;border:1px solid #d1d5db;border-top:none;margin-bottom:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact;flex-wrap:wrap;">
          <span style="color:#374151;white-space:nowrap;">Amount in Words :</span>
          <span style="color:#475569;font-weight:500;word-break:break-word;">${escapeHtml(amountInWords)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:#1e293b;padding:8px 2px;border-top:2px solid ${NAVY};margin-bottom:4px;flex-wrap:wrap;gap:6px;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#64748b;">Status</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span class="badge" style="${badgeStyle}">${escapeHtml(statusLabel)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#64748b;">Paid</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span style="font-weight:800;color:#16a34a;">${escapeHtml(formatCurrency(paidAmount))}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#64748b;">Balance</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span style="font-weight:800;color:${balance > 0 ? '#dc2626' : '#16a34a'};">${escapeHtml(formatCurrency(balance))}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:11px;font-weight:700;color:#1e293b;padding:4px 2px 12px;border-bottom:1px solid #e5e7eb;margin-bottom:16px;flex-wrap:wrap;">
          <div><span style="color:#64748b;">Due</span><span style="color:#d1d5db;margin:0 4px;">:</span><span>${escapeHtml(formatReceiptDate(invoice.dueDate))}</span></div>
          <span style="color:#d1d5db;">|</span>
          <div><span style="color:#64748b;">Printed</span><span style="color:#d1d5db;margin:0 4px;">:</span><span>${escapeHtml(printDateStr)}</span></div>
        </div>
        ${renderTransactionRows()}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:14px 20px 0;border-top:2px solid ${NAVY};margin-top:12px;min-height:100px;flex-wrap:wrap;gap:16px;">
        <div style="max-width:50%;font-size:10px;font-weight:600;color:#64748b;min-width:200px;">
          <p style="margin:2px 0;">This is a computer-generated receipt and does not require a physical signature.</p>
          <p style="margin:2px 0;font-weight:800;color:#1e293b;font-size:11px;">FEES ONCE PAID ARE NON-REFUNDABLE UNDER ANY CIRCUMSTANCES.</p>
          <p style="margin:6px 2px 2px;">Thank you for choosing Smart Tutors Pvt. Ltd.</p>
          <p style="margin:2px 0;">We appreciate your trust.</p>
        </div>
        <div style="text-align:center;width:180px;">
          <img src="${escapeHtml(signatureUrl)}" alt="Founder Signature" style="display:block;width:160px;height:56px;margin:0 auto 6px;object-fit:contain;" />
          <div style="border-top:1.5px solid #334155;margin-top:4px;padding-top:4px;">
            <div style="font-size:12px;font-weight:800;color:#1e293b;">Mr. Ravi Rana</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Director &amp; Founder</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Smart Tutors Pvt. Ltd.</div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;padding:8px 20px 10px;flex-wrap:wrap;gap:4px;">
        <span>Smart Tutors Pvt. Ltd. | CIN: U80100MH2019PTC321658</span>
        <span>www.smarttutors.co.in</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  popup.document.write(receiptHtml);
  popup.document.close();
}

export default function FeesPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    title: '', amount: '', dueDate: '', studentId: '', studentName: '', particulars: '',
  });

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/invoices');
      setInvoices(data.feeInvoices || data.invoices || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<any>('/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newInvoice,
          amount: parseFloat(newInvoice.amount),
        }),
      });
      if (res) {
        setShowCreate(false);
        setNewInvoice({ title: '', amount: '', dueDate: '', studentId: '', studentName: '', particulars: '' });
        fetchInvoices();
      }
    } catch (error) {
    }
  };

  const totalFees = useMemo(() => invoices.reduce((s, i) => s + i.amount, 0), [invoices]);
  const totalPaid = useMemo(() => invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0), [invoices]);
  const totalDue = Math.max(totalFees - totalPaid, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'overdue': return <AlertCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-amber-500" />;
    }
  };

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-emerald-50 text-emerald-700';
    if (s === 'partial') return 'bg-amber-50 text-amber-700';
    if (s === 'overdue') return 'bg-red-50 text-red-700';
    return 'bg-slate-50 text-slate-600';
  };

  const statusDot = (s: string) => {
    if (s === 'paid') return 'bg-emerald-500';
    if (s === 'partial') return 'bg-amber-500';
    if (s === 'overdue') return 'bg-red-500';
    return 'bg-slate-400';
  };

  const statusLabel = (s: string) => {
    if (s === 'paid') return 'Paid';
    if (s === 'partial') return 'Partial';
    if (s === 'overdue') return 'Overdue';
    return 'Unpaid';
  };

  return (
    <PageContainer>
      <PageHeader title="Fees & Invoices" subtitle="Financial Overview" gradient="amber" showBack />

      <div className="flex items-center justify-end mb-4">
        {profile?.role === 'admin' && (
          <button
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-academy-orange-100"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Total Fees - full width */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Coins size={22} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fees</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(totalFees)}</p>
          </div>
        </div>
      </div>

      {/* Paid + Due side by side */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paid</p>
              <p className="text-base font-black text-emerald-600 truncate">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due</p>
              <p className="text-base font-black text-red-600 truncate">{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Create Invoice</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <input
                placeholder="Invoice Title"
                required
                value={newInvoice.title}
                onChange={e => setNewInvoice({ ...newInvoice, title: e.target.value })}
                className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
              />
              <input
                placeholder="Amount (Rs.)"
                type="number"
                required
                value={newInvoice.amount}
                onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
              />
              <input
                placeholder="Due Date"
                type="date"
                value={newInvoice.dueDate}
                onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
              />
              <input
                placeholder="Student ID"
                value={newInvoice.studentId}
                onChange={e => setNewInvoice({ ...newInvoice, studentId: e.target.value })}
                className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
              />
              <input
                placeholder="Student Name"
                value={newInvoice.studentName}
                onChange={e => setNewInvoice({ ...newInvoice, studentName: e.target.value })}
                className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
              />
              <button type="submit" className="w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">
                Create Invoice
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto" />
          </div>
        ) : invoices.length > 0 ? (
          invoices.map((invoice, i) => {
            const paidAmt = invoice.paidAmount ?? 0;
            const bal = Math.max(invoice.amount - paidAmt, 0);
            const isExpanded = expandedId === invoice.id;

            return (
              <motion.div
                key={invoice.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Header row: icon + title + download + chevron */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <ReceiptText size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{invoice.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                      {invoice.receiptNo ? invoice.receiptNo : formatReceiptDate(invoice.dueDate)}
                    </p>
                  </div>
                  {(invoice.status === 'paid' || invoice.status === 'partial') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadInvoiceReceipt(invoice); }}
                      className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                      title="Download Receipt"
                    >
                      <Download size={15} />
                    </button>
                  )}
                  <div className="text-slate-300 shrink-0">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Amount / Paid / Balance - flex column */}
                <div className="px-4 pb-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</span>
                    <span className="font-black text-slate-900 text-sm">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid</span>
                    <span className="font-black text-emerald-600 text-sm">{formatCurrency(paidAmt)}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                    <span className={`font-black text-sm ${bal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(bal)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {getStatusIcon(invoice.status)}
                    <span className={`text-[9px] font-black uppercase tracking-wider ${statusColor(invoice.status)}`}>
                      {statusLabel(invoice.status)}
                    </span>
                  </div>
                </div>

                {isExpanded && <div className="h-5 bg-slate-50" />}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 flex flex-col gap-3">
                        <div className="flex flex-col gap-2.5 text-[11px]">
                          {invoice.receiptNo && (
                            <div className="flex items-start justify-between">
                              <span className="text-slate-400 font-bold">Receipt</span>
                              <span className="text-slate-700 break-all text-right max-w-[60%]">{invoice.receiptNo}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold">Due Date</span>
                            <span className="text-slate-700">{formatReceiptDate(invoice.dueDate)}</span>
                          </div>
                          {invoice.studentName && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-bold">Student</span>
                              <span className="text-slate-700 truncate max-w-[60%] text-right">{invoice.studentName}</span>
                            </div>
                          )}
                          {invoice.month && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-bold">Month</span>
                              <span className="text-slate-700">{invoice.month}</span>
                            </div>
                          )}
                          {invoice.particulars && (
                            <div className="flex items-start justify-between">
                              <span className="text-slate-400 font-bold">Particulars</span>
                              <span className="text-slate-700 break-words text-right max-w-[65%]">{invoice.particulars}</span>
                            </div>
                          )}
                        </div>

                        {invoice.transactions && invoice.transactions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment History</p>
                            <div className="flex flex-col gap-1.5">
                              {invoice.transactions.map((t, ti) => (
                                <span key={ti} className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  {formatCurrency(t.paidAmount)} via {t.paymentMode} on {formatReceiptDate(t.paidDate)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(invoice.status === 'paid' || invoice.status === 'partial') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadInvoiceReceipt(invoice); }}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold"
                          >
                            <Download size={16} />
                            View & Print Receipt
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Coins size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No invoices found</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
