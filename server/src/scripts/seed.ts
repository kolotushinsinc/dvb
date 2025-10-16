import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

dotenv.config();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      email: 'admin@dvberry.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'DV Berry',
      isAdmin: true,
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create categories
    const categoriesData = [
      {
        name: 'Очки',
        slug: 'glasses',
        description: 'Солнцезащитные очки из Китая',
        image: 'https://images.pexels.com/photos/343717/pexels-photo-343717.jpeg?auto=compress&cs=tinysrgb&w=400',
        sortOrder: 1,
        categoryType: 'GLASSES',
      },
      {
        name: 'Одежда',
        slug: 'clothing',
        description: 'Качественная одежда из Европы и Турции',
        image: 'https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=400',
        sortOrder: 2,
        categoryType: 'CLOTHING',
      },
      {
        name: 'Обувь',
        slug: 'shoes',
        description: 'Стильная обувь из Европы',
        image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
        sortOrder: 3,
        categoryType: 'SHOES',
      },
      {
        name: 'Аксессуары',
        slug: 'accessories',
        description: 'Сумки, ремни и другие аксессуары',
        image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
        sortOrder: 4,
        categoryType: 'ACCESSORIES',
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create products
    const productsData = [
      // Glasses
      {
        name: 'Aviator Classic Gold',
        slug: 'aviator-classic-gold',
        description: 'Классические авиаторы с золотой оправой и поляризационными линзами. Защита UV400, высококачественные материалы.',
        shortDescription: 'Классические авиаторы с золотой оправой',
        price: 3500,
        originalPrice: 4200,
        stock: 50,
        brand: 'Classic Vision',
        country: 'Китай',
        material: 'Металл, поляризационное стекло',
        isBrandNew: false,
        isOnSale: true,
        isFeatured: true,
        categoryId: createdCategories[0]._id,
        categoryType: 'GLASSES',
        attributes: {
          gender: 'UNISEX',
          color: 'золотой',
          season: 'ALL_SEASON',
          frameMaterial: 'Металл',
          frameStyle: 'FULL_RIM',
          lensType: 'Polarized',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Aviator Classic Gold - Main',
            isMain: true,
            sortOrder: 1,
          },
          {
            url: 'https://images.pexels.com/photos/343717/pexels-photo-343717.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Aviator Classic Gold - Side',
            isMain: false,
            sortOrder: 2,
          },
        ],
        variants: [
          { type: 'COLOR', value: 'золотой' },
          { type: 'COLOR', value: 'серебряный' },
          { type: 'COLOR', value: 'черный' },
        ],
      },
      {
        name: 'Round Vintage Style',
        slug: 'round-vintage-style',
        description: 'Круглые очки в винтажном стиле с защитой UV400. Стильные и комфортные для повседневного ношения.',
        shortDescription: 'Круглые очки в винтажном стиле',
        price: 2800,
        stock: 30,
        brand: 'Vintage Collection',
        country: 'Китай',
        material: 'Пластик, акриловые линзы',
        isBrandNew: true,
        isOnSale: false,
        isFeatured: false,
        categoryId: createdCategories[0]._id,
        categoryType: 'GLASSES',
        attributes: {
          gender: 'UNISEX',
          color: 'черный',
          season: 'ALL_SEASON',
          frameMaterial: 'Пластик',
          frameStyle: 'FULL_RIM',
          lensType: 'Standard',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Round Vintage Style - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'коричневый' },
          { type: 'COLOR', value: 'золотой' },
        ],
      },

      // Clothing
      {
        name: 'Куртка-бомбер Premium',
        slug: 'bomber-jacket-premium',
        description: 'Стильная куртка-бомбер из натуральной кожи. Высокое качество пошива, удобная посадка, стильный дизайн.',
        shortDescription: 'Стильная куртка-бомбер из натуральной кожи',
        price: 8500,
        originalPrice: 12000,
        stock: 25,
        brand: 'Turkish Style',
        country: 'Турция',
        material: '100% натуральная кожа',
        isBrandNew: false,
        isOnSale: true,
        isFeatured: true,
        categoryId: createdCategories[1]._id,
        categoryType: 'CLOTHING',
        attributes: {
          gender: 'UNISEX',
          color: 'черный',
          season: 'AUTUMN_WINTER',
          clothingSizeSystem: 'INT',
          clothingSize: 'L',
          fabric: 'Кожа',
          style: 'Повседневный',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Куртка-бомбер Premium - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'SIZE', value: 'S' },
          { type: 'SIZE', value: 'M' },
          { type: 'SIZE', value: 'L' },
          { type: 'SIZE', value: 'XL' },
          { type: 'SIZE', value: 'XXL' },
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'коричневый' },
          { type: 'COLOR', value: 'темно-синий' },
        ],
      },
      {
        name: 'Джинсы Slim Fit',
        slug: 'jeans-slim-fit',
        description: 'Классические джинсы прямого кроя из премиального денима. Удобная посадка, качественная фурнитура.',
        shortDescription: 'Классические джинсы прямого кроя',
        price: 4200,
        stock: 40,
        brand: 'Italian Denim',
        country: 'Италия',
        material: '98% хлопок, 2% эластан',
        isBrandNew: true,
        isOnSale: false,
        isFeatured: false,
        categoryId: createdCategories[1]._id,
        categoryType: 'CLOTHING',
        attributes: {
          gender: 'UNISEX',
          color: 'темно-синий',
          season: 'ALL_SEASON',
          clothingSizeSystem: 'INT',
          clothingSize: '32',
          fabric: 'Хлопок',
          pattern: 'Однотонный',
          style: 'Повседневный',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Джинсы Slim Fit - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'SIZE', value: '28' },
          { type: 'SIZE', value: '30' },
          { type: 'SIZE', value: '32' },
          { type: 'SIZE', value: '34' },
          { type: 'SIZE', value: '36' },
          { type: 'SIZE', value: '38' },
          { type: 'COLOR', value: 'темно-синий' },
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'светло-голубой' },
        ],
      },

      // Shoes
      {
        name: 'Кроссовки Urban Sport',
        slug: 'sneakers-urban-sport',
        description: 'Современные кроссовки для города с технологией амортизации. Дышащие материалы, удобная подошва.',
        shortDescription: 'Современные кроссовки для города',
        price: 6500,
        originalPrice: 8200,
        stock: 35,
        brand: 'German Sport',
        country: 'Германия',
        material: 'Синтетика, текстиль, резина',
        isBrandNew: false,
        isOnSale: true,
        isFeatured: true,
        categoryId: createdCategories[2]._id,
        categoryType: 'SHOES',
        attributes: {
          gender: 'UNISEX',
          color: 'белый',
          season: 'ALL_SEASON',
          shoeSizeSystem: 'EU',
          shoeSize: 42,
          upperMaterial: 'Синтетика',
          soleType: 'Резина',
          brandTechnology: ['Air Max'],
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Кроссовки Urban Sport - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'SIZE', value: '38' },
          { type: 'SIZE', value: '39' },
          { type: 'SIZE', value: '40' },
          { type: 'SIZE', value: '41' },
          { type: 'SIZE', value: '42' },
          { type: 'SIZE', value: '43' },
          { type: 'SIZE', value: '44' },
          { type: 'SIZE', value: '45' },
          { type: 'COLOR', value: 'белый' },
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'серый' },
          { type: 'COLOR', value: 'синий' },
        ],
      },
      {
        name: 'Ботинки Chelsea',
        slug: 'boots-chelsea',
        description: 'Элегантные ботинки челси из натуральной кожи. Классический дизайн, качественная подошва.',
        shortDescription: 'Элегантные ботинки челси из натуральной кожи',
        price: 9200,
        stock: 20,
        brand: 'Spanish Leather',
        country: 'Испания',
        material: '100% натуральная кожа',
        isBrandNew: true,
        isOnSale: false,
        isFeatured: false,
        categoryId: createdCategories[2]._id,
        categoryType: 'SHOES',
        attributes: {
          gender: 'UNISEX',
          color: 'черный',
          season: 'AUTUMN_WINTER',
          shoeSizeSystem: 'EU',
          shoeSize: 42,
          upperMaterial: 'Натуральная кожа',
          soleType: 'Кожа',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Ботинки Chelsea - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'SIZE', value: '39' },
          { type: 'SIZE', value: '40' },
          { type: 'SIZE', value: '41' },
          { type: 'SIZE', value: '42' },
          { type: 'SIZE', value: '43' },
          { type: 'SIZE', value: '44' },
          { type: 'SIZE', value: '45' },
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'коричневый' },
          { type: 'COLOR', value: 'темно-синий' },
        ],
      },

      // Accessories
      {
        name: 'Кожаная сумка Messenger',
        slug: 'leather-bag-messenger',
        description: 'Стильная сумка-мессенджер из натуральной кожи. Много отделений, удобная регулируемая ручка.',
        shortDescription: 'Стильная сумка-мессенджер из натуральной кожи',
        price: 7800,
        stock: 15,
        brand: 'Italian Leather Co.',
        country: 'Италия',
        material: '100% натуральная кожа',
        isBrandNew: true,
        isOnSale: false,
        isFeatured: false,
        categoryId: createdCategories[3]._id,
        categoryType: 'ACCESSORIES',
        attributes: {
          gender: 'UNISEX',
          color: 'коричневый',
          season: 'ALL_SEASON',
          material: 'Кожа',
          style: 'Повседневный',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Кожаная сумка Messenger - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'COLOR', value: 'коричневый' },
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'рыжий' },
        ],
      },
      {
        name: 'Ремень Classic Belt',
        slug: 'belt-classic',
        description: 'Классический кожаный ремень с металлической пряжкой. Качественная кожа, стильный дизайн.',
        shortDescription: 'Классический кожаный ремень',
        price: 2400,
        originalPrice: 3200,
        stock: 45,
        brand: 'French Style',
        country: 'Франция',
        material: 'Натуральная кожа, металл',
        isBrandNew: false,
        isOnSale: true,
        isFeatured: false,
        categoryId: createdCategories[3]._id,
        categoryType: 'ACCESSORIES',
        attributes: {
          gender: 'UNISEX',
          color: 'черный',
          season: 'ALL_SEASON',
          material: 'Кожа',
          style: 'Официальный',
          availability: 'IN_STOCK'
        },
        images: [
          {
            url: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
            alt: 'Ремень Classic Belt - Main',
            isMain: true,
            sortOrder: 1,
          },
        ],
        variants: [
          { type: 'SIZE', value: '85' },
          { type: 'SIZE', value: '90' },
          { type: 'SIZE', value: '95' },
          { type: 'SIZE', value: '100' },
          { type: 'SIZE', value: '105' },
          { type: 'SIZE', value: '110' },
          { type: 'COLOR', value: 'черный' },
          { type: 'COLOR', value: 'коричневый' },
        ],
      },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Admin user: admin@dvberry.com (password: admin123)
- Categories: ${createdCategories.length}
- Products: ${createdProducts.length}
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

main();