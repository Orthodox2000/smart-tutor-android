import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  targetType: 'user' | 'message';
  targetId: string;
  targetName: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
  description: string;
  messageContent?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  resolution?: string;
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  reporterId: { type: String, required: true, index: true },
  reporterName: { type: String, required: true },
  reporterRole: { type: String, required: true },
  targetType: { type: String, enum: ['user', 'message'], required: true },
  targetId: { type: String, required: true, index: true },
  targetName: { type: String, required: true },
  reason: { type: String, enum: ['spam', 'harassment', 'inappropriate', 'fake', 'other'], required: true },
  description: { type: String, required: true },
  messageContent: { type: String },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  resolution: { type: String },
}, { timestamps: true });

ReportSchema.index({ status: 1, createdAt: -1 });

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Report;
}

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
