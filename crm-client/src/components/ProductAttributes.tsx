import { useState, useEffect, ReactNode } from 'react';
import { Category, Product } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input as InputComponent } from '@/components/ui/input';
import { Checkbox as CheckboxComponent } from '@/components/ui/checkbox';
import { Label as LabelComponent } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ProductAttributesProps {
  category: Category | string | null;
  attributes: any;
  onChange: (attributes: any) => void;
  variants?: { type: 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY'; value: string; price?: string; stock?: string }[];
}

// Опции для различных атрибутов
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Мужской' },
  { value: 'FEMALE', label: 'Женский' },
  { value: 'UNISEX', label: 'Унисекс' }
];

const COLOR_OPTIONS = [
  { value: 'BLACK', label: 'Черный' },
  { value: 'WHITE', label: 'Белый' },
  { value: 'GRAY', label: 'Серый' },
  { value: 'BROWN', label: 'Коричневый' },
  { value: 'BLUE', label: 'Синий' },
  { value: 'GREEN', label: 'Зеленый' },
  { value: 'RED', label: 'Красный' },
  { value: 'PINK', label: 'Розовый' },
  { value: 'PURPLE', label: 'Фиолетовый' },
  { value: 'YELLOW', label: 'Желтый' },
  { value: 'ORANGE', label: 'Оранжевый' },
  { value: 'BEIGE', label: 'Бежевый' },
  { value: 'MULTICOLOR', label: 'Разноцветный' }
];

const SEASON_OPTIONS = [
  { value: 'SPRING_SUMMER', label: 'Весна/Лето' },
  { value: 'AUTUMN_WINTER', label: 'Осень/Зима' },
  { value: 'ALL_SEASON', label: 'Всесезонная' },
  { value: 'COLLECTION_2024', label: 'Коллекция 2024' },
  { value: 'RETRO', label: 'Ретро' }
];

const AVAILABILITY_OPTIONS = [
  { value: 'IN_STOCK', label: 'Товар в наличии' },
  { value: 'PRE_ORDER', label: 'Предзаказ' }
];

const PURCHASE_TYPE_OPTIONS = [
  { value: 'INSTANT', label: 'Мгновенная покупка' },
  { value: 'MANAGER_CONFIRMATION', label: 'После подтверждения менеджером' }
];

const FRAME_MATERIAL_OPTIONS = [
  { value: 'ACETATE', label: 'Ацетат' },
  { value: 'ALUMINUM', label: 'Алюминий' },
  { value: 'CARBON_FIBER', label: 'Углеродное волокно' },
  { value: 'NOT_SPECIFIED', label: 'Не указано' },
  { value: 'NYLON', label: 'Нейлон' },
  { value: 'PLASTIC', label: 'Пластмасса' },
  { value: 'RESIN', label: 'Смола' },
  { value: 'RUBBER', label: 'Резина' },
  { value: 'STAINLESS_STEEL', label: 'Нержавеющая сталь' },
  { value: 'TITANIUM', label: 'Титан' },
  { value: 'WOOD', label: 'Дерево' }
];

const FRAME_STYLE_OPTIONS = [
  { value: 'FULL_RIM', label: 'Полный обод' },
  { value: 'RIMLESS', label: 'Безободковый' },
  { value: 'SEMI_RIMLESS', label: 'Полубезободковый' }
];

const LENS_TYPE_OPTIONS = [
  { value: 'CLASSIC', label: 'Classic' },
  { value: 'FLASH', label: 'Flash' },
  { value: 'GRADIENT', label: 'Gradient' },
  { value: 'MIRRORED', label: 'Mirrored' },
  { value: 'POLARIZED', label: 'Polarized' },
  { value: 'STANDARD', label: 'Standard' }
];

const SHOE_CATEGORY_OPTIONS = [
  { value: 'SNEAKERS', label: 'Кроссовки' },
  { value: 'BOOTS', label: 'Бутсы (для футбола/регби)' },
  { value: 'BASKETBALL', label: 'Баскетбольные кроссовки' },
  { value: 'RUNNING', label: 'Беговые кроссовки' },
  { value: 'LIFESTYLE', label: 'Повседневные кроссовки (Лайфстайл)' },
  { value: 'CANVAS', label: 'Кеды' },
  { value: 'BOOTS_GENERAL', label: 'Ботинки' },
  { value: 'SANDALS', label: 'Сандалии' },
  { value: 'SLIPPERS', label: 'Тапочки' },
  { value: 'SHOES', label: 'Туфли' },
  { value: 'LOAFERS', label: 'Лоферы' },
  { value: 'SKATEBOARDING', label: 'Обувь для скейтбординга' }
];

