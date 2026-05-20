import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Message from '../../../models/Message';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const batch = searchParams.get('batch');
    
    await connectToDatabase();
    
    const now = new Date();
    // Base filter for expiration
    const expirationFilter = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    };

    let filter: any = { ...expirationFilter };

    if (role === 'student') {
      filter.target = { $in: ['all', 'students'] };
      if (batch) {
        // Must match either no batch target OR the student's batch
        filter.$or = [
          ...expirationFilter.$or,
          { batchTarget: { $exists: false } },
          { batchTarget: null },
          { batchTarget: batch }
        ];
        // Note: The above $or merging might be messy. Let's do it cleaner:
        filter = {
          $and: [
            expirationFilter,
            { target: { $in: ['all', 'students'] } },
            { $or: [
              { batchTarget: { $exists: false } },
              { batchTarget: null },
              { batchTarget: '' },
              { batchTarget: batch }
            ]}
          ]
        };
      } else {
        filter = {
          $and: [
            expirationFilter,
            { target: { $in: ['all', 'students'] } }
          ]
        };
      }
    } else if (role === 'teacher') {
      filter.target = { $in: ['all', 'teachers'] };
    }
    // Admins see all by default (no filtering on target)

    const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const message = await Message.create(body);
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await connectToDatabase();
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
