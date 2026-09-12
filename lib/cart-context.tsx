'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MenuItem } from './supabase';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  is_veg: boolean;
  restaurant_id: string;
  restaurant_name: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  restaurantId: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('food-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('food-cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: MenuItem, restaurantId: string, restaurantName: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image_url: item.image_url,
          is_veg: item.is_veg,
          restaurant_id: restaurantId,
          restaurant_name: restaurantName,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const restaurantId = items.length > 0 ? items[0].restaurant_id : null;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, restaurantId }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
