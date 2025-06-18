import { useState, useMemo } from "react";
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
  ArrowUp,
  Activity,
  Globe,
  Eye,
  Target,
  Filter,
  Search,
  Grid,
  List,
  Plus,
  Award,
  Zap,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductStats } from "@/hooks/useProductStats";
import { useCartAndFavorites } from "@/hooks/useCartAndFavorites";
import { mockProducts } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("overview");

  const { stats, getTotalStats } = useProductStats();
  const { cart, favorites } = useCartAndFavorites();
  const totalStats = getTotalStats();

  // Enhanced analytics for ALL products
  const enhancedProductData = useMemo(() => {
    return mockProducts.map((product) => {
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
          ? ((productStats.likes + productStats["Love It"]) /
              totalInteractions) *
            100
          : 0;

      const hasInteractions = totalInteractions > 0;
      const isInFavorites = favorites.some((f) => f.product.id === product.id);
      const isInCart = cart.some((c) => c.product.id === product.id);

      return {
        ...product,
        stats: productStats,
        totalInteractions,
        engagementRate,
        hasInteractions,
        isInFavorites,
        isInCart,
        status: hasInteractions ? "active" : "inactive",
      };
    });
  }, [stats, favorites, cart]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return enhancedProductData.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.collection.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [enhancedProductData, searchTerm]);

  // Global metrics
  const globalMetrics = useMemo(() => {
    const totalInteractions =
      totalStats.likes + totalStats.dislikes + totalStats["Love It"];
    const totalProducts = mockProducts.length;
    const activeProducts = enhancedProductData.filter(
      (p) => p.hasInteractions,
    ).length;
    const conversionRate =
      totalInteractions > 0
        ? ((totalStats["Love It"] + totalStats.likes) / totalInteractions) * 100
        : 0;
    const totalCatalogValue = mockProducts.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = totalCatalogValue / totalProducts;

    return {
      totalInteractions,
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      conversionRate,
      totalCatalogValue,
      averagePrice,
      engagementRate:
        activeProducts > 0 ? totalInteractions / activeProducts : 0,
    };
  }, [enhancedProductData, totalStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      globalMetrics,
      productData: enhancedProductData,
      totalStats,
      rawStats: stats,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swipeshop-full-analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Product card component
  const ProductCard = ({
    product,
  }: {
    product: (typeof enhancedProductData)[0];
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card
        className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
          product.hasInteractions
            ? "border-l-4 border-l-blue-500"
            : "border-l-4 border-l-gray-300"
        }`}
      >
        <div className="relative">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {product.isInCart && (
              <Badge className="bg-purple-500 text-white text-xs">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Cart
              </Badge>
            )}
            {product.isInFavorites && (
              <Badge className="bg-pink-500 text-white text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Fav
              </Badge>
            )}
          </div>

          {/* Engagement status */}
          <div className="absolute top-2 left-2">
            {product.hasInteractions ? (
              <Badge className="bg-green-500 text-white text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-gray-400 text-white text-xs">
                <Minus className="w-3 h-3 mr-1" />
                No Data
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Product Info */}
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {product.title}
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{product.collection}</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            {product.hasInteractions ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <Heart className="w-3 h-3" />
                    <span className="font-bold text-sm">
                      {product.stats.likes}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Likes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-purple-600">
                    <Star className="w-3 h-3" />
                    <span className="font-bold text-sm">
                      {product.stats["Love It"]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Love It</div>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <X className="w-3 h-3" />
                    <span className="font-bold text-sm">
                      {product.stats.dislikes}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Nope</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <Eye className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Waiting for first interaction</p>
              </div>
            )}

            {/* Engagement Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Engagement</span>
                <span
                  className={`font-medium ${
                    product.engagementRate >= 70
                      ? "text-green-600"
                      : product.engagementRate >= 40
                        ? "text-yellow-600"
                        : product.hasInteractions
                          ? "text-red-600"
                          : "text-gray-400"
                  }`}
                >
                  {product.hasInteractions
                    ? formatPercentage(product.engagementRate)
                    : "No data"}
                </span>
              </div>
              <Progress
                value={product.engagementRate}
                className={`h-1 ${!product.hasInteractions ? "opacity-30" : ""}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-blue-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SwipeShop Analytics Pro
                </h1>
                <p className="text-sm text-gray-600">
                  Complete product analytics & insights
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Globe className="w-4 h-4 mr-2" />
                Main Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Global Metrics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {globalMetrics.totalProducts}
              </div>
              <div className="text-xs text-blue-600">Total Products</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {globalMetrics.activeProducts}
              </div>
              <div className="text-xs text-green-600">Active Products</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-4 text-center">
              <Minus className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">
                {globalMetrics.inactiveProducts}
              </div>
              <div className="text-xs text-gray-600">No Data Yet</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {globalMetrics.totalInteractions}
              </div>
              <div className="text-xs text-purple-600">Total Interactions</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700">
                {formatPercentage(globalMetrics.conversionRate)}
              </div>
              <div className="text-xs text-emerald-600">Conversion Rate</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {formatCurrency(globalMetrics.averagePrice)}
              </div>
              <div className="text-xs text-orange-600">Avg Price</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-700">
                {formatCurrency(globalMetrics.totalCatalogValue)}
              </div>
              <div className="text-xs text-indigo-600">Catalog Value</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-700">
                {favorites.length}
              </div>
              <div className="text-xs text-pink-600">In Favorites</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {filteredProducts.length} products
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.collection} •{" "}
                            {formatCurrency(product.price)}
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
                              </div>
                              <div className="text-center">
                                <div className="flex items-center gap-1 text-purple-600">
                                  <Star className="w-3 h-3" />
                                  <span className="font-medium">
                                    {product.stats["Love It"]}
                                  </span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center gap-1 text-red-600">
                                  <X className="w-3 h-3" />
                                  <span className="font-medium">
                                    {product.stats.dislikes}
                                  </span>
                                </div>
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
                                No interactions yet
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </motion.div>
        )}

        {/* Footer Stats */}
        <motion.div
          className="mt-12 p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center">
            <h3 className="font-bold text-blue-800 mb-4">
              📊 SwipeShop Analytics Pro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">✨ Product Coverage</h4>
                <p>
                  Tracking {globalMetrics.totalProducts} products with{" "}
                  {globalMetrics.activeProducts} having interaction data
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Performance Insights</h4>
                <p>
                  Real-time analytics with{" "}
                  {formatPercentage(globalMetrics.conversionRate)} overall
                  conversion rate
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔄 Live Updates</h4>
                <p>
                  Data automatically syncs with user interactions and persists
                  across sessions
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
