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

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    await connectToDatabase();

    const filter: any = session
      ? { $or: [{ audience: 'everyone' }, { audience: 'selected-users', userIds: session.id }] }
      : { audience: 'everyone' };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);

    const result = notifications.map(n => ({
      id: n._id.toString(),
      userId: session?.id || '',
      title: n.title,
      message: n.message,
      type: n.type || 'general',
      link: n.link || null,
      read: session ? (n.readBy || []).includes(session.id) : false,
      createdAt: n.createdAt,
    }));

    return NextResponse.json({ notifications: result });
  } catch (error: any) {
    return NextResponse.json({ notifications: [], error: error.message }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    if (!['admin', 'educator'].includes(session.role)) {
      return NextResponse.json({ error: 'Only admins and educators can send notifications.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { title, message, type, link, audience, userIds } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'general',
      link,
      audience: audience || 'everyone',
      userIds: userIds || [],
    });

    logAction({
      action: 'create',
      category: 'communication',
      details: `Notification sent (${title})`,
      metadata: { notificationId: notification._id?.toString?.(), title, type, audience },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 201,
    });

    return NextResponse.json({
      id: notification._id.toString(),
      success: true,
      createdCount: 1,
      notifications: [{
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type || 'general',
        link: notification.link || null,
        read: false,
        createdAt: notification.createdAt,
      }],
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { id, read } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    if (read === false) {
      await Notification.findByIdAndUpdate(id, { $pull: { readBy: session.id } });
    } else {
      await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: session.id } });
    }

    logAction({
      action: 'update',
      category: 'communication',
      details: `Notification marked ${read === false ? 'unread' : 'read'} (${id})`,
      metadata: { notificationId: id, read: read !== false },
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

export async function DELETE(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await connectToDatabase();
    await Notification.findByIdAndDelete(id);

    logAction({
      action: 'delete',
      category: 'communication',
      details: `Notification deleted (${id})`,
      metadata: { notificationId: id },
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