const SHOE_SIZE_SYSTEM_OPTIONS = [
  { value: 'RUS', label: 'Российский (RUS): 35, 36, 36.5, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48...' },
  { value: 'EU', label: 'Европейский (EU): 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48...' },
  { value: 'US', label: 'Американский (US): 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13.' },
  { value: 'CM', label: 'См (Длина стельки): 22.5, 23, 23.5, 24, 24.5, 25, 25.5, 26, 26.5, 27, 27.5, 28, 28.5, 29, 29.5, 30...' }
];

const UPPER_MATERIAL_OPTIONS = [
  { value: 'NATURAL_LEATHER', label: 'Натуральная кожа' },
  { value: 'SUEDE', label: 'Замша' },
  { value: 'NUBUCK', label: 'Нубук' },
  { value: 'TEXTILE', label: 'Текстиль / Холст' },
  { value: 'MESH', label: 'Сетка (Мэш)' },
  { value: 'ARTIFICIAL_LEATHER', label: 'Искусственная кожа' },
  { value: 'RUBBER', label: 'Резина' },
  { value: 'COMBINED', label: 'Комбинированные материалы' }
];

const SOLE_TYPE_OPTIONS = [
  { value: 'FLAT', label: 'Плоская (для скейтбординга)' },
  { value: 'SHOCK_ABSORBING', label: 'Амортизирующая (для бега)' },
  { value: 'RUBBER', label: 'Резиновая (для трейла)' },
  { value: 'CAUCHOUK', label: 'Каучуковая' },
  { value: 'EVA', label: 'EVA (легкая)' }
];

const BRAND_TECHNOLOGY_OPTIONS = [
  { value: 'NIKE_AIR_MAX', label: 'Nike: Air Max' },
  { value: 'NIKE_AIR_FORCE', label: 'Nike: Air Force' },
  { value: 'NIKE_DUNK', label: 'Nike: Dunk' },
  { value: 'NIKE_JORDAN', label: 'Nike: Jordan' },
  { value: 'NIKE_ZOOMX', label: 'Nike: ZoomX' },
  { value: 'NIKE_REACT', label: 'Nike: React' },
  { value: 'NIKE_FLYKNIT', label: 'Nike: Flyknit' },
  { value: 'ADIDAS_BOOST', label: 'Adidas: Boost' },
  { value: 'ADIDAS_ULTRABOOST', label: 'Adidas: Ultraboost' },
  { value: 'ADIDAS_NMD', label: 'Adidas: NMD' },
  { value: 'ADIDAS_YEEZY', label: 'Adidas: Yeezy' },
  { value: 'ADIDAS_4D', label: 'Adidas: 4D' },
  { value: 'ADIDAS_PRIMEKNIT', label: 'Adidas: Primeknit' },
  { value: 'NEW_BALANCE_FRESH_FOAM', label: 'New Balance: Fresh Foam' },
  { value: 'NEW_BALANCE_FUELCELL', label: 'New Balance: FuelCell' },
  { value: 'ASICS_GEL', label: 'Asics: GEL' },
  { value: 'GORE_TEX', label: 'Подошва GORE-TEX (водоотталкивающая)' },
  { value: 'VIBRAM', label: 'Подошва VIBRAM' }
];

const SHOE_FEATURES_OPTIONS = [
  { value: 'HIGH_TOP', label: 'Высокие (Хай-топ)' },
  { value: 'LOW_TOP', label: 'Низкие (Лоу-топ)' },
  { value: 'LACES', label: 'На шнурках' },
  { value: 'VELCRO', label: 'На липучках' },
  { value: 'ZIPPER', label: 'На молнии' },
  { value: 'REMOVABLE_INSOLES', label: 'Съемные стельки' },
  { value: 'ORTHOPEDIC_INSOLES', label: 'Ортопедическая стелька' },
  { value: 'SHOCK_ABSORBING', label: 'Амортизирующая подошва' },
  { value: 'INSULATED', label: 'Утепленные (на зиму)' },
  { value: 'BREATHABLE', label: 'Дышащие (на лето)' },
  { value: 'WATER_REPELLENT', label: 'Водоотталкивающие' }
];

