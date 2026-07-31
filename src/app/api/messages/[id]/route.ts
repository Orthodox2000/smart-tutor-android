import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';
import { logAction } from '@/lib/audit-log';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

function getSessionUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/smart_tutor_session=([^;]+)/);
    if (!tokenMatch) return null;
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as any;
    return { id: decoded.id, uid: decoded.uid, role: decoded.role, name: decoded.username || decoded.id };
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, body: msgBody, channel, expiresAt } = body;

    await connectToDatabase();
    const update: any = {};
    if (title !== undefined) update.title = title;
    if (msgBody !== undefined) update.body = msgBody;
    if (channel !== undefined) update.channel = channel;
    if (expiresAt !== undefined) update.expiresAt = expiresAt;

    const message = await Message.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

    logAction({
      action: 'update',
      category: 'messages',
      details: `Message updated (${message.title || id})`,
      metadata: { messageId: id, fields: Object.keys(update) },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
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
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    await Message.findByIdAndDelete(id);

    logAction({
      action: 'delete',
      category: 'messages',
      details: `Message deleted (${id})`,
      metadata: { messageId: id },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
