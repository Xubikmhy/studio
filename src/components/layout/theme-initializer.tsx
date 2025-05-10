'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {
    const applySystemTheme = () => {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else { // 'system' or null/undefined
      applySystemTheme(); // Apply initial system theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Store the listener function to remove it later
      const mediaQueryListener = () => applySystemTheme();
      mediaQuery.addEventListener('change', mediaQueryListener);

      return () => {
        mediaQuery.removeEventListener('change', mediaQueryListener);
      };
    }
  }, []);

  return null; // This component does not render anything
}
