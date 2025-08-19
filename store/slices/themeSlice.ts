import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
}

const initialState: ThemeState = {
  theme: 'system',
  systemTheme: 'light',
  effectiveTheme: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      
      // Update effective theme
      if (action.payload === 'system') {
        state.effectiveTheme = state.systemTheme;
      } else {
        state.effectiveTheme = action.payload;
      }
      
      // Apply theme to document
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(state.effectiveTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', action.payload);
      }
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload;
      
      // Update effective theme if using system theme
      if (state.theme === 'system') {
        state.effectiveTheme = action.payload;
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(action.payload);
        }
      }
    },
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark';
        state.effectiveTheme = 'dark';
      } else if (state.theme === 'dark') {
        state.theme = 'light';
        state.effectiveTheme = 'light';
      } else {
        // If system, toggle to opposite of current system theme
        const newTheme = state.systemTheme === 'light' ? 'dark' : 'light';
        state.theme = newTheme;
        state.effectiveTheme = newTheme;
      }
      
      // Apply theme to document
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(state.effectiveTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', state.theme);
      }
    },
    initializeTheme: (state) => {
      if (typeof window !== 'undefined') {
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        
        // Detect system theme
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        state.systemTheme = systemTheme;
        
        // Set theme
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          state.theme = savedTheme;
        } else {
          state.theme = 'system';
        }
        
        // Set effective theme
        if (state.theme === 'system') {
          state.effectiveTheme = systemTheme;
        } else {
          state.effectiveTheme = state.theme;
        }
        
        // Apply theme to document
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(state.effectiveTheme);
      }
    },
  },
});

export const { setTheme, setSystemTheme, toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;