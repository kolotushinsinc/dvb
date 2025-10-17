import OrderConfirmationClient from './OrderConfirmationClient';

interface PageProps {
  params: {
    id: string;
  };
}

// Функция для генерации статических параметров для динамических маршрутов
// В реальном приложении здесь можно получить список всех ID заказов из API
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как ID заказов динамические
  // При использовании output: export это позволит избежать ошибок
  return [];
}

export default function OrderConfirmationPage({ params }: PageProps) {
  return <OrderConfirmationClient orderId={params.id} />;
}