const CLOTHING_CATEGORY_OPTIONS = [
  { value: 'OUTERWEAR', label: 'Верхняя одежда' },
  { value: 'JACKETS', label: 'Куртки' },
  { value: 'HOODIES', label: 'Толстовки и свитшоты' },
  { value: 'TSHIRTS', label: 'Футболки и поло' },
  { value: 'SHIRTS', label: 'Рубашки' },
  { value: 'PANTS', label: 'Брюки и шорты' },
  { value: 'SPORTS_PANTS', label: 'Спортивные штаны' },
  { value: 'JEANS', label: 'Джинсы' },
  { value: 'SPORTSWEAR', label: 'Одежда для бега и тренировок' },
  { value: 'UNDERWEAR', label: 'Нижнее белье и носки' }
];

const CLOTHING_SIZE_SYSTEM_OPTIONS = [
  { value: 'INTERNATIONAL', label: 'Международные: XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL' },
  { value: 'RUSSIAN', label: 'Российские: 44, 46, 48, 50, 52, 54, 56, 58...' },
  { value: 'JEANS', label: 'Размеры джинсов (W/L): 28x30, 30x30, 32x32 и т.д.' }
];

const CLOTHING_SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL',
  '44', '46', '48', '50', '52', '54', '56', '58',
  '28x30', '30x30', '32x32'
];

const FABRIC_OPTIONS = [
  { value: 'COTTON', label: 'Хлопок' },
  { value: 'POLYESTER', label: 'Полиэстер' },
  { value: 'NYLON', label: 'Нейлон' },
  { value: 'WOOL', label: 'Шерсть' },
  { value: 'CASHMERE', label: 'Кашемир' },
  { value: 'DENIM', label: 'Деним' },
  { value: 'LEATHER', label: 'Кожа' },
  { value: 'SUEDE', label: 'Замша' },
  { value: 'FLEECE', label: 'Флис' },
  { value: 'VISCOSE', label: 'Вискоза' },
  { value: 'LINEN', label: 'Лен' }
];

const PATTERN_OPTIONS = [
  { value: 'SOLID', label: 'Однотонный' },
  { value: 'LOGO', label: 'С логотипом' },
  { value: 'GRAPHIC', label: 'Графический принт' },
  { value: 'STRIPED', label: 'Полоска' },
  { value: 'CAMOUFLAGE', label: 'Камуфляж' },
  { value: 'FLORAL', label: 'Цветочный принт' },
  { value: 'TEXT', label: 'Надписи' },
  { value: 'NONE', label: 'Без принта' }
];

const CLOTHING_TECHNOLOGIES_OPTIONS = [
  { value: 'DRI_FIT', label: 'Dri-FIT (Nike)' },
  { value: 'TECH_FLEECE', label: 'Tech Fleece (Nike)' },
  { value: 'GORE_TEX', label: 'GORE-TEX' },
  { value: 'PRIMEGREEN', label: 'Primegreen (Adidas)' },
  { value: 'HEATTECH', label: 'HEATTECH (Uniqlo)' },
  { value: 'WATER_REPELLENT', label: 'Водоотталкивающее покрытие' },
  { value: 'WINDPROOF', label: 'Ветрозащитное' }
];

const CLOTHING_FEATURES_OPTIONS = [
  { value: 'HOOD', label: 'С капюшоном' },
  { value: 'POCKETS', label: 'С карманами' },
  { value: 'CROPPED', label: 'Укороченная модель' },
  { value: 'OVERSIZE', label: 'Оверсайз' },
  { value: 'SLIM_FIT', label: 'Приталенный крой' },
  { value: 'HIGH_WAIST', label: 'Высокая талия' },
  { value: 'ZIPPER', label: 'На молнии' },
  { value: 'BUTTONS', label: 'На пуговицах' }
];

