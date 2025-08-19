import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string; alt: string }>;
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Async thunks
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.put('/cart/update', { productId, quantity });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const getCartCount = createAsyncThunk(
  'cart/getCartCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart/count');
      return response.data.data.count;
    } catch (error: any) {
      return rejectWithValue(0); // Return 0 if failed
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      state.cart = null;
      state.error = null;
      state.isLoading = false;
      state.isUpdating = false;
    },
    // Local cart operations for immediate UI feedback
    addItemLocally: (state, action: PayloadAction<{ product: any; quantity: number }>) => {
      if (!state.cart) {
        state.cart = {
          _id: 'local',
          user: 'local',
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      const { product, quantity } = action.payload;
      const existingItemIndex = state.cart.items.findIndex(
        item => item.product._id === product._id
      );

      if (existingItemIndex >= 0) {
        state.cart.items[existingItemIndex].quantity += quantity;
      } else {
        state.cart.items.push({
          _id: `local-${product._id}`,
          product,
          quantity,
          price: product.price,
        });
      }

      // Recalculate totals
      state.cart.totalItems = state.cart.items.reduce((total, item) => total + item.quantity, 0);
      state.cart.totalPrice = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    updateItemLocally: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      if (!state.cart) return;

      const { productId, quantity } = action.payload;
      const itemIndex = state.cart.items.findIndex(item => item.product._id === productId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.cart.items.splice(itemIndex, 1);
        } else {
          state.cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        state.cart.totalItems = state.cart.items.reduce((total, item) => total + item.quantity, 0);
        state.cart.totalPrice = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    },
    removeItemLocally: (state, action: PayloadAction<string>) => {
      if (!state.cart) return;

      const productId = action.payload;
      state.cart.items = state.cart.items.filter(item => item.product._id !== productId);

      // Recalculate totals
      state.cart.totalItems = state.cart.items.reduce((total, item) => total + item.quantity, 0);
      state.cart.totalPrice = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
  },
  extraReducers: (builder) => {
    // Get cart
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Clear cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Get cart count
    builder
      .addCase(getCartCount.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.totalItems = action.payload;
        }
      });
  },
});

export const {
  clearCartError,
  resetCart,
  addItemLocally,
  updateItemLocally,
  removeItemLocally,
} = cartSlice.actions;

export default cartSlice.reducer;