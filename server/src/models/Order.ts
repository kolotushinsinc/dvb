import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: Types.ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  
  // Customer Info
  customerEmail: string;
  customerPhone?: string;
  
  // Shipping Address
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingZip: string;
  shippingCountry: string;
  
  // Billing Address
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  
  // Payment
  paymentMethod?: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentIntentId?: string;
  
  // Tracking
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  shippingFirstName: {
    type: String,
    required: true,
    trim: true
  },
  shippingLastName: {
    type: String,
    required: true,
    trim: true
  },
  shippingAddress: {
    type: String,
    required: true,
    trim: true
  },
  shippingCity: {
    type: String,
    required: true,
    trim: true
  },
  shippingState: {
    type: String,
    trim: true
  },
  shippingZip: {
    type: String,
    required: true,
    trim: true
  },
  shippingCountry: {
    type: String,
    required: true,
    trim: true
  },
  billingFirstName: {
    type: String,
    trim: true
  },
  billingLastName: {
    type: String,
    trim: true
  },
  billingAddress: {
    type: String,
    trim: true
  },
  billingCity: {
    type: String,
    trim: true
  },
  billingState: {
    type: String,
    trim: true
  },
  billingZip: {
    type: String,
    trim: true
  },
  billingCountry: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentIntentId: {
    type: String,
    trim: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  items: [orderItemSchema]
}, {
  timestamps: true
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);