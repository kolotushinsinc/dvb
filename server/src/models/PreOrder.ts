import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPreOrderItem {
  product: Types.ObjectId;
  quantity: number;
  basePrice: number; // Цена "от" на момент создания предзаказа
  size?: string;
  color?: string;
}

export interface IManagerConfirmation {
  confirmedPrice: number;
  confirmedBy: Types.ObjectId;
  confirmedAt: Date;
  notes?: string;
}

export interface IPreOrder extends Document {
  user: Types.ObjectId;
  items: IPreOrderItem[];
  status: 'PENDING' | 'PRICE_CONFIRMED' | 'AWAITING_PAYMENT' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  managerConfirmation?: IManagerConfirmation;
  totalBasePrice: number; // Общая базовая цена
  totalConfirmedPrice?: number; // Общая подтвержденная цена
  createdAt: Date;
  expiresAt: Date; // +24 часа от создания
  paidAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

const preOrderItemSchema = new Schema<IPreOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  size: {
    type: String
  },
  color: {
    type: String
  }
});

const managerConfirmationSchema = new Schema<IManagerConfirmation>({
  confirmedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  confirmedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confirmedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

const preOrderSchema = new Schema<IPreOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [preOrderItemSchema],
  status: {
    type: String,
    enum: ['PENDING', 'PRICE_CONFIRMED', 'AWAITING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING'
  },
  managerConfirmation: managerConfirmationSchema,
  totalBasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalConfirmedPrice: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
preOrderSchema.index({ user: 1, status: 1 });
preOrderSchema.index({ status: 1, expiresAt: 1 });
preOrderSchema.index({ createdAt: -1 });

// Middleware для автоматической установки expiresAt
preOrderSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Устанавливаем срок истечения +24 часа от создания
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model<IPreOrder>('PreOrder', preOrderSchema);
