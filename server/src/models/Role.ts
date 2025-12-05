import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission {
  resource: string; // e.g., 'products', 'orders', 'users', 'customers'
  actions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
}

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: IPermission[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const permissionSchema = new Schema<IPermission>({
  resource: {
    type: String,
    required: true
  },
  actions: {
    read: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    export: { type: Boolean, default: false }
  }
}, { _id: false });

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [permissionSchema],
  isSystem: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', roleSchema);
