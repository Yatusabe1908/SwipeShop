import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Heart, ShoppingCart, Eye, Activity } from "lucide-react";
import { CustomerActivity } from "@/hooks/useRealTimeAnalytics";

interface LiveNotificationProps {
  activity: CustomerActivity;
  onClose: () => void;
}

export const LiveNotification = ({
  activity,
  onClose,
}: LiveNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (activity.type) {
      case "favorite_add":
        return <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />;
      case "cart_add":
        return <ShoppingCart className="w-4 h-4 text-purple-400" />;
      case "product_view":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "swipe_action":
        return <Activity className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessage = () => {
    const isWidget = activity.metadata?.widget;
    const platform = isWidget ? "(Widget)" : "(Main App)";

    switch (activity.type) {
      case "favorite_add":
        return `💖 Customer liked "${activity.productTitle}" ${platform}`;
      case "cart_add":
        return `🛒 Customer added "${activity.productTitle}" to cart ${platform}`;
      case "product_view":
        return `👀 Customer viewing "${activity.productTitle}" ${platform}`;
      case "swipe_action":
        const emoji =
          activity.action === "Love It"
            ? "💜"
            : activity.action === "like"
              ? "👍"
              : "👎";
        return `${emoji} Customer ${activity.action?.toLowerCase()} "${activity.productTitle}" ${platform}`;
      case "session_start":
        return `🚀 New customer session started ${platform}`;
      default:
        return `🔔 New customer activity ${platform}`;
    }
  };

  const getBorderColor = () => {
    switch (activity.type) {
      case "favorite_add":
        return "border-pink-500";
      case "cart_add":
        return "border-purple-500";
      case "product_view":
        return "border-blue-500";
      case "swipe_action":
        return activity.action === "Love It"
          ? "border-purple-500"
          : activity.action === "like"
            ? "border-green-500"
            : "border-red-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 max-w-sm bg-black/90 backdrop-blur-xl rounded-xl border-l-4 ${getBorderColor()} shadow-2xl p-4`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{getMessage()}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(activity.timestamp).toLocaleTimeString()} • Session:{" "}
                {activity.sessionId.slice(-6)}
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-xl"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveNotification;
