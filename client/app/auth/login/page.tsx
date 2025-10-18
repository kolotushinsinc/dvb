'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email некорректен';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await api.auth.login(formData.email, formData.password);
      toast.success('Вы успешно вошли в систему');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Не удалось войти в систему');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <Header />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-300 to-primary-300 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <span className="text-primary-900 font-bold text-xl">DB</span>
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-charcoal-800 mb-3 tracking-tight">
            Вход в <span className="bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">аккаунт</span>
          </h1>
          <p className="text-charcoal-600 max-w-sm mx-auto">
            Введите свои данные для входа в личный кабинет
          </p>
        </div>

        <Card className="border-none shadow-xl premium-shadow rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100 pb-6">
            <CardTitle className="text-charcoal-800 text-2xl font-display">Вход</CardTitle>
            <CardDescription className="text-charcoal-600 mt-2">
              Используйте email и пароль для входа в систему
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-charcoal-700 font-medium">Email</Label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-primary-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : 'border-secondary-200'} bg-secondary-50 focus:border-primary-300 focus:ring-primary-200 focus:bg-white rounded-xl`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-charcoal-700 font-medium">Пароль</Label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : 'border-secondary-200'} bg-secondary-50 focus:border-primary-300 focus:ring-primary-200 focus:bg-white rounded-xl`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-500 hover:text-primary-500 transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-500 focus:ring-primary-300 border-secondary-200 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-charcoal-600">
                    Запомнить меня
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
                    Забыли пароль?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти в аккаунт'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-charcoal-500">или</span>
                </div>
              </div>
              
              <p className="mt-6 text-charcoal-600">
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
