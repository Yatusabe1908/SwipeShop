import { useState, useCallback, useEffect } from "react";
import { ProductStats, UserInteraction } from "@/lib/types";

// Helper functions for localStorage
const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects for interactions
      if (key.includes("interactions") && Array.isArray(parsed)) {
        return parsed.map((interaction: any) => ({
          ...interaction,
          timestamp: new Date(interaction.timestamp),
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

export const useProductStats = () => {
  const [stats, setStats] = useState<ProductStats[]>(() =>
    getStoredData<ProductStats[]>("swipeshop-stats", []),
  );
  const [interactions, setInteractions] = useState<UserInteraction[]>(() =>
    getStoredData<UserInteraction[]>("swipeshop-interactions", []),
  );

  // Persist stats to localStorage whenever they change
  useEffect(() => {
    setStoredData("swipeshop-stats", stats);
  }, [stats]);

  // Persist interactions to localStorage whenever they change
  useEffect(() => {
    setStoredData("swipeshop-interactions", interactions);
  }, [interactions]);

  const addInteraction = useCallback(
    (productId: string, action: "like" | "dislike" | "Love It") => {
      const interaction: UserInteraction = {
        productId,
        action,
        timestamp: new Date(),
      };

      setInteractions((prev) => [...prev, interaction]);

      setStats((prev) => {
        const existingIndex = prev.findIndex(
          (stat) => stat.productId === productId,
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            [action === "like"
              ? "likes"
              : action === "dislike"
                ? "dislikes"
                : "Love It"]:
              updated[existingIndex][
                action === "like"
                  ? "likes"
                  : action === "dislike"
                    ? "dislikes"
                    : "Love It"
              ] + 1,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              productId,
              likes: action === "like" ? 1 : 0,
              dislikes: action === "dislike" ? 1 : 0,
              "Love It": action === "Love It" ? 1 : 0,
            },
          ];
        }
      });
    },
    [],
  );

  const getProductStats = useCallback(
    (productId: string): ProductStats => {
      const stat = stats.find((s) => s.productId === productId);
      return stat || { productId, likes: 0, dislikes: 0, "Love It": 0 };
    },
    [stats],
  );

  const getTotalStats = useCallback(() => {
    return stats.reduce(
      (acc, stat) => ({
        likes: acc.likes + stat.likes,
        dislikes: acc.dislikes + stat.dislikes,
        "Love It": acc["Love It"] + stat["Love It"],
      }),
      { likes: 0, dislikes: 0, "Love It": 0 },
    );
  }, [stats]);

  const clearStats = useCallback(() => {
    setStats([]);
    setInteractions([]);
  }, []);

  return {
    stats,
    interactions,
    addInteraction,
    getProductStats,
    getTotalStats,
    clearStats,
  };
};
