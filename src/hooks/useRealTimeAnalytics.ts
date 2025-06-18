import { useState, useEffect, useCallback } from "react";
import { trackShopifyEvent } from "@/lib/shopify";

export interface CustomerActivity {
  id: string;
  timestamp: Date;
  type:
    | "session_start"
    | "session_end"
    | "product_view"
    | "swipe_action"
    | "cart_add"
    | "favorite_add"
    | "page_visit";
  customerId?: string;
  sessionId: string;
  productId?: string;
  productTitle?: string;
  action?: "like" | "dislike" | "Love It";
  location?: {
    country?: string;
    city?: string;
    userAgent?: string;
  };
  metadata?: any;
}

export interface LiveMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalSwipes: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    title: string;
    views: number;
    swipes: number;
    conversions: number;
  }>;
  recentActivity: CustomerActivity[];
  hourlyStats: Array<{
    hour: string;
    users: number;
    swipes: number;
    conversions: number;
  }>;
}

export const useRealTimeAnalytics = () => {
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeUsers: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    totalSwipes: 0,
    conversionRate: 0,
    topProducts: [],
    recentActivity: [],
    hourlyStats: [],
  });

  // Generate session ID for current user
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem("swipeshop_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("swipeshop_session_id", sessionId);
    }
    return sessionId;
  }, []);

  // Track customer activity
  const trackActivity = useCallback(
    (activity: Omit<CustomerActivity, "id" | "timestamp" | "sessionId">) => {
      const newActivity: CustomerActivity = {
        ...activity,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        sessionId: getSessionId(),
        location: {
          userAgent: navigator.userAgent,
          // In a real app, you'd get location from IP geolocation service
          country: "Unknown",
          city: "Unknown",
        },
      };

      // Store in localStorage for persistence
      const storedActivities = JSON.parse(
        localStorage.getItem("swipeshop_activities") || "[]",
      );
      const updatedActivities = [newActivity, ...storedActivities].slice(
        0,
        1000,
      ); // Keep last 1000 activities
      localStorage.setItem(
        "swipeshop_activities",
        JSON.stringify(updatedActivities),
      );

      setActivities((prev) => [newActivity, ...prev].slice(0, 100)); // Keep last 100 in state

      // Also track with Shopify if available
      if (activity.type === "swipe_action" && activity.productId) {
        trackShopifyEvent(activity.type, activity.productId, {
          action: activity.action,
          sessionId: newActivity.sessionId,
          timestamp: newActivity.timestamp,
        });
      }

      return newActivity;
    },
    [getSessionId],
  );

  // Calculate live metrics from activities
  const calculateMetrics = useCallback((activities: CustomerActivity[]) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent activities (last hour)
    const recentActivities = activities.filter(
      (a) => new Date(a.timestamp) > oneHourAgo,
    );

    // Active sessions (last 30 minutes)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const activeSessions = new Set(
      activities
        .filter((a) => new Date(a.timestamp) > thirtyMinutesAgo)
        .map((a) => a.sessionId),
    );

    // Total sessions (last 24h)
    const totalSessions = new Set(
      activities
        .filter((a) => new Date(a.timestamp) > oneDayAgo)
        .map((a) => a.sessionId),
    ).size;

    // Calculate session durations
    const sessionDurations: { [key: string]: number } = {};
    activities.forEach((activity) => {
      const sessionActivities = activities.filter(
        (a) => a.sessionId === activity.sessionId,
      );
      if (sessionActivities.length > 1) {
        const earliest = Math.min(
          ...sessionActivities.map((a) => new Date(a.timestamp).getTime()),
        );
        const latest = Math.max(
          ...sessionActivities.map((a) => new Date(a.timestamp).getTime()),
        );
        sessionDurations[activity.sessionId] = (latest - earliest) / 1000 / 60; // in minutes
      }
    });

    const averageSessionDuration =
      Object.values(sessionDurations).length > 0
        ? Object.values(sessionDurations).reduce(
            (sum, duration) => sum + duration,
            0,
          ) / Object.values(sessionDurations).length
        : 0;

    // Total swipes
    const totalSwipes = activities.filter(
      (a) => a.type === "swipe_action",
    ).length;

    // Conversions (Love It actions)
    const conversions = activities.filter(
      (a) => a.type === "swipe_action" && a.action === "Love It",
    ).length;
    const conversionRate =
      totalSwipes > 0 ? (conversions / totalSwipes) * 100 : 0;

    // Top products
    const productStats: {
      [key: string]: {
        views: number;
        swipes: number;
        conversions: number;
        title: string;
      };
    } = {};

    activities.forEach((activity) => {
      if (activity.productId && activity.productTitle) {
        if (!productStats[activity.productId]) {
          productStats[activity.productId] = {
            views: 0,
            swipes: 0,
            conversions: 0,
            title: activity.productTitle,
          };
        }

        if (activity.type === "product_view") {
          productStats[activity.productId].views++;
        } else if (activity.type === "swipe_action") {
          productStats[activity.productId].swipes++;
          if (activity.action === "Love It") {
            productStats[activity.productId].conversions++;
          }
        }
      }
    });

    const topProducts = Object.entries(productStats)
      .map(([productId, stats]) => ({
        productId,
        title: stats.title,
        views: stats.views,
        swipes: stats.swipes,
        conversions: stats.conversions,
      }))
      .sort((a, b) => b.swipes + b.views - (a.swipes + a.views))
      .slice(0, 10);

    // Hourly stats (last 24h)
    const hourlyStats: {
      [key: string]: {
        users: Set<string>;
        swipes: number;
        conversions: number;
      };
    } = {};

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.getHours().toString().padStart(2, "0") + ":00";
      hourlyStats[hourKey] = { users: new Set(), swipes: 0, conversions: 0 };
    }

    activities
      .filter((a) => new Date(a.timestamp) > oneDayAgo)
      .forEach((activity) => {
        const hour =
          new Date(activity.timestamp).getHours().toString().padStart(2, "0") +
          ":00";
        if (hourlyStats[hour]) {
          hourlyStats[hour].users.add(activity.sessionId);
          if (activity.type === "swipe_action") {
            hourlyStats[hour].swipes++;
            if (activity.action === "Love It") {
              hourlyStats[hour].conversions++;
            }
          }
        }
      });

    const hourlyStatsArray = Object.entries(hourlyStats).map(
      ([hour, stats]) => ({
        hour,
        users: stats.users.size,
        swipes: stats.swipes,
        conversions: stats.conversions,
      }),
    );

    return {
      activeUsers: activeSessions.size,
      totalSessions,
      averageSessionDuration,
      totalSwipes,
      conversionRate,
      topProducts,
      recentActivity: recentActivities.slice(0, 50),
      hourlyStats: hourlyStatsArray,
    };
  }, []);

  // Load activities from localStorage on mount
  useEffect(() => {
    const storedActivities = JSON.parse(
      localStorage.getItem("swipeshop_activities") || "[]",
    );
    const parsedActivities = storedActivities.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    }));

    setActivities(parsedActivities.slice(0, 100));
    setLiveMetrics(calculateMetrics(parsedActivities));
  }, [calculateMetrics]);

  // Update metrics when activities change
  useEffect(() => {
    const allActivities = JSON.parse(
      localStorage.getItem("swipeshop_activities") || "[]",
    ).map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    }));

    setLiveMetrics(calculateMetrics(allActivities));
  }, [activities, calculateMetrics]);

  // Track session start on mount
  useEffect(() => {
    trackActivity({ type: "session_start" });

    // Track page visits
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        trackActivity({ type: "page_visit" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Track session end on unmount
    return () => {
      trackActivity({ type: "session_end" });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [trackActivity]);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const allActivities = JSON.parse(
        localStorage.getItem("swipeshop_activities") || "[]",
      ).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));

      setLiveMetrics(calculateMetrics(allActivities));
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateMetrics]);

  // Clear old activities (older than 7 days)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const storedActivities = JSON.parse(
        localStorage.getItem("swipeshop_activities") || "[]",
      );
      const cleanedActivities = storedActivities.filter(
        (activity: any) => new Date(activity.timestamp) > sevenDaysAgo,
      );
      localStorage.setItem(
        "swipeshop_activities",
        JSON.stringify(cleanedActivities),
      );
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    activities,
    liveMetrics,
    trackActivity,
  };
};
