export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  mainImage: string | null;
  images: ProductImage[];
  category: Category | string; // Can be either populated Category object or just ID
  categoryPath?: Category[];
  country?: string;
  rating?: number;
  reviews?: Review[];
  reviewsCount?: number;
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
  isActive?: boolean;
  sortOrder?: number;
  attributes?: ProductAttributes;
  createdAt?: Date;
  updatedAt?: Date;
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
  userId?: {
    firstName: string;
    lastName: string;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: User;
  userId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  customerEmail: string;
  customerPhone?: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingZip: string;
  shippingCountry: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  paymentMethod?: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id: string;
  productId: string | Product;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product?: Product; // Populated product data
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders?: Order[];
  topProducts?: Product[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}