import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  estimatedDelivery?: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  orderItems: Array<{
    product: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  paymentLoading: boolean;
  paymentError: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  paymentLoading: false,
  paymentError: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get orders');
    }
  }
);

export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get order');
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'orders/createPaymentIntent',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/create-payment-intent`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

export const updateOrderToPaid = createAsyncThunk(
  'orders/updateOrderToPaid',
  async ({ orderId, paymentResult }: { orderId: string; paymentResult: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/pay`, { paymentResult });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const { orderId, status } = action.payload;
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(order => order._id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        if (status === 'delivered') {
          state.orders[orderIndex].isDelivered = true;
          state.orders[orderIndex].deliveredAt = new Date().toISOString();
        }
      }
      
      // Update current order if it matches
      if (state.currentOrder?._id === orderId) {
        state.currentOrder.status = status;
        if (status === 'delivered') {
          state.currentOrder.isDelivered = true;
          state.currentOrder.deliveredAt = new Date().toISOString();
        }
      }
    },
    setPaymentLoading: (state, action: PayloadAction<boolean>) => {
      state.paymentLoading = action.payload;
    },
    setPaymentError: (state, action: PayloadAction<string | null>) => {
      state.paymentError = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload); // Add to beginning of orders list
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Get my orders
    builder
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get single order
    builder
      .addCase(getOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create payment intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state) => {
        state.paymentLoading = false;
        state.paymentError = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload as string;
      });

    // Update order to paid
    builder
      .addCase(updateOrderToPaid.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateOrderToPaid.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentOrder = action.payload;
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateOrderToPaid.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentOrder = action.payload;
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentOrder,
  updateOrderStatus,
  setPaymentLoading,
  setPaymentError,
} = orderSlice.actions;

export default orderSlice.reducer;