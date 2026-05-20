import mongoose, { Schema, Document } from 'mongoose';

export type LibraryCategory = 'Textbook' | 'Faculty Note' | 'Mock Paper';

export interface ILibraryItem extends Document {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  megaFileId?: string;
  megaFileName: string;
  megaFileUrl: string;
  audience: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryItemSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  megaFileId: { type: String },
  megaFileName: { type: String, required: true },
  megaFileUrl: { type: String, required: true },
  audience: [{ type: String, default: ['student', 'educator', 'admin'] }],
  createdBy: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.LibraryItem || mongoose.model<ILibraryItem>('LibraryItem', LibraryItemSchema, 'digital_library');
