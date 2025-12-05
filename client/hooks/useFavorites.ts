'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setFavorites([]);
        return;
      }

      try {
        setLoading(true);
        const favoritesResponse = await api.favorites.get().catch(() => []);
        setFavorites(favoritesResponse.map(product => product._id));
      } catch (error) {
        console.error('Failed to load favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    console.log('toggleFavorite called, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('User not logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    try {
      console.log('User is logged in, toggling favorite');
      if (isFavorite(productId)) {
        await api.favorites.remove(productId);
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        await api.favorites.add(productId);
        setFavorites(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  return {
    favorites,
    loading,
    isLoggedIn: isAuthenticated,
    showAuthModal,
    setShowAuthModal,
    isFavorite,
    toggleFavorite
  };
};
