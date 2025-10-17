'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const useNavigationLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isMounted = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // For Next.js route changes
    if (typeof window !== 'undefined') {
      // Handle initial load - don't show loader on first load
      isFirstLoad.current = false;
      
      // Cleanup
      return () => {
        isMounted.current = false;
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      };
    }
  }, []);

  // Handle route changes
  useEffect(() => {
    // Skip first load and only trigger on actual pathname changes
    if (!isFirstLoad.current && isMounted.current && previousPathname.current !== pathname) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      setIsLoading(true);
      
      // Set a minimum loading time for smooth transition
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }, 300); // Reduced minimum loading time for faster experience

      // Update previous pathname
      previousPathname.current = pathname;

      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      };
    }
  }, [pathname]);

  return isLoading;
};