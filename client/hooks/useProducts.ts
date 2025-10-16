import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { Product, Category } from '@/types/product';

// Кэш для хранения товаров
let productsCache: Product[] | null = null;
let isLoading = false;

interface UseProductsOptions {
  category?: string;
  search?: string;
  isBrandNew?: boolean;
  isOnSale?: boolean;
  limit?: number;
  sort?: string;
  sortOrder?: string;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>(productsCache || []);
  const [loading, setLoading] = useState(!productsCache);
  const [error, setError] = useState<string | null>(null);

  // Функция для загрузки товаров
  const loadProducts = useCallback(async () => {
    // Если товары уже загружены и закэшированы, используем их
    if (productsCache && !options.category && !options.search) {
      setProducts(productsCache);
      setLoading(false);
      return;
    }

    // Если уже идет загрузка, не начинаем новую
    if (isLoading) {
      return;
    }

    isLoading = true;
    try {
      setLoading(true);
      setError(null);

      const response = await api.products.getAll(options);

      let allProducts: Product[] = [];
      
      // Приводим response к типу any для проверки разных форматов ответа
      const responseAny = response as any;

      console.log('🔍 Processing response format:', {
        hasData: !!responseAny?.data,
        dataIsArray: Array.isArray(responseAny?.data),
        hasSuccess: responseAny?.success,
        hasProducts: !!responseAny?.products,
        productsIsArray: Array.isArray(responseAny?.products),
        isDirectArray: Array.isArray(responseAny)
      });

      // Формат из api.products.getAll: { data: [...], summary: {...} }
      if (responseAny && responseAny.data && Array.isArray(responseAny.data)) {
        allProducts = responseAny.data;
        console.log('✅ Using direct data format, count:', allProducts.length);
      }
      // Формат 1: { success: true, data: { products: [...], pagination: {...} } }
      else if (responseAny &&
          responseAny.success === true &&
          responseAny.data &&
          responseAny.data.products &&
          Array.isArray(responseAny.data.products)) {
        allProducts = responseAny.data.products;
        console.log('✅ Using nested data.products format, count:', allProducts.length);
      }
      // Формат 2: { products: [...], pagination: {...} }
      else if (responseAny &&
               responseAny.products &&
               Array.isArray(responseAny.products)) {
        allProducts = responseAny.products;
        console.log('✅ Using direct products format, count:', allProducts.length);
      }
      // Формат 3: { data: [...] }
      else if (responseAny &&
               responseAny.data &&
               Array.isArray(responseAny.data)) {
        allProducts = responseAny.data;
        console.log('✅ Using direct data array format, count:', allProducts.length);
      }
      // Формат 4: Прямой массив товаров
      else if (Array.isArray(responseAny)) {
        allProducts = responseAny;
        console.log('✅ Using direct array format, count:', allProducts.length);
      }
      
      // Если это полный запрос без фильтров, кэшируем результат
      if (!options.category && !options.search) {
        productsCache = allProducts;
      }

      // Если после обработки товаров нет, выводим предупреждение
      if (allProducts.length === 0) {
        console.warn(`🚨 No products found`);
      }

      setProducts(allProducts);
    } catch (err) {
      setError('Не удалось загрузить товары');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
      isLoading = false;
    }
  }, [options.category, options.search]); // Зависимости только от конкретных опций

  // Загружаем товары при монтировании и при изменении опций
  useEffect(() => {
    console.log('🔧 PRODUCTS HOOK - Component mounted or options changed, calling loadProducts');
    loadProducts();
  }, [loadProducts]); // Используем loadProducts в зависимостях

  // Функция для обновления товаров (например, после добавления в избранное)
  const refreshProducts = useCallback(() => {
    // Сбрасываем кэш и загружаем заново
    if (!options.category && !options.search) {
      productsCache = null;
    }
    loadProducts();
  }, [loadProducts]); // Убираем зависимость от options, чтобы избежать циклов

  return { products, loading, error, refreshProducts };
};

// Хук для фильтрации товаров на клиенте
export const useFilteredProducts = (
  products: Product[],
  categories: Category[],
  filters: {
    priceRange: [number, number];
    selectedCategories: string[];
    selectedFilters: Record<string, string[]>;
    selectedCountries: string[];
  }
) => {
  const filteredProducts = useMemo(() => {
    console.log('🔍 FILTER DEBUG - Starting filter:', {
      totalProducts: products.length,
      selectedCategories: filters.selectedCategories,
      priceRange: filters.priceRange
    });

    return products.filter(product => {
      // Фильтрация по цене
      const priceMatch = product.price >= filters.priceRange[0] &&
                        product.price <= filters.priceRange[1];

      // Фильтрация по категориям
      let categoryMatch = true;
      if (filters.selectedCategories.length > 0) {
        if (product.categoryId && product.categoryId._id) {
          categoryMatch = filters.selectedCategories.includes(product.categoryId._id);
        } else if (product.category && product.category._id) {
          categoryMatch = filters.selectedCategories.includes(product.category._id);
        } else {
          categoryMatch = false;
        }
      }
      
      // Фильтрация по странам
      const countryMatch = filters.selectedCountries.length === 0 ||
                          (product.country && filters.selectedCountries.includes(product.country));

      // Фильтрация по атрибутам товара
      let attributesMatch = true;
      if (Object.keys(filters.selectedFilters).length > 0 && product.attributes) {
        for (const [key, values] of Object.entries(filters.selectedFilters)) {
          if (values.length > 0) {
            // Используем any для обхода проблем с типизацией
            const productValue = (product.attributes as any)[key];
            if (Array.isArray(productValue)) {
              // Для массивов (например, технологии бренда)
              attributesMatch = attributesMatch && values.some(v => productValue.includes(v));
            } else if (typeof productValue === 'string') {
              // Для строковых значений
              attributesMatch = attributesMatch && values.includes(productValue);
            } else if (typeof productValue === 'number') {
              // Для числовых значений (например, размер)
              attributesMatch = attributesMatch && values.includes(productValue.toString());
            }
          }
        }
      }

      return priceMatch && categoryMatch && countryMatch && attributesMatch;
    });
  }, [products, filters]);

  return filteredProducts;
};