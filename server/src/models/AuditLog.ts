import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string; // Cached for display
  action: 'create' | 'update' | 'delete';
  entityType: 'user' | 'role' | 'permission';
  entityId?: mongoose.Types.ObjectId;
  entityName?: string; // Cached for display
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['user', 'role', 'permission'],
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId
  },
  entityName: {
    type: String
  },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  metadata: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
