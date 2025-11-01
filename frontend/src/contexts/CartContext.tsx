import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getCartItems, addToCart, removeFromCart, clearCart, CartItem, CartResponse } from '../utils/cart';

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addItemToCart: (slotId: string) => Promise<boolean>;
  removeItemFromCart: (cartItemId: string) => Promise<boolean>;
  clearAllCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    if (!user || user.role !== 'USER') {
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getCartItems();
      if (response.success && response.data) {
        setCartItems(response.data.items || []);
        setTotalItems(response.data.totalItems || 0);
        setTotalPrice(response.data.totalPrice || 0);
      }
    } catch (err: any) {
      console.error('Error fetching cart items:', err);
      setError(err.response?.data?.message || 'Failed to fetch cart items');
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCartItems();
  };

  const addItemToCart = async (slotId: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await addToCart(slotId);
      if (response.success) {
        await fetchCartItems(); // Refresh cart after adding
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error adding item to cart:', err);
      setError(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const removeItemFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await removeFromCart(cartItemId);
      if (response.success) {
        await fetchCartItems(); // Refresh cart after removing
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error removing item from cart:', err);
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      return false;
    }
  };

  const clearAllCart = async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await clearCart();
      if (response.success) {
        await fetchCartItems(); // Refresh cart after clearing
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Failed to clear cart');
      return false;
    }
  };

  useEffect(() => {
    if (user && user.role === 'USER') {
      fetchCartItems();
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        loading,
        error,
        refreshCart,
        addItemToCart,
        removeItemFromCart,
        clearAllCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

