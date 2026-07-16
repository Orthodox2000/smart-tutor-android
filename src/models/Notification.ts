import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'announcement' | 'alert' | 'message' | 'reminder' | 'general';
  link?: string;
  audience: 'everyone' | 'selected-users';
  userIds?: string[];
  readBy?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'alert', 'message', 'reminder', 'general'], default: 'general' },
  link: { type: String },
  audience: { type: String, enum: ['everyone', 'selected-users'], default: 'everyone' },
  userIds: [{ type: String }],
  readBy: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
