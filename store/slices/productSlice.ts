import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  images: Array<{ url: string; alt: string }>;
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  features: string[];
  specifications?: Map<string, string>;
  reviews: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  rating: number;
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  discount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string;
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: string[];
    brands: string[];
  };
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  categories: string[];
  brands: string[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: ProductFilters;
  isLoading: boolean;
  isLoadingProduct: boolean;
  isLoadingFeatured: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  relatedProducts: [],
  categories: [],
  brands: [],
  pagination: null,
  filters: {
    page: 1,
    limit: 12,
    sort: 'newest',
  },
  isLoading: false,
  isLoadingProduct: false,
  isLoadingFeatured: false,
  error: null,
};

// Async thunks
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (filters: ProductFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/products?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get products');
    }
  }
);

export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/featured');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get featured products');
    }
  }
);

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get product');
    }
  }
);

export const addProductReview = createAsyncThunk(
  'products/addProductReview',
  async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, { rating, comment });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/categories/list');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get categories');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sort: 'newest',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
    },
    updateProductInList: (state, action: PayloadAction<Product>) => {
      const updatedProduct = action.payload;
      const index = state.products.findIndex(p => p._id === updatedProduct._id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
      
      // Update featured products if applicable
      const featuredIndex = state.featuredProducts.findIndex(p => p._id === updatedProduct._id);
      if (featuredIndex !== -1) {
        state.featuredProducts[featuredIndex] = updatedProduct;
      }
      
      // Update current product if it's the same
      if (state.currentProduct?._id === updatedProduct._id) {
        state.currentProduct = updatedProduct;
      }
    },
  },
  extraReducers: (builder) => {
    // Get products
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.categories = action.payload.filters.categories;
        state.brands = action.payload.filters.brands;
        state.error = null;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get featured products
    builder
      .addCase(getFeaturedProducts.pending, (state) => {
        state.isLoadingFeatured = true;
        state.error = null;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.isLoadingFeatured = false;
        state.featuredProducts = action.payload;
        state.error = null;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isLoadingFeatured = false;
        state.error = action.payload as string;
      });

    // Get single product
    builder
      .addCase(getProduct.pending, (state) => {
        state.isLoadingProduct = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoadingProduct = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts || [];
        state.error = null;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoadingProduct = false;
        state.error = action.payload as string;
      });

    // Add product review
    builder
      .addCase(addProductReview.pending, (state) => {
        state.error = null;
      })
      .addCase(addProductReview.fulfilled, (state) => {
        state.error = null;
        // Optionally refresh the current product to show new review
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get categories
    builder
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.map((cat: any) => cat._id);
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentProduct,
  updateProductInList,
} = productSlice.actions;

export default productSlice.reducer;