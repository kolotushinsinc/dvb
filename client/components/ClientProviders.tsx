'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnimationProvider } from '@/components/ui/Animation';
import { CartProvider } from '@/components/cart/CartProvider';
import { Toaster } from '@/components/ui/sonner';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AnimationProvider>
    </ErrorBoundary>
  );
}