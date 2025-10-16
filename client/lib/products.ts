import { api } from './api';
import { Product } from '@/types/product';

export const getPopularProducts = async (limit: number = 6): Promise<Product[]> => {
  try {
    return await api.products.getPopular(limit);
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }
};

export const getNewProducts = async (limit: number = 6): Promise<Product[]> => {
  try {
    return await api.products.getNew(limit);
  } catch (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
};

export const getProductsOnSale = async (limit: number = 6): Promise<Product[]> => {
  try {
    return await api.products.getOnSale(limit);
  } catch (error) {
    console.error('Error fetching products on sale:', error);
    return [];
  }
};

export const getAllProducts = async (params?: {
  category?: string;
  search?: string;
  isBrandNew?: boolean;
  isOnSale?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: string;
}): Promise<{ data: Product[]; summary: { total: number; page: number; pages: number } }> => {
  try {
    return await api.products.getAll(params);
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], summary: { total: 0, page: 1, pages: 0 } };
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await api.products.getById(id);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    return await api.products.getBySlug(slug);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    return await api.products.getByCategory(category);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    return await api.products.search(query);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};