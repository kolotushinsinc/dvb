'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { Category, CategoryFilter, FilterOption, Product, GlassesAttributes, ShoesAttributes, ClothingAttributes, AccessoriesAttributes } from '@/types/product';

interface UniversalFiltersProps {
  categories: Category[];
  products: Product[];
  onFilterChange: (filters: {
    priceRange: [number, number];
    selectedCategories: string[];
    selectedFilters: Record<string, string[]>;
    selectedCountries: string[];
  }) => void;
  initialCategory?: string;
}

interface FilterState {
  priceRange: [number, number];
  selectedCategories: string[];
  selectedFilters: Record<string, string[]>;
  selectedCountries: string[];
  sortBy: string;
}

export const UniversalFilters: React.FC<UniversalFiltersProps> = ({
  categories,
  products,
  onFilterChange,
  initialCategory
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    priceRange: [0, 15000],
    selectedCategories: initialCategory ? [initialCategory] : [],
    selectedFilters: {},
    selectedCountries: [],
    sortBy: 'popularity'
  });

  // Update selectedCategories when initialCategory changes
  useEffect(() => {
    if (initialCategory && !filterState.selectedCategories.includes(initialCategory)) {
      setFilterState(prev => ({
        ...prev,
        selectedCategories: [initialCategory]
      }));
    }
  }, [initialCategory]);

  // Получаем активную категорию (если выбрана только одна)
  const activeCategory = filterState.selectedCategories.length === 1
    ? categories.find(c => c._id === filterState.selectedCategories[0])
    : null;

  // Получаем шаблон фильтров для активной категории на основе её типа
  const getCategoryFilters = (categoryType?: string): CategoryFilter[] => {
    switch (categoryType) {
      case 'GLASSES':
        return [
          {
            key: 'gender',
            label: 'Пол',
            type: 'CHECKBOX',
            options: [
              { value: 'MALE', label: 'Мужской' },
              { value: 'FEMALE', label: 'Женский' },
              { value: 'UNISEX', label: 'Унисекс' }
            ],
            isActive: true
          },
          {
            key: 'frameMaterial',
            label: 'Материал оправы',
            type: 'CHECKBOX',
            options: [
              { value: 'Ацетат', label: 'Ацетат' },
              { value: 'Алюминий', label: 'Алюминий' },
              { value: 'Углеродное волокно', label: 'Углеродное волокно' },
              { value: 'Нейлон', label: 'Нейлон' },
              { value: 'Пластмасса', label: 'Пластмасса' },
              { value: 'Смола', label: 'Смола' },
              { value: 'Резина', label: 'Резина' },
              { value: 'Нержавеющая сталь', label: 'Нержавеющая сталь' },
              { value: 'Титан', label: 'Титан' },
              { value: 'Дерево', label: 'Дерево' }
            ],
            isActive: true
          },
          {
            key: 'frameStyle',
            label: 'Стиль обода оправы',
            type: 'CHECKBOX',
            options: [
              { value: 'FULL_RIM', label: 'Полный обод' },
              { value: 'RIMLESS', label: 'Безободковый' },
              { value: 'SEMI_RIMLESS', label: 'Полубезободковый' }
            ],
            isActive: true
          },
          {
            key: 'lensType',
            label: 'Тип объектива',
            type: 'CHECKBOX',
            options: [
              { value: 'Classic', label: 'Classic' },
              { value: 'Flash', label: 'Flash' },
              { value: 'Gradient', label: 'Gradient' },
              { value: 'Mirrored', label: 'Mirrored' },
              { value: 'Polarized', label: 'Polarized' },
              { value: 'Standard', label: 'Standard' }
            ],
            isActive: true
          },
          {
            key: 'availability',
            label: 'Наличие',
            type: 'CHECKBOX',
            options: [
              { value: 'IN_STOCK', label: 'Товар в наличии' },
              { value: 'PRE_ORDER', label: 'Предзаказ' }
            ],
            isActive: true
          }
        ];
      case 'SHOES':
        return [
          {
            key: 'gender',
            label: 'Пол',
            type: 'CHECKBOX',
            options: [
              { value: 'MALE', label: 'Мужская' },
              { value: 'FEMALE', label: 'Женская' },
              { value: 'UNISEX', label: 'Унисекс' }
            ],
            isActive: true
          },
          {
            key: 'shoeSizeSystem',
            label: 'Система размеров',
            type: 'SELECT',
            options: [
              { value: 'RUS', label: 'Российский (RUS)' },
              { value: 'EU', label: 'Европейский (EU)' },
              { value: 'US', label: 'Американский (US)' },
              { value: 'CM', label: 'См (Длина стельки)' }
            ],
            isActive: true
          },
          {
            key: 'upperMaterial',
            label: 'Материал верха',
            type: 'CHECKBOX',
            options: [
              { value: 'Натуральная кожа', label: 'Натуральная кожа' },
              { value: 'Замша', label: 'Замша' },
              { value: 'Нубук', label: 'Нубук' },
              { value: 'Текстиль/Холст', label: 'Текстиль/Холст' },
              { value: 'Сетка (Мэш)', label: 'Сетка (Мэш)' },
              { value: 'Искусственная кожа', label: 'Искусственная кожа' },
              { value: 'Резина', label: 'Резина' },
              { value: 'Комбинированные материалы', label: 'Комбинированные материалы' }
            ],
            isActive: true
          },
          {
            key: 'soleType',
            label: 'Тип подошвы',
            type: 'CHECKBOX',
            options: [
              { value: 'Плоская', label: 'Плоская (для скейтбординга)' },
              { value: 'Амортизирующая', label: 'Амортизирующая (для бега)' },
              { value: 'Резиновая', label: 'Резиновая (для трейла)' },
              { value: 'Каучуковая', label: 'Каучуковая' },
              { value: 'EVA', label: 'EVA (легкая)' }
            ],
            isActive: true
          },
          {
            key: 'brandTechnology',
            label: 'Технологии брендов',
            type: 'CHECKBOX',
            options: [
              { value: 'Air Max', label: 'Nike: Air Max' },
              { value: 'Air Force', label: 'Nike: Air Force' },
              { value: 'Dunk', label: 'Nike: Dunk' },
              { value: 'Jordan', label: 'Nike: Jordan' },
              { value: 'ZoomX', label: 'Nike: ZoomX' },
              { value: 'React', label: 'Nike: React' },
              { value: 'Flyknit', label: 'Nike: Flyknit' },
              { value: 'Boost', label: 'Adidas: Boost' },
              { value: 'Ultraboost', label: 'Adidas: Ultraboost' },
              { value: 'NMD', label: 'Adidas: NMD' },
              { value: 'Yeezy', label: 'Adidas: Yeezy' },
              { value: '4D', label: 'Adidas: 4D' },
              { value: 'Primeknit', label: 'Adidas: Primeknit' },
              { value: 'Fresh Foam', label: 'New Balance: Fresh Foam' },
              { value: 'FuelCell', label: 'New Balance: FuelCell' },
              { value: 'GEL', label: 'Asics: GEL' },
              { value: 'GORE-TEX', label: 'GORE-TEX' },
              { value: 'VIBRAM', label: 'VIBRAM' }
            ],
            isActive: true
          },
          {
            key: 'availability',
            label: 'Наличие',
            type: 'CHECKBOX',
            options: [
              { value: 'IN_STOCK', label: 'Товар в наличии' },
              { value: 'PRE_ORDER', label: 'Предзаказ' }
            ],
            isActive: true
          }
        ];
      case 'CLOTHING':
        return [
          {
            key: 'gender',
            label: 'Пол',
            type: 'CHECKBOX',
            options: [
              { value: 'MALE', label: 'Мужское' },
              { value: 'FEMALE', label: 'Женское' },
              { value: 'UNISEX', label: 'Унисекс' }
            ],
            isActive: true
          },
          {
            key: 'clothingSizeSystem',
            label: 'Система размеров',
            type: 'SELECT',
            options: [
              { value: 'INT', label: 'Международные' },
              { value: 'RUS', label: 'Российские' },
              { value: 'US', label: 'Американские' }
            ],
            isActive: true
          },
          {
            key: 'fabric',
            label: 'Материал',
            type: 'CHECKBOX',
            options: [
              { value: 'Хлопок', label: 'Хлопок' },
              { value: 'Полиэстер', label: 'Полиэстер' },
              { value: 'Нейлон', label: 'Нейлон' },
              { value: 'Шерсть', label: 'Шерсть' },
              { value: 'Кашемир', label: 'Кашемир' },
              { value: 'Деним', label: 'Деним' },
              { value: 'Кожа', label: 'Кожа' },
              { value: 'Замша', label: 'Замша' },
              { value: 'Флис', label: 'Флис' },
              { value: 'Вискоза', label: 'Вискоза' },
              { value: 'Лен', label: 'Лен' }
            ],
            isActive: true
          },
          {
            key: 'style',
            label: 'Стиль',
            type: 'CHECKBOX',
            options: [
              { value: 'Повседневный', label: 'Повседневный (Кэжуал)' },
              { value: 'Спортивный', label: 'Спортивный (Эйджис)' },
              { value: 'Уличный стиль', label: 'Уличный стиль (Стритвир)' },
              { value: 'Официальный', label: 'Официальный (Деловой)' },
              { value: 'Винтаж', label: 'Винтаж' },
              { value: 'Минимализм', label: 'Минимализм' },
              { value: 'Хай-фэшн', label: 'Хай-фэшн (Дизайнерский)' }
            ],
            isActive: true
          },
          {
            key: 'pattern',
            label: 'Рисунок/Принт',
            type: 'CHECKBOX',
            options: [
              { value: 'Однотонный', label: 'Однотонный' },
              { value: 'С логотипом', label: 'С логотипом' },
              { value: 'Графический принт', label: 'Графический принт' },
              { value: 'Полоска', label: 'Полоска' },
              { value: 'Камуфляж', label: 'Камуфляж' },
              { value: 'Цветочный принт', label: 'Цветочный принт' },
              { value: 'Надписи', label: 'Надписи' },
              { value: 'Без принта', label: 'Без принта' }
            ],
            isActive: true
          },
          {
            key: 'availability',
            label: 'Наличие',
            type: 'CHECKBOX',
            options: [
              { value: 'IN_STOCK', label: 'Товар в наличии' },
              { value: 'PRE_ORDER', label: 'Предзаказ' }
            ],
            isActive: true
          }
        ];
      case 'ACCESSORIES':
        return [
          {
            key: 'gender',
            label: 'Пол',
            type: 'CHECKBOX',
            options: [
              { value: 'MALE', label: 'Мужской' },
              { value: 'FEMALE', label: 'Женский' },
              { value: 'UNISEX', label: 'Унисекс' }
            ],
            isActive: true
          },
          {
            key: 'material',
            label: 'Материал',
            type: 'CHECKBOX',
            options: [
              { value: 'Кожа', label: 'Кожа' },
              { value: 'Текстиль', label: 'Текстиль' },
              { value: 'Металл', label: 'Металл' },
              { value: 'Пластик', label: 'Пластик' },
              { value: 'Дерево', label: 'Дерево' }
            ],
            isActive: true
          },
          {
            key: 'style',
            label: 'Стиль',
            type: 'CHECKBOX',
            options: [
              { value: 'Повседневный', label: 'Повседневный' },
              { value: 'Спортивный', label: 'Спортивный' },
              { value: 'Официальный', label: 'Официальный' },
              { value: 'Винтаж', label: 'Винтаж' }
            ],
            isActive: true
          },
          {
            key: 'availability',
            label: 'Наличие',
            type: 'CHECKBOX',
            options: [
              { value: 'IN_STOCK', label: 'Товар в наличии' },
              { value: 'PRE_ORDER', label: 'Предзаказ' }
            ],
            isActive: true
          }
        ];
      default:
        return [];
    }
  };

  const categoryFilterTemplate = getCategoryFilters(activeCategory?.categoryType);

  // Генерируем список стран из товаров
  const countries = Array.from(
    new Set(products.map(p => p.country).filter(Boolean))
  ).map(country => ({
    id: country,
    name: country,
    count: products.filter(p => p.country === country).length
  }));

  // Генерируем список категорий
  const categoryList = categories.map(category => ({
    id: category._id,
    slug: category.slug,
    name: category.name,
    count: products.filter(p => 
      p.categoryId && p.categoryId._id === category._id || 
      p.category && p.category._id === category._id
    ).length
  }));

  // Применяем фильтры при изменении состояния
  useEffect(() => {
    applyFilters();
  }, [filterState, products]);

  const applyFilters = () => {
    let filtered = products.filter(product => {
      // Фильтрация по цене
      const priceMatch = product.price >= filterState.priceRange[0] && 
                        product.price <= filterState.priceRange[1];
      
      // Фильтрация по категориям
      let categoryMatch = true;
      if (filterState.selectedCategories.length > 0) {
        if (product.categoryId && product.categoryId._id) {
          categoryMatch = filterState.selectedCategories.includes(product.categoryId._id);
        } else if (product.category && product.category._id) {
          categoryMatch = filterState.selectedCategories.includes(product.category._id);
        } else {
          categoryMatch = false;
        }
      }
      
      // Фильтрация по странам
      const countryMatch = filterState.selectedCountries.length === 0 || 
                          (product.country && filterState.selectedCountries.includes(product.country));
      
      // Фильтрация по атрибутам товара
      let attributesMatch = true;
      if (Object.keys(filterState.selectedFilters).length > 0 && product.attributes) {
        for (const [key, values] of Object.entries(filterState.selectedFilters)) {
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

    // Применяем сортировку
    switch (filterState.sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'new':
        filtered = filtered.sort((a, b) => (b.isBrandNew ? 1 : 0) - (a.isBrandNew ? 1 : 0));
        break;
      default: // popularity
        filtered = filtered.sort((a, b) =>
          ((b.rating || 0) * (b.reviewsCount || 0)) - ((a.rating || 0) * (a.reviewsCount || 0))
        );
    }

    onFilterChange(filterState);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilterState(prev => ({
      ...prev,
      selectedCategories: checked 
        ? [...prev.selectedCategories, categoryId] 
        : prev.selectedCategories.filter(id => id !== categoryId)
    }));
  };

  const handleCountryChange = (countryId: string, checked: boolean) => {
    setFilterState(prev => ({
      ...prev,
      selectedCountries: checked 
        ? [...prev.selectedCountries, countryId] 
        : prev.selectedCountries.filter(id => id !== countryId)
    }));
  };

  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    setFilterState(prev => {
      const currentValues = prev.selectedFilters[filterKey] || [];
      const newValues = checked 
        ? [...currentValues, value] 
        : currentValues.filter(v => v !== value);
      
      return {
        ...prev,
        selectedFilters: {
          ...prev.selectedFilters,
          [filterKey]: newValues
        }
      };
    });
  };

  const clearFilters = () => {
    setFilterState({
      priceRange: [0, 15000],
      selectedCategories: initialCategory ? [initialCategory] : [],
      selectedFilters: {},
      selectedCountries: [],
      sortBy: 'popularity'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const renderFilter = (filter: CategoryFilter) => {
    const selectedValues = filterState.selectedFilters[filter.key] || [];
    
    switch (filter.type) {
      case 'SELECT':
        return (
          <div key={filter.key} className="space-y-3">
            <h3 className="font-heading text-lg font-semibold mb-5 text-charcoal-800 border-b border-secondary-100 pb-2">{filter.label}</h3>
            <Select 
              value={selectedValues[0] || ''} 
              onValueChange={(value) => handleFilterChange(filter.key, value, !!value)}
            >
              <SelectTrigger className="border-secondary-200 focus:ring-primary-300 focus:border-primary-300 bg-secondary-50">
                <SelectValue placeholder={`Выберите ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="border-secondary-200">
                {filter.options?.map(option => (
                  <SelectItem key={option.value} value={option.value} className="focus:bg-primary-50 focus:text-primary-600">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'MULTI_SELECT':
      case 'CHECKBOX':
        return (
          <div key={filter.key} className="space-y-3">
            <h3 className="font-heading text-lg font-semibold mb-5 text-charcoal-800 border-b border-secondary-100 pb-2">{filter.label}</h3>
            <div className="space-y-4">
              {filter.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${filter.key}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleFilterChange(filter.key, option.value, checked as boolean)
                    }
                    className="text-primary-500 border-secondary-200 focus:ring-primary-300"
                  />
                  <label
                    htmlFor={`${filter.key}-${option.value}`}
                    className="flex-1 text-sm cursor-pointer font-medium text-charcoal-700"
                  >
                    {option.label}
                    {option.count !== undefined && (
                      <span className="text-charcoal-400 ml-1">({option.count})</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'RANGE':
        return (
          <div key={filter.key} className="space-y-4">
            <h3 className="font-heading text-lg font-semibold mb-4">{filter.label}</h3>
            <Slider
              value={[selectedValues[0] ? parseInt(selectedValues[0]) : filter.min || 0]}
              onValueChange={(value) => 
                handleFilterChange(filter.key, value[0].toString(), true)
              }
              max={filter.max || 100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filter.min || 0}{filter.unit}</span>
              <span>{selectedValues[0] || filter.min || 0}{filter.unit}</span>
              <span>{filter.max || 100}{filter.unit}</span>
            </div>
          </div>
        );
        
      case 'COLOR':
        return (
          <div key={filter.key} className="space-y-3">
            <h3 className="font-heading text-lg font-semibold mb-4">{filter.label}</h3>
            <div className="flex flex-wrap gap-2">
              {filter.options?.map(option => (
                <button
                  key={option.value}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedValues.includes(option.value) 
                      ? 'border-primary scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => 
                    handleFilterChange(
                      filter.key, 
                      option.value, 
                      !selectedValues.includes(option.value)
                    )
                  }
                  title={option.label}
                />
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const FilterSection = () => (
    <div className="space-y-10">
      {/* Price Range */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-5 text-charcoal-800 border-b border-secondary-100 pb-2">Цена</h3>
        <div className="space-y-6">
          <Slider
            value={filterState.priceRange}
            onValueChange={(value) => setFilterState(prev => ({ ...prev, priceRange: value as [number, number] }))}
            max={15000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between">
            <span className="text-sm font-medium bg-secondary-50 px-3 py-1 rounded-full text-charcoal-700">{formatPrice(filterState.priceRange[0])}</span>
            <span className="text-sm font-medium bg-secondary-50 px-3 py-1 rounded-full text-charcoal-700">{formatPrice(filterState.priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-5 text-charcoal-800 border-b border-secondary-100 pb-2">Категории</h3>
        <div className="space-y-4">
          {categoryList.map(category => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={category.id}
                checked={filterState.selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                className="text-primary-500 border-secondary-200 focus:ring-primary-300"
              />
              <label
                htmlFor={category.id}
                className="flex-1 text-sm cursor-pointer hover:text-primary-500 transition-colors font-medium text-charcoal-700"
              >
                {category.name}
                <span className="text-charcoal-400 ml-1">({category.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-5 text-charcoal-800 border-b border-secondary-100 pb-2">Страна производитель</h3>
        <div className="space-y-4">
          {countries.map(country => (
            <div key={country.id} className="flex items-center space-x-3">
              <Checkbox
                id={country.id || ''}
                checked={country.id ? filterState.selectedCountries.includes(country.id) : false}
                onCheckedChange={(checked) => country.id && handleCountryChange(country.id, checked as boolean)}
                className="text-primary-500 border-secondary-200 focus:ring-primary-300"
              />
              <label
                htmlFor={country.id || ''}
                className="flex-1 text-sm cursor-pointer font-medium text-charcoal-700"
              >
                {country.name}
                <span className="text-charcoal-400 ml-1">({country.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Category-specific filters */}
      {categoryFilterTemplate.map(renderFilter)}

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full border-2 border-secondary-200 hover:border-primary-300 hover:text-primary-600 font-medium"
      >
        Очистить фильтры
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-full shadow-lg bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600"
          size="lg"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Filters Sidebar */}
      <div className={`${showFilters ? 'fixed inset-0 z-40 bg-white p-6 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0' : 'hidden'} lg:block w-full lg:w-80 lg:flex-shrink-0`}>
        {showFilters && (
          <div className="lg:hidden flex justify-between items-center mb-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal-800">Фильтры</h2>
            <Button
              onClick={() => setShowFilters(false)}
              variant="ghost"
              size="icon"
              className="hover:bg-primary-50 hover:text-primary-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
        <div className="lg:bg-white lg:rounded-2xl lg:p-8 lg:shadow-lg lg:border lg:border-secondary-100 premium-shadow">
          <FilterSection />
        </div>
      </div>
    </>
  );
};
