'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { initializeTheme, setSystemTheme } from '../../store/slices/themeSlice';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { theme, effectiveTheme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Initialize theme on mount
    dispatch(initializeTheme());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemTheme(e.matches ? 'dark' : 'light'));
    };

    mediaQuery.addEventListener('change', handleChange);

    // Set CSS variables for toast styling
    const updateToastVariables = () => {
      const root = document.documentElement;
      if (effectiveTheme === 'dark') {
        root.style.setProperty('--toast-bg', '#374151');
        root.style.setProperty('--toast-color', '#f9fafb');
        root.style.setProperty('--toast-border', '#4b5563');
      } else {
        root.style.setProperty('--toast-bg', '#ffffff');
        root.style.setProperty('--toast-color', '#111827');
        root.style.setProperty('--toast-border', '#e5e7eb');
      }
    };

    updateToastVariables();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch, effectiveTheme]);

  return <>{children}</>;
}