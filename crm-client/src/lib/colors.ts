// Определение популярных цветов для CRM-клиента
export interface ColorOption {
  name: string;
  value: string;
}

export const POPULAR_COLORS: ColorOption[] = [
  { name: 'Черный', value: '#000000' },
  { name: 'Белый', value: '#FFFFFF' },
  { name: 'Серый', value: '#808080' },
  { name: 'Красный', value: '#FF0000' },
  { name: 'Синий', value: '#0000FF' },
  { name: 'Зеленый', value: '#008000' },
  { name: 'Желтый', value: '#FFFF00' },
  { name: 'Оранжевый', value: '#FFA500' },
  { name: 'Фиолетовый', value: '#800080' },
  { name: 'Розовый', value: '#FFC0CB' },
  { name: 'Коричневый', value: '#A52A2A' },
  { name: 'Бежевый', value: '#F5F5DC' },
  { name: 'Бордовый', value: '#800020' },
  { name: 'Бирюзовый', value: '#40E0D0' },
  { name: 'Мятный', value: '#98FF98' },
  { name: 'Лавандовый', value: '#E6E6FA' },
  { name: 'Голубой', value: '#87CEEB' },
  { name: 'Изумрудный', value: '#50C878' },
  { name: 'Золотой', value: '#FFD700' },
  { name: 'Серебряный', value: '#C0C0C0' },
];

// Функция для получения цвета по названию
export const getColorByName = (name: string): ColorOption | undefined => {
  return POPULAR_COLORS.find(color => 
    color.name.toLowerCase() === name.toLowerCase()
  );
};

// Функция для получения цвета по значению
export const getColorByValue = (value: string): ColorOption | undefined => {
  return POPULAR_COLORS.find(color => 
    color.value.toLowerCase() === value.toLowerCase()
  );
};