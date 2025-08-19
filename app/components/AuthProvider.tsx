'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCurrentUser, setToken } from '../../store/slices/authSlice';
import { getCart } from '../../store/slices/cartSlice';
import { getWishlist } from '../../store/slices/wishlistSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check for token in localStorage on mount
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken && !token) {
        // Set token in Redux store
        dispatch(setToken(savedToken));
        
        // Get current user data
        dispatch(getCurrentUser())
          .unwrap()
          .then(() => {
            // Load user-specific data after successful authentication
            dispatch(getCart());
            dispatch(getWishlist());
          })
          .catch(() => {
            // If token is invalid, remove it
            localStorage.removeItem('token');
          });
      } else if (isAuthenticated && token) {
        // If already authenticated, load user data
        dispatch(getCart());
        dispatch(getWishlist());
      }
    }
  }, [dispatch, token, isAuthenticated]);

  return <>{children}</>;
}