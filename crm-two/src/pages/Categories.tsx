import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function Categories() {
  const categories = [
    { id: '1', name: 'Очки', productsCount: 145, icon: '🕶️', color: 'from-blue-500 to-cyan-500' },
    { id: '2', name: 'Обувь', productsCount: 289, icon: '👟', color: 'from-emerald-500 to-teal-500' },
    { id: '3', name: 'Одежда', productsCount: 458, icon: '🧥', color: 'from-purple-500 to-pink-500' },
    { id: '4', name: 'Солнцезащитные очки', productsCount: 98, icon: '😎', color: 'from-amber-500 to-orange-500' },
    { id: '5', name: 'Спортивная обувь', productsCount: 167, icon: '⚽', color: 'from-red-500 to-rose-500' },
    { id: '6', name: 'Куртки', productsCount: 123, icon: '🧥', color: 'from-slate-600 to-slate-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Категории</h1>
          <p className="text-slate-600 mt-1">Управление категориями товаров</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <Plus className="w-5 h-5" />
          Добавить категорию
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
          >
            <div className={`h-2 bg-gradient-to-r ${category.color}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                  {category.icon}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>

              <div className="flex items-center gap-2 text-slate-600">
                <Package className="w-4 h-4" />
                <span className="text-sm">
                  {category.productsCount} {category.productsCount === 1 ? 'товар' : 'товаров'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <button className="w-full py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                  Просмотреть товары
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
            <Package className="w-10 h-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Организуйте свой каталог</h3>
            <p className="text-slate-600">
              Создавайте и управляйте категориями для лучшей организации товаров. Это поможет клиентам быстрее находить нужные продукты.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex-shrink-0">
            Узнать больше
          </button>
        </div>
      </div>
    </div>
  );
}
