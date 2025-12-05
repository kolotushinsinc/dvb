import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: mongoose.Types.ObjectId;
  isAdmin: boolean;
  isManager: boolean;
  isClient: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isManager: {
    type: Boolean,
    default: false
  },
  isClient: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
