import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Filter, Sparkles, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavigationProps {
  currentView: "discover" | "cart" | "favorites";
  onViewChange: (view: "discover" | "cart" | "favorites") => void;
  onFilterToggle: () => void;
  cartItemCount?: number;
  favoritesCount?: number;
}

export const Navigation = ({
  currentView,
  onViewChange,
  onFilterToggle,
  cartItemCount = 0,
  favoritesCount = 0,
}: NavigationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleViewChange = (view: "discover" | "cart" | "favorites") => {
    if (view === currentView) return;

    setIsAnimating(true);
    setTimeout(() => {
      onViewChange(view);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="relative">
      {/* Main Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  SwipeShop
                </h1>
                <p className="text-xs text-gray-500">
                  Discover amazing products
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              {currentView === "discover" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFilterToggle}
                  className="hover:bg-pink-50 text-pink-600"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-pink-100 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewChange("discover")}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 rounded-xl transition-all duration-200 ${
                currentView === "discover"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
              }`}
              disabled={isAnimating}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium">Discover</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewChange("favorites")}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 rounded-xl transition-all duration-200 relative ${
                currentView === "favorites"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
              }`}
              disabled={isAnimating}
            >
              <div className="relative">
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-pink-600 text-white">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">Favorites</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewChange("cart")}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 rounded-xl transition-all duration-200 relative ${
                currentView === "cart"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
              }`}
              disabled={isAnimating}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-purple-600 text-white">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
