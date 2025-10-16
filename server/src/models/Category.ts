import mongoose, { Document, Schema, Types } from 'mongoose';

// Типы категорий
export type CategoryType = 'GLASSES' | 'SHOES' | 'CLOTHING' | 'ACCESSORIES';

// Интерфейс для иерархической категории
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: Types.ObjectId;
  level: number; // 0 - корневая категория, 1 - подкатегория
  categoryType: CategoryType; // Тип основной категории
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  categoryType: {
    type: String,
    enum: ['GLASSES', 'SHOES', 'CLOTHING', 'ACCESSORIES'],
    required: true
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
categorySchema.index({ parentId: 1, sortOrder: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ categoryType: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);