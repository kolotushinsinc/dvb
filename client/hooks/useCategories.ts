import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/types/product';

// Кэш для хранения категорий
let categoriesCache: Category[] | null = null;
let isLoading = false;

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(categoriesCache || []);
  const [loading, setLoading] = useState(!categoriesCache);

  useEffect(() => {
    // Если категории уже загружены и закэшированы, не загружаем их снова
    if (categoriesCache) {
      setCategories(categoriesCache);
      setLoading(false);
      return;
    }

    // Если уже идет загрузка, не начинаем новую
    if (isLoading) return;

    const loadCategories = async () => {
      isLoading = true;
      try {
        console.log('Loading categories...');
        
        const response = await api.categories.getAll();
        
        console.log('Categories API response:', response);
        
        // Форматируем ответ для обеспечения согласованной структуры данных
        let formattedCategories: Category[] = [];
        
        // Приводим response к типу any для проверки разных форматов ответа
        const responseAny = response as any;
        
        if (Array.isArray(response)) {
          formattedCategories = response.filter((c: any) => c.isActive);
          console.log('Using direct array format');
        } else if (responseAny && responseAny.data && Array.isArray(responseAny.data)) {
          formattedCategories = responseAny.data.filter((c: any) => c.isActive);
          console.log('Using data format');
        } else if (responseAny && responseAny.categories && Array.isArray(responseAny.categories)) {
          formattedCategories = responseAny.categories.filter((c: any) => c.isActive);
          console.log('Using categories format');
        }
        
        // Добавляем недостающие поля для соответствия типу Category
        formattedCategories = formattedCategories.map(cat => ({
          ...cat,
          level: cat.level || 0,
          parentId: cat.parentId || undefined,
          children: cat.children || []
        }));
        
        console.log('Formatted categories:', formattedCategories);
        
        // Сохраняем в кэш
        categoriesCache = formattedCategories;
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
        isLoading = false;
      }
    };

    loadCategories();
  }, []);

  return { categories, loading };
};