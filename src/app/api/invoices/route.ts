import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '../../../lib/api-helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function canManageFees(role: string | undefined) {
  return role === 'admin';
}

function getText(value: unknown, maxLength = 300) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function getAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}

function getDueDate(value: unknown) {
  const dueDate = getText(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null;
  const parsedDate = new Date(`${dueDate}T12:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : dueDate;
}

async function generateReceiptNo(collection: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ST-REC-${year}-`;
  const lastInvoice = await collection
    .find({ receiptNo: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();
  let seq = 1;
  if (lastInvoice.length > 0) {
    const lastNo = lastInvoice[0].receiptNo || '';
    const match = lastNo.match(/(\d+)$/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const collection = await getCollection('feeInvoices');
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId')?.trim();

    if (studentId) {
      if (!canManageFees(session.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const invoices = await collection
        .find({ studentId })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      return NextResponse.json({ feeInvoices: invoices.map(normalizeDoc) });
    }

    const query: any = {};
    if (session.role === 'student') {
      query.$or = [{ studentId: session.id }, { studentUid: session.uid }];
    } else if (session.role === 'parent') {
      query.parentId = session.id;
    }

    const invoices = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ feeInvoices: invoices.map(normalizeDoc) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canManageFees(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const studentId = getText(body.studentId, 120);
    const title = getText(body.title, 120);
    const particulars = getText(body.particulars, 200) || title;
    const amount = getAmount(body.amount);
    const dueDate = getDueDate(body.dueDate);

    if (!studentId || !title || amount === null || !dueDate) {
      return NextResponse.json(
        { error: 'Student, title, amount, and a valid due date are required.' },
        { status: 400 }
      );
    }

    const collection = await getCollection('feeInvoices');
    const receiptNo = await generateReceiptNo(collection);

    const paymentMode = getText(body.paymentMode, 60);
    let transactions: any[] = [];
    let paidAmount = 0;
    let status: 'paid' | 'unpaid' | 'partial' = 'unpaid';

    if (body.transaction && paymentMode) {
      const t = body.transaction as Record<string, unknown>;
      transactions = [{
        paidAmount: amount,
        paidDate: getText(t.paidDate, 20) || dueDate,
        paymentMode: paymentMode || 'Cash',
        transactionId: getText(t.transactionId, 200) || undefined,
        chequeNumber: getText(t.chequeNumber, 50) || undefined,
        bankName: getText(t.bankName, 100) || undefined,
        accountLast4: getText(t.accountLast4, 10) || undefined,
        recordedBy: session.id,
        recordedAt: new Date().toISOString(),
      }];
      paidAmount = amount;
      status = 'paid';
    }

    const month = new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${dueDate}T12:00:00`));

    const newInvoice = {
      id: crypto.randomUUID(),
      receiptNo,
      studentId,
      studentName: getText(body.studentName, 120) || '',
      parentId: getText(body.parentId, 120) || undefined,
      parentName: getText(body.parentName, 120) || undefined,
      title,
      particulars,
      amount,
      paidAmount,
      dueDate,
      status,
      notes: getText(body.notes, 500) || undefined,
      paymentMode: paymentMode || undefined,
      createdBy: session.id,
      classCourse: getText(body.classCourse, 120) || undefined,
      rollNo: getText(body.rollNo, 60) || undefined,
      academicYear: getText(body.academicYear, 20) || undefined,
      mobileNo: getText(body.mobileNo, 20) || undefined,
      month,
      transactions,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newInvoice);

    return NextResponse.json({ feeInvoice: normalizeDoc(newInvoice) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
