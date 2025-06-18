import { useState, useCallback, useEffect } from "react";
import { Product } from "@/lib/types";

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface FavoriteItem {
  product: Product;
  addedAt: Date;
}

// Helper functions for localStorage
const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })) as T;
      }
      return parsed;
    }
  } catch (error) {
    console.warn(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Error saving ${key} to localStorage:`, error);
  }
};

export const useCartAndFavorites = () => {
  const [cart, setCart] = useState<CartItem[]>(() =>
    getStoredData<CartItem[]>("swipeshop-cart", []),
  );
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() =>
    getStoredData<FavoriteItem[]>("swipeshop-favorites", []),
  );

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    setStoredData("swipeshop-cart", cart);
  }, [cart]);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    setStoredData("swipeshop-favorites", favorites);
  }, [favorites]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id,
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { product, quantity, addedAt: new Date() }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product.id === productId,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity,
          };
          return updated;
        }
        return prev;
      });
    },
    [removeFromCart],
  );

  const addToFavorites = useCallback((product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) return prev;

      return [...prev, { product, addedAt: new Date() }];
    });
  }, []);

  const removeFromFavorites = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  }, []);

  const isInFavorites = useCallback(
    (productId: string) => {
      return favorites.some((item) => item.product.id === productId);
    },
    [favorites],
  );

  const isInCart = useCallback(
    (productId: string) => {
      return cart.some((item) => item.product.id === productId);
    },
    [cart],
  );

  const getCartTotal = useCallback(() => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    cart,
    favorites,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    isInCart,
    getCartTotal,
    getCartItemCount,
    clearCart,
    clearFavorites,
  };
};
