export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  collection: string;
  tags: string[];
  vendor: string;
  available: boolean;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  available: boolean;
  inventory: number;
}

export interface ProductStats {
  productId: string;
  likes: number;
  dislikes: number;
  "Love It": number;
}

export interface UserInteraction {
  productId: string;
  action: "like" | "dislike" | "Love It";
  timestamp: Date;
}

export interface FilterOptions {
  collection?: string;
  priceRange: {
    min: number;
    max: number;
  };
  available?: boolean;
}

export type SwipeDirection = "left" | "right" | "up";
