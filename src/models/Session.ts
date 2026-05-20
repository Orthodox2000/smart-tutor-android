import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  title: string;
  meetLink: string;
  target: 'all' | 'students' | 'teachers';
  batchTarget?: string;
  teacherId: string;
  teacherName: string;
  isActive: boolean;
  startTime: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema({
  title: { type: String, required: true },
  meetLink: { type: String, required: true },
  target: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
  batchTarget: { type: String },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  startTime: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
