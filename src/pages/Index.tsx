import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Sparkles,
  ShoppingCart,
  Heart,
  X,
  Star,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { FilterPanel } from "@/components/FilterPanel";
import { Navigation } from "@/components/Navigation";
import { CartPage } from "@/components/CartPage";
import { FavoritesPage } from "@/components/FavoritesPage";
import { useNavigate } from "react-router-dom";
import { useCartAndFavorites } from "@/hooks/useCartAndFavorites";
import { useProductStats } from "@/hooks/useProductStats";
import { Product, FilterOptions, SwipeDirection } from "@/lib/types";
import { mockProducts } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Expandable Product Description Component
const ProductDescription = ({ product }: { product: Product }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
            {product.title}
          </h4>
          <motion.div
            className="mt-1 overflow-hidden"
            initial={false}
            animate={{ height: isExpanded ? "auto" : "40px" }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-600 text-sm">{product.description}</p>
          </motion.div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 text-xs font-medium mt-1 hover:text-purple-700 transition-colors"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Manual Image Navigation Panel Component
const ImageNavigationPanel = ({
  product,
  currentImageIndex,
  onImageChange,
}: {
  product: Product;
  currentImageIndex: number;
  onImageChange: (index: number) => void;
}) => {
  return (
    <motion.div
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-white/30 min-w-[60px]">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-white text-xs font-bold">
              {product.images.length}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">Photos</p>
        </div>

        {/* Image Thumbnails */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {product.images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => onImageChange(index)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex
                  ? "border-purple-500 shadow-lg scale-105"
                  : "border-gray-200 hover:border-purple-300 hover:scale-102"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image}
                alt={`${product.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Active indicator */}
              {index === currentImageIndex && (
                <motion.div
                  className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </motion.div>
              )}

              {/* Image number */}
              <div className="absolute top-0 right-0 bg-black/70 text-white text-xs rounded-bl-md px-1">
                {index + 1}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="mt-3 space-y-1">
          <motion.button
            onClick={() => onImageChange(Math.max(0, currentImageIndex - 1))}
            disabled={currentImageIndex === 0}
            className="w-full p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>

          <motion.button
            onClick={() =>
              onImageChange(
                Math.min(product.images.length - 1, currentImageIndex + 1),
              )
            }
            disabled={currentImageIndex === product.images.length - 1}
            className="w-full p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.button>
        </div>

        {/* Current position indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {currentImageIndex + 1} of {product.images.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
// Function to shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<
    "discover" | "cart" | "favorites"
  >("discover");
  const [products, setProducts] = useState<Product[]>([]);
  const [shuffledProducts] = useState<Product[]>(() =>
    shuffleArray(mockProducts),
  );
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 500 },
  });
  const [isResetting, setIsResetting] = useState(false);
  const [hasSeenAllProducts, setHasSeenAllProducts] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addInteraction } = useProductStats();
  const {
    addToCart,
    addToFavorites,
    cart,
    favorites,
    getCartItemCount,
    removeFromCart,
    removeFromFavorites,
    updateCartQuantity,
    getCartTotal,
    isInCart,
  } = useCartAndFavorites();
  // Filter products based on current filters (using shuffled products as base)
  useEffect(() => {
    let filteredProducts = [...shuffledProducts];

    // Filter by collection
    if (filters.collection) {
      filteredProducts = filteredProducts.filter(
        (product) => product.collection === filters.collection,
      );
    }

    // Filter by price range
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max,
    );

    // Filter by availability
    if (filters.available !== undefined) {
      filteredProducts = filteredProducts.filter(
        (product) => product.available === filters.available,
      );
    }

    setProducts(filteredProducts);
    setCurrentProductIndex(0);
    setHasSeenAllProducts(false);
  }, [filters, shuffledProducts]);

  const handleSwipe = (direction: SwipeDirection) => {
    if (currentProductIndex >= products.length) return;

    const currentProduct = products[currentProductIndex];
    let action: "like" | "dislike" | "Love It";

    switch (direction) {
      case "right":
        action = "like";
        addToFavorites(currentProduct);
        break;
      case "left":
        action = "dislike";
        break;
      case "up":
        action = "Love It";
        addToCart(currentProduct);
        break;
      default:
        return;
    }

    addInteraction(currentProduct.id, action);
    setCurrentImageIndex(0); // Reset image index for next product
    setCurrentProductIndex((prev) => {
      const newIndex = prev + 1;
      if (newIndex >= products.length) {
        setHasSeenAllProducts(true);
      }
      return newIndex;
    });
  };

  const handleContinueViewing = async () => {
    setIsResetting(true);

    // Shuffle products again for a new experience
    const newShuffledProducts = shuffleArray(
      filters.collection
        ? shuffledProducts.filter(
            (product) => product.collection === filters.collection,
          )
        : shuffledProducts,
    ).filter(
      (product) =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max &&
        (filters.available === undefined ||
          product.available === filters.available),
    );

    setProducts(newShuffledProducts);
    setCurrentProductIndex(0);
    setCurrentImageIndex(0);
    setHasSeenAllProducts(false);

    // Add a small delay for better UX
    setTimeout(() => {
      setIsResetting(false);
    }, 500);
  };

  const remainingProducts = products.slice(currentProductIndex);
  const hasMoreProducts = remainingProducts.length > 0;

  if (currentView === "cart") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <CartPage
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemoveFromCart={removeFromCart}
          onBack={() => setCurrentView("discover")}
          getCartTotal={getCartTotal}
        />
      </div>
    );
  }

  if (currentView === "favorites") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <FavoritesPage
          favorites={favorites}
          onRemoveFromFavorites={removeFromFavorites}
          onAddToCart={(productId) => {
            const product = mockProducts.find((p) => p.id === productId);
            if (product) addToCart(product);
          }}
          onBack={() => setCurrentView("discover")}
          isInCart={isInCart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Temporary Dashboard Access Button */}
      <motion.div
        className="fixed top-20 left-4 z-40"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.button
          onClick={() => navigate("/analytics-dashboard-full")}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📊 Analytics Dashboard
        </motion.button>
        <div className="mt-1 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-center">
          🚧 Temporal
        </div>
      </motion.div>

      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onFilterToggle={() => setIsFilterOpen(true)}
        cartItemCount={getCartItemCount()}
        favoritesCount={favorites.length}
      />

      {/* Cart and Favorites Functional Indicators */}
      {(getCartItemCount() > 0 || favorites.length > 0) && (
        <div className="fixed top-20 right-4 z-40 flex flex-col space-y-3">
          {getCartItemCount() > 0 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setCurrentView("cart")}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-purple-200 hover:bg-purple-50 transition-colors cursor-pointer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              title="View cart"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-600 text-white text-xs">
                  {getCartItemCount()}
                </Badge>
              </div>
            </motion.button>
          )}
          {favorites.length > 0 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setCurrentView("favorites")}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-pink-200 hover:bg-pink-50 transition-colors cursor-pointer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              title="View favorites"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <Badge className="bg-pink-600 text-white text-xs">
                  {favorites.length}
                </Badge>
              </div>
            </motion.button>
          )}
        </div>
      )}

      <div className="pt-6 pb-36 px-4 max-w-[360px] mx-auto">
        {/* Card Stack Container with Image Navigation */}
        <div className="relative h-[500px] w-full max-w-[360px] mx-auto">
          <div className="flex items-center gap-4">
            {/* Main Card Area */}
            <div className="relative h-[500px] w-full">
              <AnimatePresence mode="popLayout">
                {hasMoreProducts ? (
                  remainingProducts
                    .slice(0, 2)
                    .map((product, index) => (
                      <ProductCard
                        key={`${product.id}-${currentProductIndex + index}`}
                        product={product}
                        onSwipe={index === 0 ? handleSwipe : () => {}}
                        isTopCard={index === 0}
                        currentImageIndex={index === 0 ? currentImageIndex : 0}
                        onImageChange={
                          index === 0 ? setCurrentImageIndex : () => {}
                        }
                      />
                    ))
                ) : (
                  <motion.div
                    key="no-more-products"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Card className="max-w-sm mx-auto bg-white/80 backdrop-blur-sm border-pink-200">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
                        >
                          <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {hasSeenAllProducts
                            ? "You've seen everything!"
                            : "No More Products!"}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {hasSeenAllProducts
                            ? "Great job exploring all products! Would you like to continue viewing more products or adjust your filters?"
                            : "No products match your current filters. Try adjusting your filters or continue viewing all products."}
                        </p>

                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={handleContinueViewing}
                            disabled={isResetting}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                          >
                            <Sparkles
                              className={`w-4 h-4 mr-2 ${isResetting ? "animate-spin" : ""}`}
                            />
                            {isResetting
                              ? "Loading..."
                              : "Continue Viewing More Products"}
                          </Button>
                          {(getCartItemCount() > 0 || favorites.length > 0) && (
                            <div className="flex gap-2 pt-2 border-t border-gray-200">
                              {getCartItemCount() > 0 && (
                                <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1">
                                  <ShoppingCart className="w-3 h-3" />
                                  {getCartItemCount()} in cart
                                </Badge>
                              )}
                              {favorites.length > 0 && (
                                <Badge className="bg-pink-100 text-pink-700 flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {favorites.length} favorites
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Product Description and Instructions - Below Cards and Buttons */}
        {hasMoreProducts && remainingProducts.length > 0 && (
          <motion.div
            className="mt-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Current Product Description */}
            <ProductDescription product={remainingProducts[0]} />
          </motion.div>
        )}
        {/* Swipe Instructions (show only on first product) */}
        {currentProductIndex === 0 && hasMoreProducts && (
          <motion.div
            className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 backdrop-blur-sm rounded-2xl border border-pink-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="font-semibold text-gray-900 mb-3 text-center">
              🛍️ How to use SwipeShop
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-gray-700 font-medium">Nope</span>
                <span className="text-gray-500 text-xs">Not interested</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Love It</span>
                <span className="text-gray-500 text-xs">Add to cart</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Like</span>
                <span className="text-gray-500 text-xs">Add to favorites</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/70 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700 text-center font-medium">
                ✨ Swipe cards or use buttons below
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default Index;
