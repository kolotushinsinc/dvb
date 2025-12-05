import mongoose, { Document, Schema, Types } from 'mongoose';

// Fictional author interface
export interface IFictionalAuthor {
  name: string;
  age?: number;
  city?: string;
  avatar?: string;
}

export interface IReview extends Document {
  userId?: Types.ObjectId;
  productId?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED';
  isFictional: boolean;
  fictionalAuthor?: IFictionalAuthor;
  addedByAdmin: boolean;
  addedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fictionalAuthorSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  city: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  }
}, { _id: false });

const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'PUBLISHED'],
    default: 'PUBLISHED'
  },
  isFictional: {
    type: Boolean,
    default: false
  },
  fictionalAuthor: {
    type: fictionalAuthorSchema,
    required: false
  },
  addedByAdmin: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Conditional unique index - only for real users
reviewSchema.index(
  { userId: 1, productId: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      userId: { $exists: true, $ne: null },
      isFictional: false
    }
  }
);

// Validation: either userId or fictionalAuthor must be present
reviewSchema.pre('save', function(next) {
  if (this.isFictional) {
    if (!this.fictionalAuthor || !this.fictionalAuthor.name) {
      return next(new Error('Fictional author name is required for fictional reviews'));
    }
    this.userId = undefined;
  } else {
    if (!this.userId) {
      return next(new Error('User ID is required for non-fictional reviews'));
    }
    this.fictionalAuthor = undefined;
  }
  next();
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
