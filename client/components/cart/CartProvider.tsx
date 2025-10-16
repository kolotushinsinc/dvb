'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/product';
import { api, CartItem as APICartItem } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>;
  removeItem: (id: string, size?: string, color?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string, size?: string, color?: string) => boolean;
  getCartItem: (productId: string, size?: string, color?: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.auth.getProfile().catch(() => null);
        setIsLoggedIn(!!response);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Load cart from API on mount or when login status changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        
        if (isLoggedIn) {
          // Load from API if user is logged in
          const cartResponse = await api.cart.get();
          setItems(cartResponse.items.map(convertAPIToLocalCartItem));
        } else {
          // Load from localStorage if user is not logged in
          const localCart = localStorage.getItem('cart');
          if (localCart) {
            const parsedCart = JSON.parse(localCart);
            setItems(parsedCart);
          }
        }
        
        setError(null);
      } catch (err) {
        // If API call fails and user is not logged in, try localStorage
        if (!isLoggedIn) {
          const localCart = localStorage.getItem('cart');
          if (localCart) {
            const parsedCart = JSON.parse(localCart);
            setItems(parsedCart);
            setError(null);
          } else {
            setError('Не удалось загрузить корзину');
            console.error('Error loading cart:', err);
          }
        } else {
          setError('Не удалось загрузить корзину');
          console.error('Error loading cart:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isLoggedIn]);

  // Convert API cart item to local type
  const convertAPIToLocalCartItem = (item: APICartItem): CartItem => ({
    ...item,
    _id: item.product._id // Use product ID as unique identifier
  });

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Refresh cart from API or localStorage
  const refreshCart = async () => {
    try {
      setLoading(true);
      
      if (isLoggedIn) {
        const cartResponse = await api.cart.get();
        setItems(cartResponse.items.map(convertAPIToLocalCartItem));
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const parsedCart = JSON.parse(localCart);
          setItems(parsedCart);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Ошибка синхронизации корзины');
      console.error('Cart sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product, quantity = 1, size?: string, color?: string) => {
    try {
      console.log('addItem called with:', { productId: product._id, quantity, size, color });
      console.log('Current items before adding:', items);
      
      if (isLoggedIn) {
        await api.cart.add(product._id, quantity, size, color);
        await refreshCart();
      } else {
        // Add to localStorage - ensure we have all necessary product data
        const newItem: CartItem = {
          _id: product._id,
          product: {
            ...product,
            // Ensure category is properly set
            category: product.category || (product.categoryId ? {
              _id: product.categoryId._id,
              name: product.categoryId.name,
              slug: product.categoryId.slug,
              isActive: true,
              sortOrder: 1
            } : undefined)
          },
          quantity,
          size,
          color
        };
        
        const existingItemIndex = items.findIndex(item =>
          item._id === product._id &&
          item.size === size &&
          item.color === color
        );
        
        console.log('Existing item index:', existingItemIndex);
        
        let updatedItems;
        if (existingItemIndex >= 0) {
          updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          console.log('Updated existing item quantity:', updatedItems[existingItemIndex].quantity);
        } else {
          updatedItems = [...items, newItem];
          console.log('Added new item to cart');
        }
        
        console.log('Updated items after adding:', updatedItems);
        
        setItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
      }
    } catch (err) {
      setError('Не удалось добавить товар в корзину');
      console.error('Add to cart error:', err);
    }
  };

  const removeItem = async (id: string, size?: string, color?: string) => {
    try {
      if (isLoggedIn) {
        await api.cart.remove(id, size, color);
        await refreshCart();
      } else {
        // Remove from localStorage
        const updatedItems = items.filter(item =>
          !(item._id === id && item.size === size && item.color === color)
        );
        
        setItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
      }
    } catch (err) {
      setError('Не удалось удалить товар из корзины');
      console.error('Remove from cart error:', err);
    }
  };

  const updateQuantity = async (id: string, quantity: number, size?: string, color?: string) => {
    try {
      if (isLoggedIn) {
        await api.cart.update(id, quantity, size, color);
        await refreshCart();
      } else {
        // Update in localStorage
        const updatedItems = items.map(item => {
          if (item._id === id && item.size === size && item.color === color) {
            return { ...item, quantity };
          }
          return item;
        });
        
        setItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
      }
    } catch (err) {
      setError('Не удалось обновить количество товара');
      console.error('Update quantity error:', err);
    }
  };

  const clearCart = async () => {
    try {
      if (isLoggedIn) {
        await api.cart.clear();
        await refreshCart();
      } else {
        // Clear localStorage
        setItems([]);
        localStorage.removeItem('cart');
      }
    } catch (err) {
      setError('Не удалось очистить корзину');
      console.error('Clear cart error:', err);
    }
  };

  const isInCart = (productId: string, size?: string, color?: string) => {
    console.log('isInCart called with:', { productId, size, color });
    console.log('Current cart items:', items);
    const result = items.some(item =>
      item._id === productId &&
      item.size === size &&
      item.color === color
    );
    console.log('isInCart result:', result);
    return result;
  };

  const getCartItem = (productId: string, size?: string, color?: string) => {
    return items.find(item =>
      item._id === productId &&
      item.size === size &&
      item.color === color
    );
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalQuantity,
      totalPrice,
      loading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getCartItem,
    }}>
      {children}
    </CartContext.Provider>
  );
};