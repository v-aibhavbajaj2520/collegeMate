import api from './api';

export interface CartItem {
  id: string;
  cartId: string;
  userId: string;
  slotId: string;
  mentorId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  expiresAt: string | null;
  slot: {
    id: string;
    mentor: {
      id: string;
      name: string;
      email: string;
      bio: string | null;
      expertise: string[];
      category: {
        id: string;
        name: string;
      } | null;
    };
  };
}

export interface CartResponse {
  success: boolean;
  data: {
    cartId?: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
  };
  message: string;
}

export interface AddToCartResponse {
  success: boolean;
  data: CartItem;
  message: string;
}

export interface RemoveFromCartResponse {
  success: boolean;
  message: string;
}

export interface ClearCartResponse {
  success: boolean;
  data: {
    deletedCount: number;
  };
  message: string;
}

// Get all cart items
export const getCartItems = async (): Promise<CartResponse> => {
  const response = await api.get<CartResponse>('/api/carts');
  return response.data;
};

// Add item to cart
export const addToCart = async (slotId: string): Promise<AddToCartResponse> => {
  const response = await api.post<AddToCartResponse>('/api/carts', { slotId });
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (cartItemId: string): Promise<RemoveFromCartResponse> => {
  const response = await api.delete<RemoveFromCartResponse>(`/api/carts/${cartItemId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async (): Promise<ClearCartResponse> => {
  const response = await api.delete<ClearCartResponse>('/api/carts/clearCart');
  return response.data;
};

