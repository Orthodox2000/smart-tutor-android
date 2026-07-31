import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';
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

export async function PATCH(request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const { notificationId } = await params;
    const body = await request.json();
    if (typeof body.read !== 'boolean') {
      return NextResponse.json({ error: 'read (boolean) is required' }, { status: 400 });
    }

    await connectToDatabase();
    const notification = await Notification.findById(notificationId);
    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

    if (body.read) {
      await Notification.findByIdAndUpdate(notificationId, { $addToSet: { readBy: session.id } });
    } else {
      await Notification.findByIdAndUpdate(notificationId, { $pull: { readBy: session.id } });
    }

    logAction({
      action: 'update',
      category: 'communication',
      details: `Notification marked ${body.read ? 'read' : 'unread'} (${notificationId})`,
      metadata: { notificationId, read: body.read },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    const updated = await Notification.findById(notificationId);
    return NextResponse.json({
      notification: {
        id: updated!._id.toString(),
        title: updated!.title,
        message: updated!.message,
        type: updated!.type || 'general',
        link: updated!.link || null,
        read: body.read,
        createdAt: updated!.createdAt,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const { notificationId } = await params;
    await connectToDatabase();
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

    logAction({
      action: 'delete',
      category: 'communication',
      details: `Notification deleted (${notificationId})`,
      metadata: { notificationId },
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
