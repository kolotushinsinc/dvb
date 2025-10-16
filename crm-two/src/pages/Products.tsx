import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: '1',
      name: 'Ray-Ban Aviator Classic',
      category: 'Очки',
      price: 15990,
      stock: 45,
      image: '🕶️',
      status: 'active',
    },
    {
      id: '2',
      name: 'Nike Air Max 270',
      category: 'Обувь',
      price: 12500,
      stock: 23,
      image: '👟',
      status: 'active',
    },
    {
      id: '3',
      name: 'Adidas Originals Jacket',
      category: 'Одежда',
      price: 8990,
      stock: 67,
      image: '🧥',
      status: 'active',
    },
    {
      id: '4',
      name: 'Oakley Holbrook',
      category: 'Очки',
      price: 18500,
      stock: 12,
      image: '🕶️',
      status: 'active',
    },
    {
      id: '5',
      name: 'Puma RS-X',
      category: 'Обувь',
      price: 9990,
      stock: 0,
      image: '👟',
      status: 'inactive',
    },
    {
      id: '6',
      name: 'The North Face Fleece',
      category: 'Одежда',
      price: 14500,
      stock: 34,
      image: '🧥',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Товары</h1>
          <p className="text-slate-600 mt-1">Управление ассортиментом магазина</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <Plus className="w-5 h-5" />
          Добавить товар
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" />
            Фильтры
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-4xl">
                    {product.image}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {product.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{product.category}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₽{product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">В наличии</p>
                    <p
                      className={`text-lg font-bold ${
                        product.stock > 20 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'
                      }`}
                    >
                      {product.stock}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                    <Edit className="w-4 h-4" />
                    Изменить
                  </button>
                  <button className="p-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
