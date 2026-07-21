import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectMessage extends Document {
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  contentType: 'text' | 'image' | 'file';
  fileUrl?: string;
  read: boolean;
  createdAt: Date;
}

const DirectMessageSchema: Schema = new Schema({
  senderId: { type: String, required: true, index: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true, index: true },
  receiverName: { type: String, required: true },
  receiverRole: { type: String, required: true },
  content: { type: String, required: true },
  contentType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

DirectMessageSchema.index({ senderId: 1, receiverId: 1 });
DirectMessageSchema.index({ receiverId: 1, senderId: 1 });

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.DirectMessage;
}

export default mongoose.models.DirectMessage || mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
