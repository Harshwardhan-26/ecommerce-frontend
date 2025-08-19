import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Product } from './productSlice';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Async thunks
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/wishlist');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      await api.post(`/users/wishlist/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/users/wishlist');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

export const checkWishlistStatus = createAsyncThunk(
  'wishlist/checkWishlistStatus',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/wishlist/check/${productId}`);
      return { productId, isInWishlist: response.data.data.isInWishlist };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check wishlist status');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Local wishlist operations for immediate UI feedback
    addItemLocally: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const exists = state.items.find(item => item._id === product._id);
      if (!exists) {
        state.items.push(product);
      }
    },
    removeItemLocally: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
    },
    clearWishlistLocally: (state) => {
      state.items = [];
    },
    // Check if product is in wishlist (for UI state)
    isInWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      return state.items.some(item => item._id === productId);
    },
  },
  extraReducers: (builder) => {
    // Get wishlist
    builder
      .addCase(getWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;
        // The actual product will be added when we refresh the wishlist
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isUpdating = false;
        const productId = action.payload;
        state.items = state.items.filter(item => item._id !== productId);
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Clear wishlist
    builder
      .addCase(clearWishlist.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isUpdating = false;
        state.items = [];
        state.error = null;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Check wishlist status
    builder
      .addCase(checkWishlistStatus.fulfilled, (state, action) => {
        // This is mainly for checking individual product status
        // The result can be used by components to update their UI
      });
  },
});

export const {
  clearError,
  addItemLocally,
  removeItemLocally,
  clearWishlistLocally,
  isInWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;