import { NextResponse } from 'next/server';
import connectToDatabase from '../src/lib/mongodb';
import DirectMessage from '../src/models/DirectMessage';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export const dynamic = 'force-dynamic';

function getSessionUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/smart_tutor_session=([^;]+)/);
    if (!tokenMatch) return null;
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as any;
    return { id: decoded.id, uid: decoded.uid, role: decoded.role, username: decoded.username };
  } catch {
    return null;
  }
}

async function isChatDisabled(): Promise<boolean> {
  try {
    await connectToDatabase();
    const settings = await (mongoose.connection as any).db?.collection('site_settings').findOne({ key: 'chat' });
    return settings?.enabled === false;
  } catch {
    return false;
  }
}

const CONTACT_PATTERNS = [
  { regex: /\b\d{10}\b/, type: 'phone number' },
  { regex: /\b[\w.-]+@[\w.-]+\.\w+\b/, type: 'email address' },
  { regex: /@\w{3,}/, type: 'social media handle' },
  { regex: /\b(instagram|whatsapp|telegram|snapchat|facebook)\b/i, type: 'social media reference' },
  { regex: /\bhttps?:\/\/\S+/i, type: 'link' },
];

function checkContentModeration(content: string): string | null {
  for (const pattern of CONTACT_PATTERNS) {
    if (pattern.regex.test(content)) {
      return `Message blocked: sharing ${pattern.type} is not allowed`;
    }
  }
  return null;
}

