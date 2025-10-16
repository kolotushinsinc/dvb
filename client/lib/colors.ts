export const POPULAR_COLORS = [
  { name: 'Черный', value: '#000000' },
  { name: 'Белый', value: '#FFFFFF' },
  { name: 'Красный', value: '#FF0000' },
  { name: 'Синий', value: '#0000FF' },
  { name: 'Зеленый', value: '#008000' },
  { name: 'Желтый', value: '#FFFF00' },
  { name: 'Оранжевый', value: '#FFA500' },
  { name: 'Фиолетовый', value: '#800080' },
  { name: 'Розовый', value: '#FFC0CB' },
  { name: 'Коричневый', value: '#A52A2A' },
  { name: 'Серый', value: '#808080' },
  { name: 'Бежевый', value: '#F5F5DC' },
  { name: 'Бирюзовый', value: '#40E0D0' },
  { name: 'Лавандовый', value: '#E6E6FA' },
  { name: 'Мятный', value: '#98FB98' },
  { name: 'Коралловый', value: '#FF7F50' },
  { name: 'Индиго', value: '#4B0082' },
  { name: 'Золотой', value: '#FFD700' },
  { name: 'Серебряный', value: '#C0C0C0' },
  { name: 'Бордовый', value: '#800000' },
];

// Helper function to get color by name
export const getColorByName = (name: string) => {
  return POPULAR_COLORS.find(color => 
    color.name.toLowerCase() === name.toLowerCase()
  );
};

// Helper function to get color by value
export const getColorByValue = (value: string) => {
  return POPULAR_COLORS.find(color => 
    color.value.toLowerCase() === value.toLowerCase()
  );
};