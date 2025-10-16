export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  mainImage: string | null;
  thumbnailUrl?: string;
  images: ProductImage[];
  category?: Category;
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  categoryPath?: Category[];
  country?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  isBrandNew?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  description?: string;
  shortDescription?: string;
  variants?: ProductVariant[];
  material?: string;
  brand?: string;
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  seoTitle?: string;
  seoDescription?: string;
  features?: string[];
  categoryType?: 'GLASSES' | 'SHOES' | 'CLOTHING' | 'ACCESSORIES';
  attributes?: GlassesAttributes | ShoesAttributes | ClothingAttributes | AccessoriesAttributes;
}

// Интерфейсы для специфических атрибутов категорий
export interface GlassesAttributes {
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  color?: string;
  season?: 'SPRING_SUMMER' | 'AUTUMN_WINTER' | 'ALL_SEASON';
  frameMaterial?: string;
  frameStyle?: 'FULL_RIM' | 'RIMLESS' | 'SEMI_RIMLESS';
  lensType?: string;
  availability?: 'IN_STOCK' | 'PRE_ORDER';
}

export interface ShoesAttributes {
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  color?: string;
  season?: 'SPRING_SUMMER' | 'AUTUMN_WINTER' | 'ALL_SEASON';
  shoeSizeSystem?: 'RUS' | 'EU' | 'US' | 'CM';
  shoeSize?: number;
  upperMaterial?: string;
  soleType?: string;
  brandTechnology?: string[];
  features?: string[];
  style?: string;
  availability?: 'IN_STOCK' | 'PRE_ORDER';
}

export interface ClothingAttributes {
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  color?: string;
  season?: 'SPRING_SUMMER' | 'AUTUMN_WINTER' | 'ALL_SEASON';
  clothingSizeSystem?: 'INT' | 'RUS' | 'US';
  clothingSize?: string;
  fabric?: string;
  pattern?: string;
  style?: string;
  availability?: 'IN_STOCK' | 'PRE_ORDER';
}

export interface AccessoriesAttributes {
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  color?: string;
  season?: 'SPRING_SUMMER' | 'AUTUMN_WINTER' | 'ALL_SEASON';
  material?: string;
  style?: string;
  availability?: 'IN_STOCK' | 'PRE_ORDER';
}

export interface ProductImage {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  type: 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY';
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
  attributes?: Record<string, any>;
}

export interface ProductAttributes {
  // Общие атрибуты
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  color?: string;
  season?: 'SPRING_SUMMER' | 'AUTUMN_WINTER' | 'ALL_SEASON';
  collectionYear?: number;
  
  // Атрибуты для очков
  frameMaterial?: string;
  frameStyle?: 'FULL_RIM' | 'RIMLESS' | 'SEMI_RIMLESS';
  lensType?: string;
  
  // Атрибуты для обуви
  shoeSizeSystem?: 'RUS' | 'EU' | 'US' | 'CM';
  shoeSize?: number;
  upperMaterial?: string;
  soleType?: string;
  brandTechnology?: string[];
  features?: string[];
  
  // Атрибуты для одежды
  clothingSizeSystem?: 'INT' | 'RUS' | 'US';
  clothingSize?: string;
  fabric?: string;
  pattern?: string;
  style?: string;
  
  // Другие атрибуты
  purchaseType?: 'INSTANT' | 'MANAGER_CONFIRMATION';
  availability?: 'IN_STOCK' | 'PRE_ORDER';
  комплектация?: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface CategoryFilter {
  key: string;
  label: string;
  type: 'SELECT' | 'MULTI_SELECT' | 'RANGE' | 'CHECKBOX' | 'COLOR';
  options?: FilterOption[];
  min?: number;
  max?: number;
  unit?: string;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  level: number;
  categoryType?: 'GLASSES' | 'SHOES' | 'CLOTHING' | 'ACCESSORIES';
  children?: Category[];
  productsCount?: number;
}

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}