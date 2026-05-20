import mongoose, { Schema, Document } from 'mongoose';

export interface ITestResult extends Document {
  testId: mongoose.Types.ObjectId;
  studentUid: string; // Link to Firebase UID
  studentName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: number[]; // Indices of answers provided by student
  completedAt: Date;
}

const TestResultSchema: Schema = new Schema({
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  studentUid: { type: String, required: true },
  studentName: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  answers: [{ type: Number }],
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.TestResult || mongoose.model<ITestResult>('TestResult', TestResultSchema);
