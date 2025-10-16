'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
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
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Требуется авторизация
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Link href="/auth/login" onClick={onClose}>
            <Button className="w-full" variant="default">
              <LogIn className="w-4 h-4 mr-2" />
              Войти
            </Button>
          </Link>
          <Link href="/auth/register" onClick={onClose}>
            <Button className="w-full" variant="outline">
              <User className="w-4 h-4 mr-2" />
              Зарегистрироваться
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};