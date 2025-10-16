# DV Berry Online Store Project

Проект интернет-магазина DV Berry с полнофункциональным backend API, клиентской частью на Next.js и CRM панелью администратора.

## 📁 Структура проекта

```
dvb/
├── client/           # Next.js клиентская часть (уже создана)
├── server/           # Node.js/Express API backend
├── crm-client/       # React/Vite CRM панель администратора
└── README.md
```

## ✅ Что уже реализовано

### 🖥️ Server (Backend API)
- ✅ Настройка Express.js с TypeScript
- ✅ Схема базы данных Prisma (PostgreSQL)
- ✅ Система аутентификации с JWT
- ✅ Email сервис с Yandex SMTP
- ✅ Полные API routes:
  - Аутентификация (регистрация, логин, восстановление пароля)
  - Управление пользователями
  - Товары с фильтрацией и поиском
  - Категории
  - Корзина
  - Избранное
  - Заказы
  - Отзывы
  - Загрузка файлов
- ✅ Middleware для защиты routes
- ✅ Обработка ошибок
- ✅ Скрипт заполнения данными

### 🎨 CRM Client (Admin Panel)
- ✅ Настройка Vite + React + TypeScript
- ✅ Конфигурация Tailwind CSS
- ✅ Структура маршрутов
- ✅ Базовая архитектура приложения

### 🛍️ Client (Customer Frontend)
- ✅ Уже создан на Next.js
- ✅ Базовая структура компонентов
- ✅ Корзина с localStorage
- ✅ UI компоненты

## 🚫 Текущая проблема

Возникли проблемы с правами доступа npm cache, которые блокируют установку зависимостей.

## 🔧 Решение проблем с npm

Выполните эти команды в терминале для решения проблем с правами:

```bash
# Очистка npm cache с правильными правами
sudo chown -R $(whoami) ~/.npm
npm cache clean --force

# Установка зависимостей сервера
cd server
npm install

# Если проблемы с Prisma engines, попробуйте:
npm install --no-optional
# или
PRISMA_CLI_BINARY_TARGETS=native npm install

# Установка зависимостей CRM
cd ../crm-client
npm install

# Проверка клиентской части
cd ../client
npm install # если нужно
```

## 🚀 Запуск проектов

После решения проблем с npm:

### 1. Настройка базы данных

```bash
cd server

# Создайте PostgreSQL базу данных
# Обновите DATABASE_URL в .env файле

# Генерация Prisma client
npx prisma generate

# Применение миграций
npx prisma db push

# Заполнение тестовыми данными
npm run db:seed
```

### 2. Запуск backend API

```bash
cd server
npm run dev
# Сервер запустится на http://localhost:5000
```

### 3. Запуск CRM панели

```bash
cd crm-client
npm run dev
# CRM запустится на http://localhost:3001
```

### 4. Запуск клиентской части

```bash
cd client
npm run dev
# Клиент запустится на http://localhost:3000
```

## 📋 Следующие шаги

После решения проблем с npm и запуска проектов:

1. **Завершить CRM панель**:
   - Создать компоненты страниц (Dashboard, Products, Categories, etc.)
   - Реализовать формы создания/редактирования
   - Добавить таблицы данных
   - Интегрировать с API

2. **Обновить клиентскую часть**:
   - Интегрировать с реальным API вместо mock данных
   - Добавить аутентификацию пользователей
   - Реализовать страницы товаров
   - Добавить функционал поиска
   - Создать страницы категорий
   - Добавить checkout с тестовой оплатой

3. **Тестирование и доработка**:
   - Тестирование всех функций
   - Добавление анимаций и прелоадеров
   - Обработка ошибок
   - Оптимизация производительности

## 🔑 Данные для входа

После заполнения базы данных:
- **Email**: admin@dvberry.com
- **Пароль**: admin123

## 📧 Email конфигурация

Yandex SMTP уже настроен в .env:
```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=wearedev-studio@yandex.ru
SMTP_PASS=lqcksltkcjgajlqf
```

## 🛠️ Технологии

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **CRM**: Vite, React, TypeScript, Tailwind CSS
- **Auth**: JWT, bcrypt
- **Email**: Nodemailer + Yandex SMTP
- **File Upload**: Multer