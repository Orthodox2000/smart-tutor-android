import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation?: string;
}

export interface ITest extends Document {
  title: string;
  subject: string;
  category: string; // Test or Assignment
  difficulty: 'Easy' | 'Intermediate' | 'Hard';
  duration?: number; // in minutes
  questions?: IQuestion[];
  fileUrl?: string; // For paper-based tests
  senderName: string;
  senderRole: string;
  isActive: boolean;
  createdAt: Date;
}

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
});

const TestSchema: Schema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Test", "Assignment"
  difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Hard'], default: 'Intermediate' },
  duration: { type: Number },
  questions: [QuestionSchema],
  fileUrl: { type: String },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
