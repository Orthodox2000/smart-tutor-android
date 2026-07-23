import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';

function getText(value: unknown, maxLength = 300) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const invoiceId = getText(body.invoiceId, 120);

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const collection = await getCollection('feeInvoices');
    const invoice = await collection.findOne({ id: invoiceId });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const paidAmount = Number(body.paidAmount);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return NextResponse.json({ error: 'Invalid paidAmount' }, { status: 400 });
    }

    const currentPaid = invoice.paidAmount || 0;
    const balance = Math.max(invoice.amount - currentPaid, 0);

    if (paidAmount > balance) {
      return NextResponse.json(
        { error: `Payment of Rs.${paidAmount} exceeds balance of Rs.${balance}` },
        { status: 400 }
      );
    }

    const paymentMode = getText(body.paymentMode, 60) || 'Cash';
    const transaction: any = {
      paidAmount,
      paidDate: getText(body.paidDate, 20) || new Date().toISOString().slice(0, 10),
      paymentMode,
      transactionId: getText(body.transactionId, 200) || undefined,
      chequeNumber: getText(body.chequeNumber, 50) || undefined,
      bankName: getText(body.bankName, 100) || undefined,
      accountLast4: getText(body.accountLast4, 10) || undefined,
      recordedBy: session.id,
      recordedAt: new Date().toISOString(),
    };

    const newPaidAmount = currentPaid + paidAmount;
    const newStatus = newPaidAmount >= invoice.amount ? 'paid' : 'partial';

    await collection.updateOne(
      { id: invoiceId },
      {
        $push: { transactions: transaction },
        $set: {
          paidAmount: newPaidAmount,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const updated = await collection.findOne({ id: invoiceId });

    return NextResponse.json({
      feeInvoice: normalizeDoc(updated),
      message: `Payment of Rs.${paidAmount} recorded successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
  }
}
