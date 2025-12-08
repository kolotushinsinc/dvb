'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/product';
import { api, CartItem as APICartItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationShown, setValidationShown] = useState(false);

  // Load cart from API on mount or when auth status changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        
        if (isAuthenticated) {
          // Load from API if user is logged in
          try {
            const cartResponse = await api.cart.get();
            setItems(cartResponse.items.map(convertAPIToLocalCartItem));
          } catch (err) {
            console.error('Failed to load cart from API:', err);
            // Fallback to localStorage
            const localCart = localStorage.getItem('cart');
            if (localCart) {
              const parsedCart = JSON.parse(localCart);
              setItems(parsedCart);
            }
          }
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
        setError('Не удалось загрузить корзину');
        console.error('Error loading cart:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Separate effect for price lock checking
  useEffect(() => {
    if (!isAuthenticated || items.length === 0) {
      return;
    }

    // Check for price lock expiration every 10 seconds
    const checkInterval = setInterval(async () => {
      // Check if any items have expired price locks
      const now = new Date();
      const hasExpiredLocks = items.some(item => {
        if (item.priceLockedUntil) {
          const lockDate = new Date(item.priceLockedUntil);
          return lockDate <= now && item.isPriceLocked;
        }
        return false;
      });
      
      if (hasExpiredLocks) {
        console.log('Price locks expired, triggering validation...');
        
        // Refresh cart to get updated prices
        await refreshCart();
        
        // Trigger validation and show modal
        try {
          const validation = await api.cart.validate();
          
          if (!validation.isValid && validation.issues.length > 0) {
            // Dispatch custom event to show validation modal
            window.dispatchEvent(new CustomEvent('cart-validation-required', {
              detail: { issues: validation.issues }
            }));
          }
        } catch (error) {
          console.error('Validation error after price lock expiration:', error);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, items.length]); // Only depend on auth and items count, not items themselves

  // Convert API cart item to local type
  const convertAPIToLocalCartItem = (item: APICartItem): CartItem => ({
    ...item,
    _id: (item as any).id || item._id // Use cart item ID from server
  });

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Refresh cart from API or localStorage
  const refreshCart = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
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
      
      if (isAuthenticated) {
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
              sortOrder: 1,
              level: 1
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
      if (isAuthenticated) {
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
      if (isAuthenticated) {
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
      if (isAuthenticated) {
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
  
  // Calculate total price using reserved prices if locked, otherwise use current price
  const totalPrice = items.reduce((sum, item) => {
    const price = item.isPriceLocked && item.reservedPrice 
      ? item.reservedPrice 
      : item.product.price;
    return sum + (price * item.quantity);
  }, 0);

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
