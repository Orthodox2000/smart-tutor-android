import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  uid?: string;
  username?: string;
  email: string;
  password?: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  role: 'student' | 'teacher' | 'educator' | 'admin' | 'parent' | 'counsellor';
  label?: string;
  program?: string;
  status?: string;
  verified?: boolean;
  permissions?: any[];
  emailKey?: string;
  mobile?: string;
  dob?: string;
  gender?: string;
  educationLevel?: string;
  enrolledCourse?: string;
  batchNumber?: string;
  assignedFacultyIds?: string[];
  assignedFacultyNames?: string[];
  parentEmail?: string;
  parentMobile?: string;
  linkedStudentId?: string;
  linkedStudentMobile?: string;
  qualification?: string;
  experience?: string;
  subjects?: string[];
  examQualifications?: any[];
  cvUrl?: string;
  photoIdFrontUrl?: string;
  photoIdBackUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  guardianPhone?: string;
  deletedAt?: Date;
  counsellorId?: string;
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
  role: { type: String, enum: ['student', 'teacher', 'educator', 'admin', 'parent', 'counsellor'], default: 'student' },
  label: { type: String },
  program: { type: String },
  status: { type: String, default: 'active' },
  verified: { type: Boolean, default: false },
  permissions: { type: Schema.Types.Mixed },
  emailKey: { type: String },
  mobile: { type: String },
  dob: { type: String },
  gender: { type: String },
  educationLevel: { type: String },
  enrolledCourse: { type: String },
  batchNumber: { type: String },
  assignedFacultyIds: { type: [String], default: [] },
  assignedFacultyNames: { type: [String], default: [] },
  parentEmail: { type: String },
  parentMobile: { type: String },
  linkedStudentId: { type: String },
  linkedStudentMobile: { type: String },
  qualification: { type: String },
  experience: { type: String },
  subjects: { type: [String] },
  examQualifications: { type: Schema.Types.Mixed },
  cvUrl: { type: String },
  photoIdFrontUrl: { type: String },
  photoIdBackUrl: { type: String },
  addressLine1: { type: String },
  addressLine2: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  guardianPhone: { type: String },
  deletedAt: { type: Date },
  counsellorId: { type: String },
}, { timestamps: true });

// Clear cached model to avoid validation errors when schema changes during development
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
