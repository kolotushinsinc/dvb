import { Product } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.dvberry.ru/api';

async function fetchApi(endpoint: string, options?: RequestInit) {
  // Add retry logic for failed requests
  const maxRetries = 3;
  let retryCount = 0;
  
  console.log(`API Request: ${API_BASE_URL}${endpoint}`);
  
  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include',
      });

      console.log(`API Response status: ${response.status} for ${endpoint}`);

      // If we get a 429 error, wait and retry
      if (response.status === 429) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw new Error('Too many requests. Please try again later.');
        }
        // Exponential backoff: wait longer between each retry
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        // For auth endpoints, 401/404 might mean user is not authenticated
        if (endpoint.includes('/auth/') && (response.status === 401 || response.status === 404)) {
          const error = await response.json().catch(() => ({}));
          console.log('Auth endpoint returned', response.status, '- user likely not authenticated');
          throw new Error('Not authenticated');
        }
        
        let error;
        try {
          error = await response.json();
        } catch (e) {
          // If response is not JSON
          error = { message: `HTTP error! status: ${response.status}` };
        }
        console.error('API Error:', error);
        throw new Error(error.message || 'API request failed');
      }

      const data = await response.json();
      console.log(`✅ API Response data for ${endpoint}:`, data);

      // Минимальное логирование для диагностики
      if (endpoint.includes('/products') && !data?.success) {
        console.warn('⚠️ Products API response:', data);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      // If it's a network error or timeout, retry
      if (error instanceof TypeError && retryCount < maxRetries) {
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Maximum retry attempts reached');
}

export const api = {
  products: {
    getAll: async (params?: { category?: string; search?: string; isBrandNew?: boolean; isOnSale?: boolean; page?: number; limit?: number; sort?: string; sortOrder?: string }): Promise<{ data: Product[]; summary: { total: number; page: number; pages: number } }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const query = queryParams.toString();
      const endpoint = `/products${query ? `?${query}` : ''}`;
      
      console.log('Fetching products from:', endpoint);
      
      const response = await fetchApi(endpoint);
      
      console.log('Products API response:', response);
      
      // Handle response format: { success: true, data: { products: [...], pagination: {...} } }
      if (response && response.success === true && response.data && response.data.products && Array.isArray(response.data.products)) {
        console.log('✅ Using server format: success.data.products');
        console.log('📦 Products count:', response.data.products.length);
        console.log('📦 First product name:', response.data.products[0]?.name || 'none');
        return {
          data: response.data.products,
          summary: {
            total: response.data.pagination?.total || response.data.products.length,
            page: response.data.pagination?.page || 1,
            pages: response.data.pagination?.pages || 1
          }
        };
      }
      // Handle response format with products array and pagination object
      if (response && response.products && Array.isArray(response.products)) {
        console.log('Using direct products format');
        return {
          data: response.products,
          summary: response.pagination || { total: response.products.length, page: 1, pages: 1 }
        };
      }
      // Handle direct array response
      if (Array.isArray(response)) {
        console.log('Using direct array format');
        return {
          data: response,
          summary: { total: response.length, page: 1, pages: 1 }
        };
      }
      // Handle case where response is not in expected format - return the response directly if it's an array
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Using direct data array format');
        return {
          data: response.data,
          summary: { total: response.data.length, page: 1, pages: 1 }
        };
      }
      // Handle case where response is not in expected format
      console.error('Unexpected API response format:', response);
      return {
        data: [],
        summary: { total: 0, page: 1, pages: 1 }
      };
    },
    getById: async (id: string): Promise<Product> => fetchApi(`/products/${id}`),
    getBySlug: async (slug: string): Promise<Product> => fetchApi(`/products/${slug}`),
    getByCategory: async (category: string): Promise<Product[]> => {
      const response = await fetchApi(`/products?category=${category}`);
      console.log('Products by category API response:', response);

      // Handle response format: { success: true, data: { products: [...], pagination: {...} } }
      if (response && response.success === true && response.data && response.data.products && Array.isArray(response.data.products)) {
        console.log('✅ Using server format: success.data.products');
        return response.data.products;
      }
      // Handle case where response is not in expected format
      console.error('❌ Unexpected API response format:', response);
      return [];
    },
    getPopular: async (limit: number = 6): Promise<Product[]> => fetchApi(`/products?isFeatured=true&limit=${limit}`),
    getNew: async (limit: number = 6): Promise<Product[]> => fetchApi(`/products?isBrandNew=true&limit=${limit}`),
    getOnSale: async (limit: number = 6): Promise<Product[]> => fetchApi(`/products?isOnSale=true&limit=${limit}`),
    search: async (query: string): Promise<Product[]> => {
      const response = await fetchApi(`/products?search=${encodeURIComponent(query)}`);
      console.log('Search API response:', response);

      // Handle response format: { success: true, data: { products: [...], pagination: {...} } }
      if (response && response.success === true && response.data && response.data.products && Array.isArray(response.data.products)) {
        console.log('✅ Using server format: success.data.products');
        return response.data.products;
      }
      // Handle case where response is not in expected format
      console.error('❌ Unexpected API response format:', response);
      return [];
    },
  },
  
  cart: {
    get: async (): Promise<{ items: CartItem[]; summary: { totalItems: number; totalQuantity: number; totalPrice: number } }> => fetchApi('/cart'),
    add: async (productId: string, quantity: number = 1, size?: string, color?: string) =>
      fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, size, color })
      }),
    update: async (id: string, quantity: number, size?: string, color?: string) =>
      fetchApi(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity, size, color })
      }),
    remove: async (id: string, size?: string, color?: string) =>
      fetchApi(`/cart/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ size, color })
      }),
    clear: async () => fetchApi('/cart', { method: 'DELETE' }),
  },

  favorites: {
    get: async (): Promise<Product[]> => fetchApi('/favorites'),
    add: async (productId: string) =>
      fetchApi('/favorites', {
        method: 'POST',
        body: JSON.stringify({ productId })
      }),
    remove: async (productId: string) =>
      fetchApi(`/favorites/${productId}`, {
        method: 'DELETE'
      }),
    check: async (productId: string): Promise<{ isFavorite: boolean }> => fetchApi(`/favorites/check/${productId}`),
  },

  auth: {
    register: async (firstName: string, lastName: string, email: string, password: string) =>
      fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password })
      }),
    login: async (email: string, password: string) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    logout: async () =>
      fetchApi('/auth/logout', {
        method: 'POST'
      }),
    getProfile: async () => fetchApi('/auth/profile'),
    updateProfile: async (firstName?: string, lastName?: string, email?: string) =>
      fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ firstName, lastName, email })
      }),
    changePassword: async (currentPassword: string, newPassword: string) =>
      fetchApi('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      }),
    forgotPassword: async (email: string) =>
      fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),
    resetPassword: async (token: string, password: string) =>
      fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      }),
  },

  categories: {
    getAll: async (): Promise<Category[]> => {
      const response = await fetchApi('/categories');
      // Handle the response format from the server
      if (response.success && response.data && response.data.categories) {
        return response.data.categories;
      }
      // Fallback for different response formats
      return Array.isArray(response) ? response : [];
    },
    getBySlug: async (slug: string): Promise<Category> => {
      const response = await fetchApi(`/categories/${slug}`);
      // Handle the response format from the server
      if (response.success && response.data && response.data.category) {
        return response.data.category;
      }
      // Fallback for different response formats
      return response;
    },
  },

  orders: {
    create: async (items: { productId: string; quantity: number; size?: string; color?: string }[], shippingAddress: any) =>
      fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({ items, shippingAddress })
      }),
    getUserOrders: async (): Promise<Order[]> => fetchApi('/orders'),
    getOrderById: async (id: string): Promise<Order> => fetchApi(`/orders/${id}`),
  }
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  level: number;
  filterTemplate?: {
    key: string;
    label: string;
    type: 'SELECT' | 'MULTI_SELECT' | 'RANGE' | 'CHECKBOX' | 'COLOR';
    options?: {
      value: string;
      label: string;
      count?: number;
    }[];
    min?: number;
    max?: number;
    unit?: string;
    isActive: boolean;
  }[];
  attributes?: Record<string, any>;
  children?: Category[];
  productsCount?: number;
};

export type Order = {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: {
    product: Product;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  _id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};