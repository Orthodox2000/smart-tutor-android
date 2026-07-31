import jwt from 'jsonwebtoken';
import connectToDatabase from './mongodb';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export function getSessionUser(request: Request) {
  try {
    let token: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const tokenMatch = cookieHeader.match(/smart_tutor_session=([^;]+)/);
      token = tokenMatch?.[1] || null;
    }

    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id, uid: decoded.uid, role: decoded.role, name: decoded.username || decoded.id };
  } catch {
    return null;
  }
}

export async function getCollection(name: string) {
  await connectToDatabase();
  return (mongoose.connection as any).db.collection(name);
}

export function normalizeDoc(doc: any) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: doc.id || _id?.toString() || '', ...rest };
}
