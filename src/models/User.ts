import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string; // From new schema
  uid?: string; // Firebase UID (keeping for compatibility)
  username?: string; // Roll Number
  email: string;
  password?: string;
  name: string; // From new schema
  displayName?: string; // Keeping for compatibility
  photoURL?: string;
  role: 'student' | 'teacher' | 'admin';
  label?: string; // From new schema
  program?: string; // From new schema
  status?: string; // From new schema
  permissions?: any[]; // From new schema
  emailKey?: string; // From new schema
  mobile?: string;
  dob?: string;
  educationLevel?: string;
  enrolledCourse?: string;
  batchNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  id: { type: String, unique: true },
  uid: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true },
  password: { type: String },
  name: { type: String },
  displayName: { type: String },
  photoURL: { type: String },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  label: { type: String },
  program: { type: String },
  status: { type: String, default: 'active' },
  permissions: { type: Schema.Types.Mixed },
  emailKey: { type: String },
  mobile: { type: String },
  dob: { type: String },
  educationLevel: { type: String },
  enrolledCourse: { type: String },
  batchNumber: { type: String },
}, { timestamps: true });

// Clear cached model to avoid validation errors when schema changes during development
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
