import mongoose from 'mongoose';
import { Category } from '../models/Category';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Функция для инициализации базовых категорий
export const initializeCategories = async () => {
  try {
    // Проверяем, есть ли уже категории
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('Categories already exist, skipping initialization');
      return;
    }

    // Создаем корневые категории
    const glassesCategory = new Category({
      name: 'Очки',
      slug: 'glasses',
      description: 'Солнцезащитные и диоптрические очки',
      level: 0,
      sortOrder: 1,
      categoryType: 'GLASSES'
    });

    const shoesCategory = new Category({
      name: 'Обувь',
      slug: 'shoes',
      description: 'Обувь для любого случая',
      level: 0,
      sortOrder: 2,
      categoryType: 'SHOES'
    });

    const clothingCategory = new Category({
      name: 'Одежда',
      slug: 'clothing',
      description: 'Одежда для мужчин и женщин',
      level: 0,
      sortOrder: 3,
      categoryType: 'CLOTHING'
    });

    const accessoriesCategory = new Category({
      name: 'Аксессуары',
      slug: 'accessories',
      description: 'Сумки, ремни и другие аксессуары',
      level: 0,
      sortOrder: 4,
      categoryType: 'ACCESSORIES'
    });

    // Сохраняем корневые категории
    await Promise.all([
      glassesCategory.save(),
      shoesCategory.save(),
      clothingCategory.save(),
      accessoriesCategory.save()
    ]);

    // Создаем подкатегории для обуви
    const shoesSubcategories = [
      { name: 'Кроссовки', slug: 'sneakers', sortOrder: 1 },
      { name: 'Бутсы', slug: 'boots', sortOrder: 2 },
      { name: 'Баскетбольные кроссовки', slug: 'basketball', sortOrder: 3 },
      { name: 'Беговые кроссовки', slug: 'running', sortOrder: 4 },
      { name: 'Повседневные кроссовки', slug: 'lifestyle', sortOrder: 5 },
      { name: 'Кеды', slug: 'canvas', sortOrder: 6 },
      { name: 'Ботинки', slug: 'boots-fashion', sortOrder: 7 },
      { name: 'Сандалии', slug: 'sandals', sortOrder: 8 },
      { name: 'Тапочки', slug: 'slippers', sortOrder: 9 },
      { name: 'Туфли', slug: 'formal-shoes', sortOrder: 10 },
      { name: 'Лоферы', slug: 'loafers', sortOrder: 11 },
      { name: 'Обувь для скейтбординга', slug: 'skateboarding', sortOrder: 12 }
    ];

    const shoesSubcategoryDocs = shoesSubcategories.map(sub => ({
      name: sub.name,
      slug: sub.slug,
      description: `${sub.name} - подкатегория обуви`,
      parentId: shoesCategory._id,
      level: 1,
      sortOrder: sub.sortOrder,
      categoryType: 'SHOES'
    }));

    await Category.insertMany(shoesSubcategoryDocs);

    // Создаем подкатегории для одежды
    const clothingSubcategories = [
      { name: 'Верхняя одежда', slug: 'outerwear', sortOrder: 1 },
      { name: 'Куртки', slug: 'jackets', sortOrder: 2 },
      { name: 'Толстовки и свитшоты', slug: 'hoodies', sortOrder: 3 },
      { name: 'Футболки и поло', slug: 'tshirts', sortOrder: 4 },
      { name: 'Рубашки', slug: 'shirts', sortOrder: 5 },
      { name: 'Брюки и шорты', slug: 'pants', sortOrder: 6 },
      { name: 'Спортивные штаны', slug: 'sport-pants', sortOrder: 7 },
      { name: 'Джинсы', slug: 'jeans', sortOrder: 8 },
      { name: 'Одежда для бега и тренировок', slug: 'sportswear', sortOrder: 9 },
      { name: 'Нижнее белье и носки', slug: 'underwear', sortOrder: 10 }
    ];

    const clothingSubcategoryDocs = clothingSubcategories.map(sub => ({
      name: sub.name,
      slug: sub.slug,
      description: `${sub.name} - подкатегория одежды`,
      parentId: clothingCategory._id,
      level: 1,
      sortOrder: sub.sortOrder,
      categoryType: 'CLOTHING'
    }));

    await Category.insertMany(clothingSubcategoryDocs);

    // Создаем подкатегории для аксессуаров
    const accessoriesSubcategories = [
      { name: 'Сумки', slug: 'bags', sortOrder: 1 },
      { name: 'Ремни', slug: 'belts', sortOrder: 2 },
      { name: 'Головные уборы', slug: 'hats', sortOrder: 3 },
      { name: 'Часы', slug: 'watches', sortOrder: 4 },
      { name: 'Ювелирные изделия', slug: 'jewelry', sortOrder: 5 }
    ];

    const accessoriesSubcategoryDocs = accessoriesSubcategories.map(sub => ({
      name: sub.name,
      slug: sub.slug,
      description: `${sub.name} - подкатегория аксессуаров`,
      parentId: accessoriesCategory._id,
      level: 1,
      sortOrder: sub.sortOrder,
      categoryType: 'ACCESSORIES'
    }));

    await Category.insertMany(accessoriesSubcategoryDocs);

    console.log('Categories initialized successfully');
  } catch (error) {
    console.error('Error initializing categories:', error);
    throw error;
  }
};

// Функция для запуска инициализации
export const runInitialization = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await initializeCategories();
    
    console.log('Initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
};

// Если скрипт запускается напрямую
if (require.main === module) {
  runInitialization();
}