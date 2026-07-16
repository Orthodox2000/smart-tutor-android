import jwt from 'jsonwebtoken';
import connectToDatabase from './mongodb';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export function getSessionUser(request: Request) {
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

export async function getCollection(name: string) {
  await connectToDatabase();
  return (mongoose.connection as any).db.collection(name);
}

export function normalizeDoc(doc: any) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: doc.id || _id?.toString() || '', ...rest };
}
