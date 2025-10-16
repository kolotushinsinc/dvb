import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  isMain: boolean;
  sortOrder: number;
}

export interface IProductVariant {
  type: 'SIZE' | 'COLOR';
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
  attributes?: Record<string, any>;
}

// Базовые атрибуты для всех товаров
export interface IBaseAttributes {
  gender: 'MALE' | 'FEMALE' | 'UNISEX';
  color: string;
  season: 'SPRING_SUMMER' | 'AUTUMN_WINTER' | 'ALL_SEASON';
  availability: 'IN_STOCK' | 'PRE_ORDER';
  purchaseType: 'INSTANT' | 'MANAGER_CONFIRMATION';
}

// Атрибуты для очков
export interface IGlassesAttributes extends IBaseAttributes {
  frameMaterial: string;
  frameStyle: 'FULL_RIM' | 'RIMLESS' | 'SEMI_RIMLESS';
  lensType: string;
}

// Атрибуты для обуви
export interface IShoesAttributes extends IBaseAttributes {
  sizeSystem: 'RUS' | 'EU' | 'US' | 'CM';
  size: string;
  upperMaterial: string;
  soleType: string;
  brandTechnology: string[];
  features: string[];
}

// Атрибуты для одежды
export interface IClothingAttributes extends IBaseAttributes {
  sizeSystem: 'INT' | 'RUS' | 'US';
  size: string;
  fabric: string;
  pattern: string;
  style: string;
  technologies: string[];
  features: string[];
}

// Атрибуты для аксессуаров
export interface IAccessoriesAttributes extends IBaseAttributes {
  material: string;
  style: string;
}

// Объединенный интерфейс атрибутов товара
export type IProductAttributes =
  | { categoryType: 'GLASSES'; attributes: IGlassesAttributes }
  | { categoryType: 'SHOES'; attributes: IShoesAttributes }
  | { categoryType: 'CLOTHING'; attributes: IClothingAttributes }
  | { categoryType: 'ACCESSORIES'; attributes: IAccessoriesAttributes };

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  stock: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  country?: string;
  isActive: boolean;
  isBrandNew: boolean;
  isOnSale: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  categoryId: Types.ObjectId;
  categoryType: string; // Тип категории для определения структуры атрибутов
  attributes: IProductAttributes; // Специфические атрибуты товара
  images: IProductImage[];
  variants: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>({
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  alt: {
    type: String
  },
  isMain: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
});

const productVariantSchema = new Schema<IProductVariant>({
  type: {
    type: String,
    enum: ['SIZE', 'COLOR', 'MATERIAL', 'STYLE', 'SEASON', 'TECHNOLOGY'],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  price: {
    type: Number
  },
  stock: {
    type: Number
  },
  sku: {
    type: String
  },
  attributes: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

const productSchema = new Schema<IProduct>({
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
  shortDescription: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    type: String
  },
  brand: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBrandNew: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    trim: true
  },
  seoDescription: {
    type: String,
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryType: {
    type: String,
    enum: ['GLASSES', 'SHOES', 'CLOTHING', 'ACCESSORIES'],
    required: true
  },
  attributes: {
    type: Schema.Types.Mixed,
    required: true
  },
  images: [productImageSchema],
  variants: [productVariantSchema]
}, {
  timestamps: true
});

// Create text index for search
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text'
});

// Индексы для оптимизации запросов
productSchema.index({ categoryId: 1 });
productSchema.index({ categoryType: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'attributes.gender': 1 });
productSchema.index({ 'attributes.color': 1 });
productSchema.index({ 'attributes.season': 1 });

// Middleware для автоматического обновления типа категории
productSchema.pre('save', async function(next) {
  if (this.isModified('categoryId')) {
    try {
      const Category = mongoose.model('Category');
      const category = await Category.findById(this.categoryId);
      
      if (category) {
        this.categoryType = category.categoryType;
      }
      
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

export const Product = mongoose.model<IProduct>('Product', productSchema);