const STYLE_OPTIONS = [
  { value: 'SPORTY', label: 'Спортивный (Эйджис)' },
  { value: 'CASUAL', label: 'Повседневный (Кэжуал)' },
  { value: 'STREET', label: 'Уличный стиль (Стритвир)' },
  { value: 'VINTAGE', label: 'Винтаж' },
  { value: 'MINIMALISM', label: 'Минимализм' },
  { value: 'HIGH_FASHION', label: 'Хай-фэшн (Дизайнерский)' },
  { value: 'BOHO', label: 'Бохо / Этнический' },
  { value: 'OFFICIAL', label: 'Официальный (Деловой)' }
];

export const ProductAttributes = ({ category, attributes, onChange, variants = [] }: ProductAttributesProps) => {
  const [categoryType, setCategoryType] = useState<string>('');
  const [localAttributes, setLocalAttributes] = useState<any>(attributes || {});
  const [newSize, setNewSize] = useState<string>('');

  // Проверяем, есть ли цветовые варианты
  const hasColorVariants = variants.some(variant => variant.type === 'COLOR');
  const mainColorAttribute = localAttributes.color;

  useEffect(() => {
    // Определяем тип категории
    if (category && typeof category === 'object') {
      setCategoryType(category.categoryType || '');
    } else if (category) {
      // Если у нас только ID категории, нужно получить её тип
      // В реальном приложении здесь можно сделать запрос к API
      // Для примера попробуем определить тип по ID
      const categoryId = category.toString();
      if (categoryId.includes('glasses') || categoryId.includes('очк')) {
        setCategoryType('GLASSES');
      } else if (categoryId.includes('shoe') || categoryId.includes('обув')) {
        setCategoryType('SHOES');
      } else if (categoryId.includes('cloth') || categoryId.includes('одежд')) {
        setCategoryType('CLOTHING');
      } else if (categoryId.includes('access') || categoryId.includes('аксессуар')) {
        setCategoryType('ACCESSORIES');
      } else {
        setCategoryType('');
      }
    } else {
      setCategoryType('');
    }
  }, [category]);

  useEffect(() => {
    setLocalAttributes(attributes || {});
  }, [attributes]);

  const handleAttributeChange = (key: string, value: any) => {
    const updatedAttributes = { ...localAttributes, [key]: value };
    setLocalAttributes(updatedAttributes);
    onChange(updatedAttributes);
  };

  const handleCheckboxChange = (key: string, option: string, checked: boolean) => {
    const currentValues = localAttributes[key] || [];
    let updatedValues;
    
    if (checked) {
      updatedValues = [...currentValues, option];
    } else {
      updatedValues = currentValues.filter((v: string) => v !== option);
    }
    
    handleAttributeChange(key, updatedValues);
  };

  // Обработчик добавления размера
  const handleAddSize = () => {
    if (newSize.trim()) {
      const currentSizes = localAttributes.sizes || [];
      handleAttributeChange('sizes', [...currentSizes, newSize.trim()]);
      setNewSize('');
    }
  };

  // Обработчик удаления размера
  const handleRemoveSize = (size: string) => {
    const currentSizes = localAttributes.sizes || [];
    handleAttributeChange('sizes', currentSizes.filter((s: string) => s !== size));
  };

  // Компонент для выбора множественных значений
  const MultiSelect = ({
    label,
    options,
    value,
    onChange
  }: {
    label: string;
    options: { value: string; label: string }[];
    value: string[];
    onChange: (values: string[]) => void
  }): ReactNode => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map(option => (
          <div key={option.value} className="flex items-center">
            <CheckboxComponent
              id={`option-${option.value}`}
              checked={value?.includes(option.value) || false}
              onCheckedChange={(checked) => {
                const currentValues = value || [];
                let updatedValues;
                
                if (checked) {
                  updatedValues = [...currentValues, option.value];
                } else {
                  updatedValues = currentValues.filter((v: string) => v !== option.value);
                }
                
                onChange(updatedValues);
              }}
            />
            <LabelComponent htmlFor={`option-${option.value}`} className="ml-2 text-sm">
              {option.label}
            </LabelComponent>
          </div>
        ))}
      </div>
    </div>
  );

  // Компонент для выбора множественных значений (строковых)
  const MultiSelectString = ({
    label,
    options,
    value,
    onChange
  }: {
    label: string;
    options: string[];
    value: string[];
    onChange: (values: string[]) => void
  }): ReactNode => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map(option => (
          <div key={option} className="flex items-center">
            <CheckboxComponent
              id={`option-${option}`}
              checked={value?.includes(option) || false}
              onCheckedChange={(checked) => {
                const currentValues = value || [];
                let updatedValues;
                
                if (checked) {
                  updatedValues = [...currentValues, option];
                } else {
                  updatedValues = currentValues.filter((v: string) => v !== option);
                }
                
                onChange(updatedValues);
              }}
            />
            <LabelComponent htmlFor={`option-${option}`} className="ml-2 text-sm">
              {option}
            </LabelComponent>
          </div>
        ))}
      </div>
    </div>
  );

  // Общие атрибуты для всех категорий
  const renderCommonAttributes = (): ReactNode => (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-slate-900">Общие атрибуты</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Пол</label>
        <Select
          value={localAttributes.gender || ''}
          onValueChange={(value: string) => handleAttributeChange('gender', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите пол" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Цвет {hasColorVariants && <span className="text-amber-600">(управляется вариантами)</span>}
        </label>
        <Select
          value={localAttributes.color || ''}
          onValueChange={(value: string) => handleAttributeChange('color', value)}
          disabled={hasColorVariants}
        >
          <SelectTrigger className={hasColorVariants ? 'opacity-50 cursor-not-allowed' : ''}>
            <SelectValue placeholder={hasColorVariants ? "Цвет указан в вариантах" : "Выберите цвет"} />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasColorVariants && (
          <p className="text-xs text-amber-600 mt-1">
            Цвет управляется цветовыми вариантами товара выше
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Сезон</label>
        <Select
          value={localAttributes.season || ''}
          onValueChange={(value: string) => handleAttributeChange('season', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите сезон" />
          </SelectTrigger>
          <SelectContent>
            {SEASON_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Год коллекции</label>
        <InputComponent
          type="number"
          value={localAttributes.collectionYear || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAttributeChange('collectionYear', parseInt(e.target.value) || undefined)}
          placeholder="Год коллекции"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Наличие</label>
        <Select
          value={localAttributes.availability || ''}
          onValueChange={(value: string) => handleAttributeChange('availability', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите наличие" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABILITY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Способ покупки</label>
        <Select
          value={localAttributes.purchaseType || ''}
          onValueChange={(value: string) => handleAttributeChange('purchaseType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите способ покупки" />
          </SelectTrigger>
          <SelectContent>
            {PURCHASE_TYPE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Атрибуты для очков
  const renderGlassesAttributes = (): ReactNode => (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-slate-900">Атрибуты очков</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Материал оправы</label>
        <Select
          value={localAttributes.frameMaterial || ''}
          onValueChange={(value: string) => handleAttributeChange('frameMaterial', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите материал оправы" />
          </SelectTrigger>
          <SelectContent>
            {FRAME_MATERIAL_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Стиль обода оправы</label>
        <Select
          value={localAttributes.frameStyle || ''}
          onValueChange={(value: string) => handleAttributeChange('frameStyle', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите стиль обода" />
          </SelectTrigger>
          <SelectContent>
            {FRAME_STYLE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Тип объектива</label>
        <Select
          value={localAttributes.lensType || ''}
          onValueChange={(value: string) => handleAttributeChange('lensType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип объектива" />
          </SelectTrigger>
          <SelectContent>
            {LENS_TYPE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Атрибуты для обуви
  const renderShoesAttributes = (): ReactNode => (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-slate-900">Атрибуты обуви</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Категория обуви</label>
        <Select
          value={localAttributes.shoeCategory || ''}
          onValueChange={(value: string) => handleAttributeChange('shoeCategory', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию обуви" />
          </SelectTrigger>
          <SelectContent>
            {SHOE_CATEGORY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Система размеров</label>
        <Select
          value={localAttributes.sizeSystem || ''}
          onValueChange={(value: string) => handleAttributeChange('sizeSystem', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите систему размеров" />
          </SelectTrigger>
          <SelectContent>
            {SHOE_SIZE_SYSTEM_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Материал верха</label>
        <Select
          value={localAttributes.upperMaterial || ''}
          onValueChange={(value: string) => handleAttributeChange('upperMaterial', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите материал верха" />
          </SelectTrigger>
          <SelectContent>
            {UPPER_MATERIAL_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Тип подошвы</label>
        <Select
          value={localAttributes.soleType || ''}
          onValueChange={(value: string) => handleAttributeChange('soleType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип подошвы" />
          </SelectTrigger>
          <SelectContent>
            {SOLE_TYPE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MultiSelect
        label="Технологии брендов"
        options={BRAND_TECHNOLOGY_OPTIONS}
        value={localAttributes.brandTechnology || []}
        onChange={(values) => handleAttributeChange('brandTechnology', values)}
      />

      <MultiSelect
        label="Особенности модели"
        options={SHOE_FEATURES_OPTIONS}
        value={localAttributes.features || []}
        onChange={(values) => handleAttributeChange('features', values)}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Стиль</label>
        <Select
          value={localAttributes.style || ''}
          onValueChange={(value: string) => handleAttributeChange('style', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите стиль" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Доступные размеры</label>
        <div className="space-y-2 mt-2">
          <div className="flex space-x-2">
            <InputComponent
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Добавить размер"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddSize} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(localAttributes.sizes || []).map((size: string, index: number) => (
              <div key={index} className="flex items-center bg-slate-100 rounded-md px-2 py-1">
                <span className="text-sm">{size}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSize(size)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Атрибуты для одежды
  const renderClothingAttributes = (): ReactNode => (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-slate-900">Атрибуты одежды</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Категория одежды</label>
        <Select
          value={localAttributes.clothingCategory || ''}
          onValueChange={(value: string) => handleAttributeChange('clothingCategory', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию одежды" />
          </SelectTrigger>
          <SelectContent>
            {CLOTHING_CATEGORY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Система размеров</label>
        <Select
          value={localAttributes.sizeSystem || ''}
          onValueChange={(value: string) => handleAttributeChange('sizeSystem', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите систему размеров" />
          </SelectTrigger>
          <SelectContent>
            {CLOTHING_SIZE_SYSTEM_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Ткань</label>
        <Select
          value={localAttributes.fabric || ''}
          onValueChange={(value: string) => handleAttributeChange('fabric', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите ткань" />
          </SelectTrigger>
          <SelectContent>
            {FABRIC_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Узор/Принт</label>
        <Select
          value={localAttributes.pattern || ''}
          onValueChange={(value: string) => handleAttributeChange('pattern', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите узор" />
          </SelectTrigger>
          <SelectContent>
            {PATTERN_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Стиль</label>
        <Select
          value={localAttributes.style || ''}
          onValueChange={(value: string) => handleAttributeChange('style', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите стиль" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MultiSelect
        label="Технологии"
        options={CLOTHING_TECHNOLOGIES_OPTIONS}
        value={localAttributes.technologies || []}
        onChange={(values) => handleAttributeChange('technologies', values)}
      />

      <MultiSelect
        label="Особенности модели"
        options={CLOTHING_FEATURES_OPTIONS}
        value={localAttributes.features || []}
        onChange={(values) => handleAttributeChange('features', values)}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Доступные размеры</label>
        <div className="space-y-2 mt-2">
          <div className="flex space-x-2">
            <InputComponent
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Добавить размер"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddSize} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(localAttributes.sizes || []).map((size: string, index: number) => (
              <div key={index} className="flex items-center bg-slate-100 rounded-md px-2 py-1">
                <span className="text-sm">{size}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSize(size)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Атрибуты для аксессуаров
  const renderAccessoriesAttributes = (): ReactNode => (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-slate-900">Атрибуты аксессуаров</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Материал</label>
        <InputComponent
          type="text"
          value={localAttributes.material || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAttributeChange('material', e.target.value)}
          placeholder="Введите материал"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Стиль</label>
        <Select
          value={localAttributes.style || ''}
          onValueChange={(value: string) => handleAttributeChange('style', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите стиль" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      {!categoryType ? (
        <div className="text-center py-8 text-slate-500">
          Выберите категорию, чтобы увидеть специфические атрибуты товара
        </div>
      ) : (
        <>
          {renderCommonAttributes()}
          
          {categoryType === 'GLASSES' && renderGlassesAttributes()}
          {categoryType === 'SHOES' && renderShoesAttributes()}
          {categoryType === 'CLOTHING' && renderClothingAttributes()}
          {categoryType === 'ACCESSORIES' && renderAccessoriesAttributes()}
        </>
      )}
    </div>
  );
};