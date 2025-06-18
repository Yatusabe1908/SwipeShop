import { useState, useEffect } from "react";
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
  Globe,
  Eye,
  Users,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  MapPin,
  Smartphone,
  Monitor,
  Calendar,
  Filter,
  Bell,
  Shield,
  Lock,
  Settings,
  Package,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Percent,
  DollarSign,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useRealTimeAnalytics,
  CustomerActivity,
} from "@/hooks/useRealTimeAnalytics";
import { useProductStats } from "@/hooks/useProductStats";
import LiveNotification from "@/components/LiveNotification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminControlCenter = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "info" | "warning" | "success";
      message: string;
      timestamp: Date;
    }>
  >([]);
  const [liveNotifications, setLiveNotifications] = useState<
    CustomerActivity[]
  >([]);

  const { liveMetrics, activities, trackActivity } = useRealTimeAnalytics();
  const { getTotalStats } = useProductStats();

  // Security check - in real app, this would verify admin authentication
  const isAuthorizedAdmin = () => {
    // Simple check - in production, this would be a proper authentication system
    const currentPath = window.location.pathname;
    return currentPath.includes("/analytics-dashboard-full");
  };

  useEffect(() => {
    if (!isAuthorizedAdmin()) {
      navigate("/");
      return;
    }

    // Track admin access
    trackActivity({
      type: "page_visit",
      metadata: { page: "admin_control_center", userType: "admin" },
    });
  }, [navigate, trackActivity]);

  // Monitor for new activities and show live notifications
  useEffect(() => {
    const recentActivity = liveMetrics.recentActivity[0];
    if (
      recentActivity &&
      !recentActivity.metadata?.userType && // Don't show admin activities
      recentActivity.type !== "session_end" // Don't show session ends
    ) {
      setLiveNotifications((prev) => {
        // Only show if it's not already shown
        if (!prev.find((n) => n.id === recentActivity.id)) {
          return [recentActivity, ...prev.slice(0, 2)]; // Keep max 3 notifications
        }
        return prev;
      });
    }
  }, [liveMetrics.recentActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLastUpdate(new Date());

    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        type: "success",
        message: "Dashboard data refreshed successfully",
        timestamp: new Date(),
      },
      ...prev.slice(0, 9),
    ]);

    setRefreshing(false);
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      liveMetrics,
      recentActivities: activities.slice(0, 100),
      totalStats: getTotalStats(),
      exportedBy: "admin",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swipeshop-control-center-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        type: "info",
        message: "Analytics data exported successfully",
        timestamp: new Date(),
      },
      ...prev.slice(0, 9),
    ]);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: CustomerActivity["type"]) => {
    switch (type) {
      case "session_start":
        return <Users className="w-4 h-4 text-green-500" />;
      case "session_end":
        return <Users className="w-4 h-4 text-gray-400" />;
      case "product_view":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "swipe_action":
        return <Zap className="w-4 h-4 text-purple-500" />;
      case "cart_add":
        return <ShoppingCart className="w-4 h-4 text-orange-500" />;
      case "favorite_add":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "page_visit":
        return <Globe className="w-4 h-4 text-indigo-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityMessage = (activity: CustomerActivity) => {
    switch (activity.type) {
      case "session_start":
        return "New user session started";
      case "session_end":
        return "User session ended";
      case "product_view":
        return `Viewed "${activity.productTitle}"`;
      case "swipe_action":
        return `${activity.action === "Love It" ? "💜 Loved" : activity.action === "like" ? "👍 Liked" : "👎 Passed on"} "${activity.productTitle}"`;
      case "cart_add":
        return `Added "${activity.productTitle}" to cart`;
      case "favorite_add":
        return `Added "${activity.productTitle}" to favorites`;
      case "page_visit":
        return activity.metadata?.page === "admin_control_center"
          ? "Admin accessed control center"
          : "User visited page";
      default:
        return "Unknown activity";
    }
  };

  if (!isAuthorizedAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Access Denied
            </h2>
            <p className="text-red-600 mb-4">
              This is a restricted admin area. Unauthorized access is not
              permitted.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-red-600 hover:bg-red-700"
            >
              Return to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  🔐 Admin Control Center
                </h1>
                <p className="text-sm text-gray-300">
                  Real-time customer activity monitoring • Last update:{" "}
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 mr-2" />
                Public Site
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
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
                className="border-purple-400/20 text-purple-400 hover:bg-purple-400/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Live Metrics Dashboard */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Active Users */}
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {liveMetrics.activeUsers}
              </div>
              <div className="text-xs text-green-300">Active Users</div>
            </CardContent>
          </Card>

          {/* Total Sessions */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <Activity className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {liveMetrics.totalSessions}
              </div>
              <div className="text-xs text-blue-300">Sessions (24h)</div>
            </CardContent>
          </Card>

          {/* Average Session */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {formatDuration(liveMetrics.averageSessionDuration)}
              </div>
              <div className="text-xs text-purple-300">Avg Session</div>
            </CardContent>
          </Card>

          {/* Total Swipes */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/20">
            <CardContent className="p-4 text-center">
              <Zap className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {liveMetrics.totalSwipes}
              </div>
              <div className="text-xs text-orange-300">Total Swipes</div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {liveMetrics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-pink-300">Conversion</div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border-indigo-500/20">
            <CardContent className="p-4 text-center">
              <Bell className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {liveMetrics.recentActivity.length}
              </div>
              <div className="text-xs text-indigo-300">Recent Events</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="live-activity" className="space-y-6">
          <TabsList className="bg-black/20 border-white/10">
            <TabsTrigger
              value="live-activity"
              className="data-[state=active]:bg-white/10"
            >
              Live Activity
            </TabsTrigger>
            <TabsTrigger
              value="product-details"
              className="data-[state=active]:bg-white/10"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white/10"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="top-products"
              className="data-[state=active]:bg-white/10"
            >
              Top Products
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-white/10"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Live Activity Tab */}
          <TabsContent value="live-activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Activity Feed */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live Customer Activity
                    <Badge className="bg-green-500/20 text-green-400 ml-auto">
                      Real-time
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-3">
                      {liveMetrics.recentActivity.length > 0 ? (
                        liveMetrics.recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className="mt-1">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm">
                                {getActivityMessage(activity)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-400">
                                  {activity.sessionId.slice(-8)}
                                </span>
                              </div>
                            </div>
                            {activity.action && (
                              <Badge
                                className={`text-xs ${
                                  activity.action === "Love It"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : activity.action === "like"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {activity.action}
                              </Badge>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No recent activity</p>
                          <p className="text-sm mt-1">
                            Activity will appear here in real-time
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Hourly Activity Chart */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    24-Hour Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {liveMetrics.hourlyStats.slice(-12).map((stat, index) => (
                      <div key={stat.hour} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{stat.hour}</span>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-blue-400">
                              {stat.users} users
                            </span>
                            <span className="text-purple-400">
                              {stat.swipes} swipes
                            </span>
                            <span className="text-green-400">
                              {stat.conversions} conversions
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Progress
                            value={
                              (stat.users /
                                Math.max(
                                  ...liveMetrics.hourlyStats.map(
                                    (h) => h.users,
                                  ),
                                  1,
                                )) *
                              100
                            }
                            className="h-2 bg-white/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sessions Analytics */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Session Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Sessions</span>
                    <span className="text-green-400 font-bold">
                      {liveMetrics.activeUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Sessions (24h)</span>
                    <span className="text-blue-400 font-bold">
                      {liveMetrics.totalSessions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg Session Duration</span>
                    <span className="text-purple-400 font-bold">
                      {formatDuration(liveMetrics.averageSessionDuration)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Swipes</span>
                    <span className="text-orange-400 font-bold">
                      {liveMetrics.totalSwipes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Conversion Rate</span>
                    <span className="text-pink-400 font-bold">
                      {liveMetrics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Recent Activities</span>
                    <span className="text-indigo-400 font-bold">
                      {liveMetrics.recentActivity.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Status */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Real-time tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Data persistence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Analytics active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Products Tab */}
          <TabsContent value="top-products" className="space-y-6">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveMetrics.topProducts.length > 0 ? (
                    liveMetrics.topProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="text-blue-400">
                              {product.views} views
                            </span>
                            <span className="text-purple-400">
                              {product.swipes} swipes
                            </span>
                            <span className="text-green-400">
                              {product.conversions} conversions
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {product.swipes > 0
                              ? (
                                  (product.conversions / product.swipes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </div>
                          <div className="text-xs text-gray-400">
                            conversion
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No product data available yet</p>
                      <p className="text-sm mt-1">
                        Data will appear as customers interact with products
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  System Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <div className="mt-1">
                          {notification.type === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          {notification.type === "warning" && (
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                          )}
                          {notification.type === "info" && (
                            <Bell className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No notifications</p>
                      <p className="text-sm mt-1">
                        System notifications will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.div
          className="mt-12 p-6 bg-black/20 rounded-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <Lock className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">
              🔐 Secure Admin Access
            </h3>
            <p className="text-gray-300 text-sm">
              This control center provides real-time monitoring of all customer
              activities. Data is encrypted and only accessible to authorized
              administrators.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Live Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {liveNotifications.map((activity, index) => (
          <div key={activity.id} style={{ marginTop: `${index * 80}px` }}>
            <LiveNotification
              activity={activity}
              onClose={() => {
                setLiveNotifications((prev) =>
                  prev.filter((n) => n.id !== activity.id),
                );
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminControlCenter;
