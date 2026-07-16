import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  title: string;
  body: string;
  channel: string;
  author?: string;
  audience: string[];
  userIds?: string[];
  createdAt?: string;
  expiresAt?: string | null;
}

const MessageSchema: Schema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  channel: { type: String, required: true },
  author: { type: String },
  audience: { type: [String], default: ['student', 'educator', 'admin', 'parent'] },
  userIds: { type: [String] },
  expiresAt: { type: String },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
