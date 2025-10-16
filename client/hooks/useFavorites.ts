'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadFavorites = async () => {
      try {
        // Check if user is authenticated
        const response = await api.auth.getProfile().catch(() => null);
        setIsLoggedIn(!!response);
        
        if (response) {
          // Only load favorites if user is authenticated
          setLoading(true);
          const favoritesResponse = await api.favorites.get();
          setFavorites(favoritesResponse.map(product => product._id));
        }
      } catch (error) {
        console.error('Failed to check auth or load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadFavorites();
  }, []);

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    console.log('toggleFavorite called, isLoggedIn:', isLoggedIn);
    
    if (!isLoggedIn) {
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
    isLoggedIn,
    showAuthModal,
    setShowAuthModal,
    isFavorite,
    toggleFavorite
  };
};