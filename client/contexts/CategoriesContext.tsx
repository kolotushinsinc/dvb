'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/types/product';

// Default categories to show immediately on page load
const DEFAULT_CATEGORIES: Category[] = [
  { _id: 'glasses', name: 'Очки', slug: 'glasses', isActive: true, sortOrder: 1, level: 1, categoryType: 'GLASSES' },
  { _id: 'clothing', name: 'Одежда', slug: 'clothing', isActive: true, sortOrder: 2, level: 1, categoryType: 'CLOTHING' },
  { _id: 'shoes', name: 'Обувь', slug: 'shoes', isActive: true, sortOrder: 3, level: 1, categoryType: 'SHOES' },
  { _id: 'accessories', name: 'Аксессуары', slug: 'accessories', isActive: true, sortOrder: 4, level: 1, categoryType: 'ACCESSORIES' }
];

interface CategoriesContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: DEFAULT_CATEGORIES,
  isLoading: false,
  error: null
});

export const useCategories = () => useContext(CategoriesContext);

interface CategoriesProviderProps {
  children: ReactNode;
}

export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load categories from localStorage first
    const loadCachedCategories = () => {
      try {
        const cachedCategories = localStorage.getItem('dvb_categories');
        if (cachedCategories) {
          const parsedCategories = JSON.parse(cachedCategories);
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            setCategories(parsedCategories);
          }
        }
      } catch (err) {
        console.error('Error loading cached categories:', err);
      }
    };

    // Then fetch fresh categories from API
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await api.categories.getAll();
        const activeCategories = response.filter(c => c.isActive);
        
        if (activeCategories.length > 0) {
          setCategories(activeCategories);
          // Cache the categories in localStorage
          localStorage.setItem('dvb_categories', JSON.stringify(activeCategories));
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    // First try to load from cache
    loadCachedCategories();
    
    // Then fetch fresh data
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
};
