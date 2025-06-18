import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShoppingCart, Heart, X, Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { FilterPanel } from "@/components/FilterPanel";
import { useCartAndFavorites } from "@/hooks/useCartAndFavorites";
import { useProductStats } from "@/hooks/useProductStats";
import { Product, FilterOptions, SwipeDirection } from "@/lib/types";
import {
  fetchShopifyProducts,
  isShopifyEnvironment,
  trackShopifyEvent,
  getShopifyConfig,
  addToShopifyCart,
} from "@/lib/shopify";
import { mockProducts } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Function to shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Widget = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 500 },
  });
  const [isResetting, setIsResetting] = useState(false);
  const [hasSeenAllProducts, setHasSeenAllProducts] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [shopifyConfig, setShopifyConfig] = useState<any>({});

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

  // Load Shopify configuration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const config = getShopifyConfig();
      setShopifyConfig(config);
    }
  }, []);

  // Load products from Shopify on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        if (isShopifyEnvironment() || shopifyConfig.shop) {
          const { products: shopifyProducts } = await fetchShopifyProducts(50);
          const shuffled = shuffleArray(shopifyProducts);
          setShuffledProducts(shuffled);
        } else {
          // Fallback to mock data for development
          const shuffled = shuffleArray(mockProducts);
          setShuffledProducts(shuffled);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to mock data
        const shuffled = shuffleArray(mockProducts);
        setShuffledProducts(shuffled);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [shopifyConfig]);

  // Filter products based on current filters
  useEffect(() => {
    let filteredProducts = [...shuffledProducts];

    if (filters.collection) {
      filteredProducts = filteredProducts.filter(
        (product) => product.collection === filters.collection,
      );
    }

    filteredProducts = filteredProducts.filter(
      (product) =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max,
    );

    if (filters.available !== undefined) {
      filteredProducts = filteredProducts.filter(
        (product) => product.available === filters.available,
      );
    }

    setProducts(filteredProducts);
    setCurrentProductIndex(0);
    setHasSeenAllProducts(false);
  }, [filters, shuffledProducts]);

  const handleSwipe = async (direction: SwipeDirection) => {
    if (currentProductIndex >= products.length) return;

    const currentProduct = products[currentProductIndex];
    let action: "like" | "dislike" | "Love It";

    switch (direction) {
      case "right":
        action = "like";
        addToFavorites(currentProduct);

        // Notify parent window (Shopify)
        if (window.parent !== window) {
          window.parent.postMessage(
            {
              type: "SWIPESHOP_ADD_TO_FAVORITES",
              productId: currentProduct.id,
              product: currentProduct,
            },
            "*",
          );
        }
        break;

      case "left":
        action = "dislike";
        break;

      case "up":
        action = "Love It";
        addToCart(currentProduct);

        // Try to add to Shopify cart if in Shopify environment
        try {
          if (isShopifyEnvironment() && currentProduct.variants.length > 0) {
            await addToShopifyCart(currentProduct.variants[0].id);

            // Notify parent window (Shopify)
            if (window.parent !== window) {
              window.parent.postMessage(
                {
                  type: "SWIPESHOP_ADD_TO_CART",
                  productId: currentProduct.id,
                  variantId: currentProduct.variants[0].id,
                  product: currentProduct,
                },
                "*",
              );
            }
          }
        } catch (error) {
          console.error("Error adding to Shopify cart:", error);
        }
        break;

      default:
        return;
    }

    addInteraction(currentProduct.id, action);

    // Track analytics event
    trackShopifyEvent("swipe_action", currentProduct.id, {
      action,
      price: currentProduct.price,
      vendor: currentProduct.vendor,
      collection: currentProduct.collection,
    });

    setCurrentImageIndex(0);
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

    setTimeout(() => {
      setIsResetting(false);
    }, 500);
  };

  const remainingProducts = products.slice(currentProductIndex);
  const hasMoreProducts = remainingProducts.length > 0;

  // Show loading state while products are being fetched
  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Loading Products...
          </h3>
          <p className="text-gray-600">Fetching amazing products for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Widget Header */}
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

            {shopifyConfig.shop && (
              <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                🏪 {shopifyConfig.shop}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart and Favorites Indicators */}
      {(getCartItemCount() > 0 || favorites.length > 0) && (
        <div className="fixed top-20 right-4 z-40 flex flex-col space-y-3">
          {getCartItemCount() > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-purple-200"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-600 text-white text-xs">
                  {getCartItemCount()}
                </Badge>
              </div>
            </motion.div>
          )}
          {favorites.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-pink-200"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <Badge className="bg-pink-600 text-white text-xs">
                  {favorites.length}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="pt-6 pb-20 px-4 max-w-[360px] mx-auto">
        {/* Card Stack Container */}
        <div className="relative h-[500px] w-full max-w-[360px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative h-[500px] w-full">
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
                          ? "Great job exploring all products! Continue shopping in your store."
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

                        {isShopifyEnvironment() && (
                          <Button
                            onClick={() => {
                              if (window.parent !== window) {
                                window.parent.postMessage(
                                  {
                                    type: "SWIPESHOP_CONTINUE_SHOPPING",
                                  },
                                  "*",
                                );
                              }
                            }}
                            variant="outline"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            Continue Shopping in Store
                          </Button>
                        )}

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
            </div>
          </div>
        </div>

        {/* Swipe Instructions */}
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

export default Widget;
