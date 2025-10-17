import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, Product, Category, Order, DashboardStats } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.dvberry.ru/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    // Сервер возвращает данные в формате { success: true, data: { user, token } }
    return response.data.data;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data?.user || response.data;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data.data?.user || response.data;
  },
};

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ products: Product[]; total: number; pagination?: any }> => {
    const response = await api.get('/products', { params });
    const data = response.data.data || response.data;
    // Transform the response to ensure category is properly mapped
    const products = data.products?.map((product: any) => ({
      ...product,
      category: product.categoryId || product.category
    })) || [];
    return {
      products,
      total: data.total || data.pagination?.total || 0,
      pagination: data.pagination
    };
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    const product = response.data.data?.product || response.data;
    // Transform the response to ensure category is properly mapped
    return {
      ...product,
      category: product.categoryId || product.category
    };
  },
  
  create: async (data: Omit<Product, '_id'>): Promise<Product> => {
    // Transform the data to match server expectations
    const transformedData = {
      ...data,
      // Change 'category' to 'categoryId' to match server validation
      categoryId: typeof data.category === 'object' ? data.category._id : data.category,
      // Ensure images are in the correct format
      images: data.images?.map((img, index) => ({
        url: typeof img === 'string' ? img : img.url,
        alt: data.name,
        isMain: index === 0,
        sortOrder: index
      })) || []
    };
    
    const response = await api.post('/products', transformedData);
    // The server returns the product with populated category
    const product = response.data.data?.product || response.data;
    // Transform the response to match the expected format
    return {
      ...product,
      category: product.categoryId || product.category
    };
  },
  
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    // Transform the data to match server expectations
    const transformedData: any = {
      ...data,
      // Change 'category' to 'categoryId' to match server validation
      ...(data.category && {
        categoryId: typeof data.category === 'object' ? data.category._id : data.category
      }),
      // Ensure images are in the correct format if they exist
      ...(data.images && {
        images: data.images.map((img, index) => ({
          url: typeof img === 'string' ? img : img.url,
          alt: data.name || '',
          isMain: index === 0,
          sortOrder: index
        }))
      })
    };
    
    // Remove undefined fields
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });
    
    const response = await api.put(`/products/${id}`, transformedData);
    // The server returns the product with populated category
    const product = response.data.data?.product || response.data;
    // Transform the response to match the expected format
    return {
      ...product,
      category: product.categoryId || product.category
    };
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const categoriesApi = {
  getAll: async (includeProducts?: boolean): Promise<Category[]> => {
    const response = await api.get('/categories', {
      params: { includeProducts: includeProducts ? 'true' : undefined }
    });
    // Проверяем, если данные обернуты в объект с полем data.categories
    return response.data.data?.categories || response.data;
  },
  
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data?.category || response.data;
  },
  
  create: async (data: Omit<Category, '_id'>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data.data?.category || response.data;
  },
  
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data?.category || response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export const ordersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; total: number; pagination?: any }> => {
    const response = await api.get('/orders', { params });
    const data = response.data.data || response.data;
    return {
      orders: data.orders || [],
      total: data.total || data.pagination?.total || 0,
      pagination: data.pagination
    };
  },
  
  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data?.order || response.data;
  },
  
  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data.data?.order || response.data;
  },
  
  // For CRM purposes, we need to be able to get all orders (not just for a specific user)
  getAllForCRM: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; total: number; pagination?: any }> => {
    // This endpoint needs to be created on the server
    const response = await api.get('/admin/orders', { params });
    const data = response.data.data || response.data;
    return {
      orders: data.orders || [],
      total: data.total || data.pagination?.total || 0,
      pagination: data.pagination
    };
  },
};

export const customersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ customers: User[]; total: number; pagination?: any }> => {
    // This endpoint needs to be created on the server
    const response = await api.get('/admin/customers', { params });
    const data = response.data.data || response.data;
    return {
      customers: data.customers || [],
      total: data.total || data.pagination?.total || 0,
      pagination: data.pagination
    };
  },
  
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data.data?.user || response.data;
  },
};

export const uploadApi = {
  uploadSingle: async (file: File): Promise<{ filename: string; thumbnailFilename: string; originalName: string; size: number; url: string; thumbnailUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
  
  uploadMultiple: async (files: File[]): Promise<{ filename: string; thumbnailFilename: string; originalName: string; size: number; url: string; thumbnailUrl: string }[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.files;
  },
  
  deleteImage: async (filename: string): Promise<void> => {
    await api.delete(`/upload/${filename}`);
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    // This endpoint needs to be created on the server
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data?.stats || response.data;
  },
};

export default api;