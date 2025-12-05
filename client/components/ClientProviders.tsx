'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnimationProvider } from '@/components/ui/Animation';
import { CartProvider } from '@/components/cart/CartProvider';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AnimationProvider>
          <CategoriesProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </CategoriesProvider>
        </AnimationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
