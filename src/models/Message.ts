import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  type: 'announcement' | 'resource' | 'alert';
  target: 'all' | 'students' | 'teachers' | 'admins';
  batchTarget?: string;
  photoURL?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'resource', 'alert'], default: 'announcement' },
  target: { type: String, enum: ['all', 'students', 'teachers', 'admins'], default: 'all' },
  batchTarget: { type: String },
  photoURL: { type: String },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
