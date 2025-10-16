import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const createAdmin = async () => {
  try {
    // Подключаемся к MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Подключено к MongoDB');

    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Администратор с таким email уже существует');
      return;
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456789', salt);

    // Создаем администратора
    const admin = new User({
      email: 'admin@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isActive: true
    });

    await admin.save();
    console.log('Администратор успешно создан:');
    console.log(`Email: admin@gmail.com`);
    console.log(`Пароль: 123456789`);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  }
};

// Запускаем функцию
createAdmin();