async function getAllowedReceiverIds(session: { id: string; role: string; uid?: string }): Promise<string[]> {
  if (session.role === 'admin') {
    const users = await User.find({}).select('id uid').lean();
    return users.map((u: any) => u.id || u.uid).filter(Boolean);
  }

  const me = await User.findOne({ $or: [{ id: session.id }, { uid: session.uid }] }).lean() as any;
  if (!me) return [];

  if (session.role === 'student') {
    const batchMates = await User.find({
      batchNumber: me.batchNumber,
      $or: [{ role: 'teacher' }, { role: 'educator' }],
    }).select('id uid').lean();
    const teacherIds = batchMates.map((u: any) => u.id || u.uid).filter(Boolean);

    const parents = await User.find({ role: 'parent' }).select('id uid batchNumber').lean();
    const parentIds = parents
      .filter((p: any) => !p.batchNumber || p.batchNumber === me.batchNumber)
      .map((p: any) => p.id || p.uid)
      .filter(Boolean);

    return [...new Set([...teacherIds, ...parentIds])];
  }

  if (session.role === 'educator' || session.role === 'teacher') {
    const students = await User.find({
      batchNumber: me.batchNumber,
      $or: [{ role: 'student' }, { role: 'parent' }],
    }).select('id uid').lean();
    const studentIds = students.map((u: any) => u.id || u.uid).filter(Boolean);

    const admins = await User.find({ role: 'admin' }).select('id uid').lean();
    const adminIds = admins.map((u: any) => u.id || u.uid).filter(Boolean);

    return [...new Set([...studentIds, ...adminIds])];
  }

  if (session.role === 'parent') {
    const children = await User.find({
      role: 'student',
      batchNumber: me.batchNumber,
    }).select('id uid batchNumber').lean();

    const childBatches = [...new Set(children.map((c: any) => c.batchNumber).filter(Boolean))];
    const teachers = await User.find({
      batchNumber: { $in: childBatches },
      $or: [{ role: 'teacher' }, { role: 'educator' }],
    }).select('id uid').lean();

    const childIds = children.map((c: any) => c.id || c.uid).filter(Boolean);
    const teacherIds = teachers.map((t: any) => t.id || t.uid).filter(Boolean);
    const admins = await User.find({ role: 'admin' }).select('id uid').lean();
    const adminIds = admins.map((a: any) => a.id || a.uid).filter(Boolean);

    return [...new Set([...childIds, ...teacherIds, ...adminIds])];
  }

  return [];
}

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    await connectToDatabase();

    if (userId) {
      const allowed = await getAllowedReceiverIds(session);
      if (!allowed.includes(userId)) {
        return NextResponse.json({ error: 'Not permitted to chat with this user' }, { status: 403 });
      }

      const myIds = [session.id, session.uid].filter(Boolean);
      const messages = await DirectMessage.find({
        $or: [
          { senderId: { $in: myIds }, receiverId: userId },
          { senderId: userId, receiverId: { $in: myIds } },
        ],
      }).sort({ createdAt: 1 }).limit(200).lean();

      await DirectMessage.updateMany(
        { senderId: userId, receiverId: { $in: myIds }, read: false },
        { $set: { read: true } }
      );

      return NextResponse.json({
        messages: messages.map((m: any) => ({
          id: m._id.toString(),
          senderId: m.senderId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          receiverId: m.receiverId,
          receiverName: m.receiverName,
          receiverRole: m.receiverRole,
          content: m.content,
          contentType: m.contentType || 'text',
          fileUrl: m.fileUrl,
          read: m.read,
          createdAt: m.createdAt,
        })),
      });
    }

    const allowed = await getAllowedReceiverIds(session);
    const allUserIds = [...new Set([session.id, session.uid, ...allowed].filter(Boolean))];

    const recentMessages = await DirectMessage.find({
      $or: [
        { senderId: { $in: allUserIds }, receiverId: { $in: allUserIds } },
      ],
    }).sort({ createdAt: -1 }).limit(200).lean();

    const conversationMap = new Map<string, any>();
    for (const msg of recentMessages) {
      const myIds = [session.id, session.uid].filter(Boolean);
      const otherId = myIds.includes(msg.senderId) ? msg.receiverId : msg.senderId;
      const otherName = myIds.includes(msg.senderId) ? msg.receiverName : msg.senderName;
      const otherRole = myIds.includes(msg.senderId) ? msg.receiverRole : msg.senderRole;

      if (!conversationMap.has(otherId)) {
        const unread = recentMessages.filter(
          (m: any) => m.senderId === otherId && !m.read && myIds.includes(m.receiverId)
        ).length;

        conversationMap.set(otherId, {
          userId: otherId,
          name: otherName,
          role: otherRole,
          lastMessage: msg.contentType === 'image' ? '📷 Image' : msg.contentType === 'file' ? '📎 File' : msg.content,
          lastMessageAt: msg.createdAt,
          unread,
        });
      }
    }

    const contacts = await User.find({ id: { $in: allowed } }).select('id uid name displayName role batchNumber photoURL').lean();
    for (const contact of contacts) {
      const cid = contact.id || (contact as any).uid;
      if (!conversationMap.has(cid)) {
        conversationMap.set(cid, {
          userId: cid,
          name: (contact as any).displayName || (contact as any).name || cid,
          role: (contact as any).role,
          lastMessage: null,
          lastMessageAt: null,
          unread: 0,
        });
      }
    }

    const conversations = Array.from(conversationMap.values()).sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    if (await isChatDisabled()) {
      return NextResponse.json({ error: 'Chat is currently disabled by administrator', chatDisabled: true }, { status: 403 });
    }

    const body = await request.json();
    const receiverId = (body.receiverId || '').toString().trim();
    const content = (body.content || body.message || '').toString().trim();
    const contentType = (body.contentType || 'text') as 'text' | 'image' | 'file';
    const fileUrl = body.fileUrl || undefined;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'receiverId and content required' }, { status: 400 });
    }

    const allowed = await getAllowedReceiverIds(session);
    if (!allowed.includes(receiverId)) {
      return NextResponse.json({ error: 'Not permitted to chat with this user' }, { status: 403 });
    }

    if (contentType === 'text') {
      const moderationResult = checkContentModeration(content);
      if (moderationResult) {
        return NextResponse.json({ error: moderationResult, blocked: true }, { status: 400 });
      }
    }

    await connectToDatabase();

    const me = await User.findOne({ $or: [{ id: session.id }, { uid: session.uid }] }).lean() as any;
    const receiver = await User.findOne({ $or: [{ id: receiverId }, { uid: receiverId }] }).lean() as any;

    if (!receiver) return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });

    const msg = await DirectMessage.create({
      senderId: session.id || session.uid,
      senderName: me?.displayName || me?.name || me?.username || session.username || session.id,
      senderRole: session.role,
      receiverId: receiverId,
      receiverName: receiver.displayName || receiver.name || receiver.username || receiverId,
      receiverRole: receiver.role,
      content: content.slice(0, 5000),
      contentType,
      fileUrl,
      read: false,
    });

    return NextResponse.json({
      message: {
        id: msg._id.toString(),
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        receiverId: msg.receiverId,
        receiverName: msg.receiverName,
        receiverRole: msg.receiverRole,
        content: msg.content,
        contentType: msg.contentType,
        fileUrl: msg.fileUrl,
        read: msg.read,
        createdAt: msg.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const body = await request.json();
    const userId = (body.userId || '').toString().trim();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await connectToDatabase();

    const myIds = [session.id, session.uid].filter(Boolean);
    await DirectMessage.updateMany(
      { senderId: userId, receiverId: { $in: myIds }, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
