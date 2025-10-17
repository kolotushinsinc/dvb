'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnimationProvider } from '@/components/ui/Animation';
import { CartProvider } from '@/components/cart/CartProvider';
import { Toaster } from '@/components/ui/sonner';
import SmoothTransition from '@/components/ui/SmoothTransition';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <CartProvider>
          <SmoothTransition>
            {children}
          </SmoothTransition>
          <Toaster />
        </CartProvider>
      </AnimationProvider>
    </ErrorBoundary>
  );
}