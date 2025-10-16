import { Store, User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';

export default function Settings() {
  const settingsSections = [
    {
      title: 'Профиль',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      fields: [
        { label: 'Имя', value: 'Администратор', type: 'text' },
        { label: 'Email', value: 'admin@opticstyle.com', type: 'email' },
        { label: 'Телефон', value: '+7 (999) 123-45-67', type: 'tel' },
      ],
    },
    {
      title: 'Магазин',
      icon: Store,
      color: 'from-emerald-500 to-emerald-600',
      fields: [
        { label: 'Название магазина', value: 'OpticStyle', type: 'text' },
        { label: 'Адрес', value: 'Москва, ул. Примерная, д. 1', type: 'text' },
        { label: 'Контактный телефон', value: '+7 (495) 123-45-67', type: 'tel' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Настройки</h1>
        <p className="text-slate-600 mt-1">Управление параметрами системы</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 sticky top-6">
            {[
              { id: 'profile', label: 'Профиль', icon: User },
              { id: 'store', label: 'Магазин', icon: Store },
              { id: 'notifications', label: 'Уведомления', icon: Bell },
              { id: 'security', label: 'Безопасность', icon: Shield },
              { id: 'appearance', label: 'Внешний вид', icon: Palette },
              { id: 'language', label: 'Язык и регион', icon: Globe },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <div className="p-6 space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  ))}
                  <div className="pt-4">
                    <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
                      <Save className="w-5 h-5" />
                      Сохранить изменения
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Уведомления</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Email уведомления о новых заказах', checked: true },
                { label: 'Push уведомления в браузере', checked: true },
                { label: 'Уведомления о низком остатке товаров', checked: false },
                { label: 'Еженедельный отчет о продажах', checked: true },
              ].map((notification) => (
                <label key={notification.label} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked={notification.checked}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                    {notification.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Безопасность</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Текущий пароль</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Новый пароль</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Подтвердите новый пароль</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="pt-4">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 transform hover:scale-[1.02]">
                  <Shield className="w-5 h-5" />
                  Обновить пароль
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
