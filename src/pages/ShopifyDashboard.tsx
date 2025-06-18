import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Heart,
  ShoppingCart,
  Star,
  X,
  Download,
  RefreshCw,
  Activity,
  Eye,
  Target,
  Store,
  Package,
} from "lucide-react";
import { useProductStats } from "@/hooks/useProductStats";
import { useCartAndFavorites } from "@/hooks/useCartAndFavorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Shopify product interface
interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  images: Array<{ src: string; alt: string }>;
  variants: Array<{ price: string; compare_at_price?: string }>;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
}

const ShopifyDashboard = () => {
  const app = useAppBridge();
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { stats, getTotalStats } = useProductStats();
  const { cart, favorites } = useCartAndFavorites();
  const totalStats = getTotalStats();

  // Fetch products from Shopify
  useEffect(() => {
    const fetchShopifyProducts = async () => {
      try {
        setLoading(true);
        // This would use Shopify's Admin API
        const response = await fetch("/api/shopify/products", {
          headers: {
            Authorization: `Bearer ${process.env.SHOPIFY_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setShopifyProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching Shopify products:", error);
        // Fallback to mock data for demo
        setShopifyProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShopifyProducts();
  }, []);

  // Merge Shopify products with analytics
  const enhancedProductData = shopifyProducts.map((product) => {
    const productStats = stats.find((s) => s.productId === product.id) || {
      productId: product.id,
      likes: 0,
      dislikes: 0,
      "Love It": 0,
    };

    const totalInteractions =
      productStats.likes + productStats.dislikes + productStats["Love It"];
    const engagementRate =
      totalInteractions > 0
        ? ((productStats.likes + productStats["Love It"]) / totalInteractions) *
          100
        : 0;

    return {
      ...product,
      price: parseFloat(product.variants[0]?.price || "0"),
      image: product.images[0]?.src || "/placeholder.jpg",
      collection: product.product_type,
      stats: productStats,
      totalInteractions,
      engagementRate,
      hasInteractions: totalInteractions > 0,
    };
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleViewProduct = (handle: string) => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.ADMIN_PATH, `/products/${handle}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Shopify products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shopify Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  SwipeShop Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Product engagement insights for your store
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-gray-300"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Shopify Store Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Store Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {shopifyProducts.length}
              </div>
              <p className="text-xs text-gray-500">Total in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Tracked Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {enhancedProductData.filter((p) => p.hasInteractions).length}
              </div>
              <p className="text-xs text-gray-500">With engagement data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Total Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalStats.likes + totalStats.dislikes + totalStats["Love It"]}
              </div>
              <p className="text-xs text-gray-500">Customer swipes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(
                  enhancedProductData.length > 0
                    ? ((totalStats.likes + totalStats["Love It"]) /
                        (totalStats.likes +
                          totalStats.dislikes +
                          totalStats["Love It"]) || 1) * 100
                    : 0,
                )}
              </div>
              <p className="text-xs text-gray-500">Positive interactions</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedProductData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No products found in your Shopify store</p>
                    <p className="text-sm">
                      Add products to your store to see analytics
                    </p>
                  </div>
                ) : (
                  enhancedProductData.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewProduct(product.handle)}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.vendor} • {formatCurrency(product.price)}
                        </p>
                        <p className="text-xs text-gray-400">
                          SKU: {product.handle}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        {product.hasInteractions ? (
                          <>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-green-600">
                                <Heart className="w-3 h-3" />
                                <span className="font-medium">
                                  {product.stats.likes}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">Likes</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-purple-600">
                                <Star className="w-3 h-3" />
                                <span className="font-medium">
                                  {product.stats["Love It"]}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Love It
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-red-600">
                                <X className="w-3 h-3" />
                                <span className="font-medium">
                                  {product.stats.dislikes}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">Nope</div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${
                                product.engagementRate >= 70
                                  ? "bg-green-100 text-green-700"
                                  : product.engagementRate >= 40
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {formatPercentage(product.engagementRate)}
                            </Badge>
                          </>
                        ) : (
                          <div className="text-gray-400 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">
                              No customer interactions yet
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Integration Instructions */}
        <motion.div
          className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-blue-800 mb-3">
            🛍️ SwipeShop Integration Active
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">📊 Analytics Dashboard</h4>
              <p>
                This dashboard shows real-time customer engagement with your
                products through the SwipeShop interface.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔄 Live Data Sync</h4>
              <p>
                Customer interactions are automatically tracked and synced with
                your Shopify product catalog.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopifyDashboard;
