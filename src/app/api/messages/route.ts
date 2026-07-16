import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Message from '../../../models/Message';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export const dynamic = 'force-dynamic';

function getSessionUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/smart_tutor_session=([^;]+)/);
    if (!tokenMatch) return null;
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as any;
    return { id: decoded.id, uid: decoded.uid, role: decoded.role };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);

    await connectToDatabase();

    const now = new Date().toISOString();
    const documents = await Message.find({}).sort({ createdAt: -1 }).limit(50);

    const messages = documents
      .filter((doc: any) => {
        if (!doc.expiresAt) return true;
        return new Date(doc.expiresAt) > new Date(now);
      })
      .filter((doc: any) => {
        if (!session) {
          const audience = Array.isArray(doc.audience) ? doc.audience : [doc.audience].filter(Boolean);
          return audience.includes('all') || audience.includes('students') || audience.length === 0;
        }
        const audience = Array.isArray(doc.audience) ? doc.audience : [doc.audience].filter(Boolean);
        if (!audience.includes(session.role) && !audience.includes('all')) return false;
        const userIds = Array.isArray(doc.userIds) ? doc.userIds : [];
        if (userIds.length === 0) return true;
        return userIds.includes(session.id);
      })
      .map((doc: any) => ({
        id: doc._id.toString(),
        title: doc.title,
        body: doc.body,
        channel: doc.channel,
        author: doc.author || 'System',
        audience: doc.audience || [],
        userIds: doc.userIds || [],
        createdAt: doc.createdAt || doc._id.getTimestamp?.()?.toISOString() || new Date().toISOString(),
        expiresAt: doc.expiresAt || null,
      }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ messages: [], error: error.message }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    if (!['admin', 'educator'].includes(session.role)) {
      return NextResponse.json({ error: 'Only admins and educators can post messages.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();

    const title = (body.title || '').toString().trim().slice(0, 80);
    const content = (body.body || body.content || '').toString().trim().slice(0, 280);
    const channel = (body.channel || body.type || 'general').toString().trim().slice(0, 40);
    const audience = Array.isArray(body.audience) ? body.audience : [body.target || 'all'].filter(Boolean);
    const userIds = Array.isArray(body.userIds) ? body.userIds : [];
    const expiresAt = body.expiresAt || null;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and message body are required.' }, { status: 400 });
    }

    const message = await Message.create({
      title,
      body: content,
      channel,
      author: body.authorName || body.author || session.id,
      audience,
      userIds,
      expiresAt,
    });

    return NextResponse.json({
      message: {
        id: message._id.toString(),
        title: message.title,
        body: message.body,
        channel: message.channel,
        author: message.author,
        audience: message.audience,
        userIds: message.userIds,
        createdAt: message.createdAt,
        expiresAt: message.expiresAt,
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete messages.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await connectToDatabase();
    const deleted = await Message.findByIdAndDelete(id);
    return NextResponse.json({ success: true, deleted: !!deleted });
  } catch (error: any) {
    return NextResponse.json({ success: true });
  }
}
