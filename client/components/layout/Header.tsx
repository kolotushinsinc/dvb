'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Menu, X, User, Heart, LogOut, Package } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Category, Product } from '@/types/product';
import Image from 'next/image';
import { AuthModal } from '@/components/ui/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { items, totalQuantity } = useCart();
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // This is a simple check - in a real app, you might have a more robust auth check
        const response = await api.auth.getProfile();
        setIsLoggedIn(!!response && response.success);
      } catch (error) {
        // If we get a 404 or any other error, user is not logged in
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Cache categories to avoid repeated API calls
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.categories.getAll();
        setCategories(response.filter(c => c.isActive));
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Use fallback categories if API call fails
        setCategories([
          { _id: 'glasses', name: 'Очки', slug: 'glasses', isActive: true, sortOrder: 1, level: 1, categoryType: 'GLASSES' },
          { _id: 'clothing', name: 'Одежда', slug: 'clothing', isActive: true, sortOrder: 2, level: 1, categoryType: 'CLOTHING' },
          { _id: 'shoes', name: 'Обувь', slug: 'shoes', isActive: true, sortOrder: 3, level: 1, categoryType: 'SHOES' },
          { _id: 'accessories', name: 'Аксессуары', slug: 'accessories', isActive: true, sortOrder: 4, level: 1, categoryType: 'ACCESSORIES' }
        ]);
      }
    };

    loadCategories();
  }, []);

  // Handle instant search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true); // Ensure dropdown is shown when searching
      try {
        const results = await api.products.search(searchQuery.trim());
        setSearchResults(results.slice(0, 5)); // Limit to 5 results
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setIsLoggedIn(false);
      toast.success('Вы успешно вышли из системы');
      router.push('/');
    } catch (error) {
      toast.error('Не удалось выйти из системы');
    }
  };

  const navigation = [
    ...categories.map(category => ({
      name: category.name,
      href: `/catalog/${category.slug}`
    })),
    { name: 'Распродажа', href: '/sale' },
  ];

  return (
    <header className="bg-white border-b border-secondary-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-300 to-primary-300 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-primary-900 font-bold text-base">DB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-charcoal-800 tracking-tight group-hover:text-primary-600 transition-colors">DV BERRY</span>
              <span className="text-xs text-charcoal-500 -mt-1 hidden sm:block">Premium Store</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 ml-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-charcoal-600 hover:text-primary-500 transition-all duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary-300 after:transition-all after:duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <Popover open={showSearchResults || (searchQuery.trim().length >= 2 && (searchResults.length > 0 || isSearching))} onOpenChange={setShowSearchResults}>
              <PopoverTrigger asChild>
                <form onSubmit={handleSearch} className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск товаров..."
                    className="pl-10 bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white placeholder:text-secondary-400 focus:placeholder:text-secondary-500 rounded-full shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setShowSearchResults(true);
                    }}
                  />
                </form>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-sm text-gray-500">Поиск...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug}`}
                          className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                            {product.mainImage ? (
                              <img
                                src={product.mainImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate">{product.price} ₽</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">ничего не найдено</p>
                    </div>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-primary-50 hover:text-primary-600 transition-all">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-primary-50 hover:text-primary-600 transition-all">
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex hover:bg-primary-50 hover:text-primary-600 transition-all"
                  onClick={() => setShowAuthModal(true)}
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex hover:bg-primary-50 hover:text-primary-600 transition-all"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary-50 hover:text-primary-600 transition-all">
                <ShoppingCart className="w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {totalQuantity}
                  </span>
                )}
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Поиск товаров..." className="pl-10 placeholder:text-slate-700 focus:placeholder:text-slate-700/70" />
                  </div>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-600 hover:text-primary transition-colors duration-200 py-2 border-b border-gray-100"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex space-x-4 mt-8">
                    {isLoggedIn ? (
                      <>
                        <Link href="/profile" className="flex-1">
                          <Button variant="ghost" className="w-full">
                            <User className="w-5 h-5 mr-2" />
                            Профиль
                          </Button>
                        </Link>
                        <Link href="/favorites" className="flex-1">
                          <Button variant="ghost" className="w-full">
                            <Heart className="w-5 h-5 mr-2" />
                            Избранное
                          </Button>
                        </Link>
                        <Button variant="ghost" onClick={handleLogout} className="flex-1">
                          <LogOut className="w-5 h-5 mr-2" />
                          Выйти
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setShowAuthModal(true)}
                        >
                          <User className="w-5 h-5 mr-2" />
                          Войти
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setShowAuthModal(true)}
                        >
                          <Heart className="w-5 h-5 mr-2" />
                          Избранное
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;
