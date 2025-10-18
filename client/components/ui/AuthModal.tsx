'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const AuthModal = ({ isOpen, onClose, message = 'Для добавления товара в избранное необходимо войти в систему' }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-charcoal-800 text-xl">
            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-500" />
            </div>
            Требуется авторизация
          </DialogTitle>
          <DialogDescription className="text-charcoal-600 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-6">
          <Link href="/auth/login" onClick={onClose} className="w-full">
            <Button 
              className="w-full py-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Войти в аккаунт
            </Button>
          </Link>
          <Link href="/auth/register" onClick={onClose} className="w-full">
            <Button 
              className="w-full py-6 border-2 border-secondary-200 hover:border-primary-300 hover:text-primary-600 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300" 
              variant="outline"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Зарегистрироваться
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
