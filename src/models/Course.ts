import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  summary: string;
  description: string;
  schedule: string;
  highlights: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  schedule: { type: String },
  highlights: [{ type: String }],
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
