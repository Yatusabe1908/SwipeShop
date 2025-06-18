import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Package,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteItem } from "@/hooks/useCartAndFavorites";
import { collections } from "@/lib/mockData";
import { useState } from "react";

interface FavoritesPageProps {
  favorites: FavoriteItem[];
  onRemoveFromFavorites: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onBack: () => void;
  isInCart: (productId: string) => boolean;
}

export const FavoritesPage = ({
  favorites,
  onRemoveFromFavorites,
  onAddToCart,
  onBack,
  isInCart,
}: FavoritesPageProps) => {
  const [selectedCollection, setSelectedCollection] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">(
    "recent",
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  // Filter and sort favorites
  const filteredAndSortedFavorites = favorites
    .filter(
      (item) =>
        selectedCollection === "All" ||
        item.product.collection === selectedCollection,
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "price-low":
          return a.product.price - b.product.price;
        case "price-high":
          return b.product.price - a.product.price;
        default:
          return 0;
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="p-6 pb-24 max-w-md mx-auto min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-full p-2 hover:bg-pink-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            My Favorites
          </h1>
          <p className="text-gray-600">
            {favorites.length} product{favorites.length !== 1 ? "s" : ""} you
            like
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      {favorites.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Collection Filter */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Collection
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((collection) => (
                      <Badge
                        key={collection}
                        variant={
                          selectedCollection === collection
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer transition-all ${
                          selectedCollection === collection
                            ? "bg-pink-600 text-white"
                            : "hover:bg-pink-50 hover:border-pink-300"
                        }`}
                        onClick={() => setSelectedCollection(collection)}
                      >
                        {collection}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </p>
                  <div className="flex gap-2">
                    {[
                      { value: "recent", label: "Most recent" },
                      { value: "price-low", label: "Price ↑" },
                      { value: "price-high", label: "Price ↓" },
                    ].map((option) => (
                      <Badge
                        key={option.value}
                        variant={
                          sortBy === option.value ? "default" : "outline"
                        }
                        className={`cursor-pointer text-xs ${
                          sortBy === option.value
                            ? "bg-purple-600 text-white"
                            : "hover:bg-purple-50 hover:border-purple-300"
                        }`}
                        onClick={() => setSortBy(option.value as any)}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Favorites List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredAndSortedFavorites.length > 0 ? (
          filteredAndSortedFavorites.map((item) => (
            <motion.div key={item.product.id} variants={itemVariants} layout>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 relative">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-pink-600 text-white text-xs">
                          <Heart className="w-2 h-2 mr-1" />
                          Like
                        </Badge>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 mr-3">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {item.product.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-1">
                            {item.product.vendor} • {item.product.collection}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-bold text-pink-600">
                              {formatPrice(item.product.price)}
                            </p>
                            {item.product.compareAtPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                {formatPrice(item.product.compareAtPrice)}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Agregado {formatDate(item.addedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(item.product.id)}
                          disabled={isInCart(item.product.id)}
                          className={`flex-1 text-xs ${
                            isInCart(item.product.id)
                              ? "bg-gray-100 text-gray-400"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {isInCart(item.product.id)
                            ? "En carrito"
                            : "Al carrito"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveFromFavorites(item.product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : favorites.length > 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-8 text-center">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay favoritos con estos filtros
                </h3>
                <p className="text-gray-600">
                  Intenta cambiar la colección o el orden para ver más
                  productos.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Favorites
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't liked any products yet. Swipe right on products
                  you like!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-pink-600">
                  <Heart className="w-4 h-4" />
                  <span>Like = Add to favorites</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
