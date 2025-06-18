import { useState, useRef, forwardRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  Heart,
  X,
  Star,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTopCard: boolean;
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      product,
      onSwipe,
      isTopCard,
      currentImageIndex: externalImageIndex,
      onImageChange,
    },
    ref,
  ) => {
    const [internalImageIndex, setInternalImageIndex] = useState(0);

    // Use external image index if provided, otherwise use internal state
    const currentImageIndex =
      externalImageIndex !== undefined
        ? externalImageIndex
        : internalImageIndex;
    const setCurrentImageIndex = onImageChange || setInternalImageIndex;
    const [isDragging, setIsDragging] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [imageTransition, setImageTransition] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Tinder-style transformations
    const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
    const scale = useTransform([x, y], ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return Math.max(0.7, 1 - distance / 1000);
    });
    const opacity = useTransform([x, y], ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return Math.max(0.3, 1 - distance / 400);
    });

    // Enhanced overlay transitions with smoother curves
    const leftOverlay = useTransform(x, [-300, -80, -20, 0], [1, 0.8, 0.3, 0]);
    const rightOverlay = useTransform(x, [0, 20, 80, 300], [0, 0.3, 0.8, 1]);
    const upOverlay = useTransform(y, [-300, -80, -20, 0], [1, 0.8, 0.3, 0]);

    const handleDragStart = () => {
      setIsDragging(true);
    };

    // Add haptic feedback and visual cues during drag
    const handleDrag = (event: any, info: PanInfo) => {
      const swipeThreshold = 120;
      const loveItThreshold = 100;

      // Trigger haptic feedback when reaching thresholds (if supported)
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        if (
          Math.abs(info.offset.x) > swipeThreshold ||
          Math.abs(info.offset.y) > loveItThreshold
        ) {
          // Light vibration when threshold is reached
          navigator.vibrate(10);
        }
      }
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
      setIsDragging(false);
      const swipeThreshold = 120; // Increased threshold for more intentional swipes
      const loveItThreshold = 100;
      const velocityThreshold = 500; // Velocity-based swiping like Tinder

      // Check velocity for quick swipes
      const isQuickSwipe =
        Math.abs(info.velocity.x) > velocityThreshold ||
        Math.abs(info.velocity.y) > velocityThreshold;

      if (
        Math.abs(info.offset.x) > swipeThreshold ||
        (isQuickSwipe && Math.abs(info.offset.x) > 50)
      ) {
        // Animate off screen before calling onSwipe
        const direction = info.offset.x > 0 ? 1 : -1;
        x.set(direction * 1000);
        y.set(info.offset.y * 2);

        setTimeout(() => {
          onSwipe(direction > 0 ? "right" : "left");
        }, 150);
      } else if (
        info.offset.y < -loveItThreshold ||
        (isQuickSwipe && info.offset.y < -40)
      ) {
        // Animate up off screen
        y.set(-1000);
        x.set(info.offset.x * 2);

        setTimeout(() => {
          onSwipe("up");
        }, 150);
      } else {
        // Snap back to center with spring animation
        x.stop();
        y.stop();
        x.set(0, { type: "spring", stiffness: 300, damping: 30 });
        y.set(0, { type: "spring", stiffness: 300, damping: 30 });
      }
    };

    // Horizontal swipe for image navigation
    const handleImageSwipe = (event: any, info: PanInfo) => {
      if (product.images.length <= 1) return;

      const swipeThreshold = 50;
      if (Math.abs(info.offset.x) > swipeThreshold) {
        setImageTransition(true);
        setTimeout(() => {
          if (info.offset.x > 0) {
            prevImage();
          } else {
            nextImage();
          }
          setImageTransition(false);
        }, 150);
      }
    };

    const nextImage = () => {
      if (product.images.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }
    };

    const prevImage = () => {
      if (product.images.length > 1) {
        setCurrentImageIndex(
          (prev) => (prev - 1 + product.images.length) % product.images.length,
        );
      }
    };

    const goToImage = (index: number) => {
      if (index !== currentImageIndex) {
        setImageTransition(true);
        setTimeout(() => {
          setCurrentImageIndex(index);
          setImageTransition(false);
        }, 150);
      }
    };

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    };

    return (
      <>
        {/* Product Card */}
        <motion.div
          ref={cardRef}
          className={`absolute inset-0 cursor-grab active:cursor-grabbing select-none ${
            isTopCard ? "z-20" : "z-10"
          }`}
          style={{
            x,
            y,
            rotate,
            scale,
            opacity,
            height: isTopCard ? "calc(100% - 80px)" : "calc(100% - 80px)",
          }}
          drag={isTopCard}
          dragConstraints={{ left: -400, right: 400, top: -300, bottom: 100 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.95 }} // Gentler tap animation
          initial={{
            scale: isTopCard ? 0.8 : 0.7,
            opacity: 0,
            y: isTopCard ? 50 : 80,
            rotate: isTopCard ? -5 : -10,
          }}
          animate={{
            scale: isTopCard ? 1 : 0.9,
            opacity: isTopCard ? 1 : 0.6,
            y: isTopCard ? 0 : 30,
            rotate: 0,
          }}
          exit={{
            scale: 0.8,
            opacity: 0,
            y: -50,
            transition: { duration: 0.2 },
          }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: isTopCard ? 0 : 0.1,
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full w-full max-w-[320px] mx-auto relative select-none aspect-square">
            {/* Enhanced Tinder-style Swipe Overlays */}
            {/* NOPE Overlay - Left Swipe */}
            <motion.div
              className="absolute inset-0 z-30 rounded-3xl overflow-hidden"
              style={{ opacity: leftOverlay }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/95 to-red-600/95"
                animate={{
                  scale: leftOverlay.get() > 0.1 ? [0.9, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3, type: "tween" }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-red-500/20">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bg-white/10 rounded-full"
                      style={{
                        width: `${80 + i * 40}px`,
                        height: `${80 + i * 40}px`,
                        left: `${20 + i * 15}%`,
                        top: `${10 + i * 20}%`,
                      }}
                      animate={{
                        scale: leftOverlay.get() > 0.1 ? [1, 1.3, 1] : 1,
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    />
                  ))}
                </div>

                {/* Main content */}
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    className="text-center"
                    animate={{
                      y: leftOverlay.get() > 0.1 ? [-10, 10, 0] : 0,
                      rotate: leftOverlay.get() > 0.1 ? [-5, 5, 0] : 0,
                    }}
                    transition={{ duration: 0.4, type: "tween" }}
                  >
                    <motion.div
                      className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl mb-4 mx-auto"
                      animate={{
                        scale: leftOverlay.get() > 0.1 ? [1, 1.3, 1.1] : 1,
                        rotate: leftOverlay.get() > 0.1 ? [0, -15, -10] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        type: "tween",
                      }}
                    >
                      <X className="w-16 h-16 text-red-500" />
                    </motion.div>
                    <motion.div
                      className="text-white font-black text-4xl drop-shadow-lg"
                      style={{
                        textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
                        transform: `rotate(-15deg)`,
                      }}
                      animate={{
                        scale: leftOverlay.get() > 0.1 ? [1, 1.2, 1.1] : 1,
                      }}
                      transition={{ duration: 0.4, type: "tween" }}
                    >
                      NOPE
                    </motion.div>
                    <motion.div
                      className="text-white/90 font-bold text-lg mt-2"
                      animate={{ opacity: [0.7, 1, 0.8] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    >
                      Not interested
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* LIKE Overlay - Right Swipe */}
            <motion.div
              className="absolute inset-0 z-30 rounded-3xl overflow-hidden"
              style={{ opacity: rightOverlay }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/95 to-green-600/95"
                animate={{
                  scale: rightOverlay.get() > 0.1 ? [0.9, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3, type: "tween" }}
              >
                {/* Animated hearts background */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-white/20"
                      style={{
                        left: `${10 + (i % 4) * 25}%`,
                        top: `${10 + Math.floor(i / 4) * 40}%`,
                        fontSize: `${20 + i * 5}px`,
                      }}
                      animate={{
                        y: rightOverlay.get() > 0.1 ? [-20, 20, 0] : 0,
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.15,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    >
                      ♥
                    </motion.div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    className="text-center"
                    animate={{
                      y: rightOverlay.get() > 0.1 ? [-10, 10, 0] : 0,
                      rotate: rightOverlay.get() > 0.1 ? [5, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.4, type: "tween" }}
                  >
                    <motion.div
                      className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl mb-4 mx-auto"
                      animate={{
                        scale: rightOverlay.get() > 0.1 ? [1, 1.4, 1.2] : 1,
                      }}
                      transition={{
                        duration: 0.6,
                        type: "tween",
                      }}
                    >
                      <Heart
                        className="w-16 h-16 text-emerald-500"
                        fill="currentColor"
                      />
                    </motion.div>
                    <motion.div
                      className="text-white font-black text-4xl drop-shadow-lg"
                      style={{
                        textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
                        transform: `rotate(15deg)`,
                      }}
                      animate={{
                        scale: rightOverlay.get() > 0.1 ? [1, 1.2, 1.1] : 1,
                      }}
                      transition={{ duration: 0.4, type: "tween" }}
                    >
                      LIKE
                    </motion.div>
                    <motion.div
                      className="text-white/90 font-bold text-lg mt-2"
                      animate={{ opacity: [0.7, 1, 0.8] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    >
                      Added to favorites
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* LOVE IT Overlay - Up Swipe */}
            <motion.div
              className="absolute inset-0 z-30 rounded-3xl overflow-hidden"
              style={{ opacity: upOverlay }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/95 to-violet-600/95"
                animate={{
                  scale: upOverlay.get() > 0.1 ? [0.9, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.4, type: "tween" }}
              >
                {/* Animated stars background */}
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-300/30"
                      style={{
                        left: `${5 + (i % 4) * 25}%`,
                        top: `${5 + Math.floor(i / 4) * 30}%`,
                        fontSize: `${15 + i * 3}px`,
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.5, 1],
                        opacity: [0.3, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    >
                      ⭐
                    </motion.div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    className="text-center"
                    animate={{
                      y: upOverlay.get() > 0.1 ? [-15, 0, -5] : 0,
                    }}
                    transition={{ duration: 0.5, type: "tween" }}
                  >
                    <motion.div
                      className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl mb-4 mx-auto"
                      animate={{
                        scale: upOverlay.get() > 0.1 ? [1, 1.5, 1.3] : 1,
                        rotate: upOverlay.get() > 0.1 ? [0, 360, 180] : 0,
                      }}
                      transition={{
                        duration: 0.8,
                        type: "tween",
                      }}
                    >
                      <Star
                        className="w-16 h-16 text-purple-500"
                        fill="currentColor"
                      />
                    </motion.div>
                    <motion.div
                      className="text-white font-black text-4xl drop-shadow-lg"
                      style={{
                        textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
                      }}
                      animate={{
                        scale: upOverlay.get() > 0.1 ? [1, 1.3, 1.2] : 1,
                        textShadow:
                          upOverlay.get() > 0.1
                            ? [
                                "3px 3px 0px rgba(0,0,0,0.3)",
                                "5px 5px 10px rgba(255,255,255,0.5)",
                                "3px 3px 0px rgba(0,0,0,0.3)",
                              ]
                            : "3px 3px 0px rgba(0,0,0,0.3)",
                      }}
                      transition={{ duration: 0.4, type: "tween" }}
                    >
                      LOVE IT
                    </motion.div>
                    <motion.div
                      className="text-white/90 font-bold text-lg mt-2"
                      animate={{ opacity: [0.7, 1, 0.8] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    >
                      Added to cart
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Product Image with creative navigation */}
            <div className="relative h-full overflow-hidden">
              {/* Non-draggable top area for navigation controls */}
              <div className="absolute top-0 left-0 right-0 h-16 z-20 pointer-events-none">
                {/* This creates a non-draggable zone for the navigation controls */}
              </div>

              <motion.div
                className="w-full h-full relative overflow-hidden"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleImageSwipe}
              >
                <motion.img
                  key={`${currentImageIndex}-${imageTransition}`}
                  src={product.images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{
                    opacity: imageTransition ? 0 : 1,
                    scale: imageTransition ? 0.9 : 1,
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                />
              </motion.div>

              {/* Creative Image Navigation */}
              {product.images.length > 1 && (
                <>
                  {/* Left/Right Navigation Buttons */}
                  <div className="absolute inset-0 flex">
                    <button
                      className="flex-1 relative z-10 bg-transparent border-0 mt-[122px]"
                      onClick={prevImage}
                    >
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </div>
                    </button>

                    <div
                      className="flex-1 relative z-10 cursor-pointer mt-[120px]"
                      onClick={nextImage}
                    >
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Image Navigation Controls */}
                  <div className="absolute top-3 left-[180px] transform -translate-x-1/2 flex items-center justify-center gap-2 bg-black/30 backdrop-blur-sm rounded-full py-1.5 z-30 pointer-events-auto">
                    {/* Previous Button */}
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prevImage();
                      }}
                      disabled={currentImageIndex === 0}
                      className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all p-1"
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    {/* Image Indicators */}
                    <div className="flex gap-1.5 px-2">
                      {product.images.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToImage(index);
                          }}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            index === currentImageIndex
                              ? "w-6 bg-white shadow-lg"
                              : "w-2 bg-white/60 hover:bg-white/80"
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>

                    {/* Next Button */}
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextImage();
                      }}
                      disabled={currentImageIndex === product.images.length - 1}
                      className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all p-1"
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Camera Icon for Multiple Images */}
                  <div className="absolute top-4 right-4">
                    <motion.div
                      className="bg-black/30 backdrop-blur-sm rounded-full p-2"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        type: "tween",
                      }}
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {product.images.length}
                      </span>
                    </motion.div>
                  </div>
                </>
              )}

              {/* Collection Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-gray-800 hover:bg-white border-0">
                  {product.collection}
                </Badge>
              </div>

              {/* Sale Badge */}
              {product.compareAtPrice && (
                <div className="absolute top-12 left-4">
                  <Badge className="bg-red-500 text-white hover:bg-red-600">
                    Sale
                  </Badge>
                </div>
              )}

              {/* Price and Vendor - Always Visible Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold drop-shadow-lg">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-base text-white/70 line-through drop-shadow">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-white/90">
                      <ShoppingBag className="w-4 h-4 drop-shadow" />
                      <span className="font-semibold text-base drop-shadow">
                        {product.vendor}
                      </span>
                    </div>
                  </div>
                  <div className="text-right max-w-[60%]">
                    <h3 className="text-base font-bold leading-tight line-clamp-2 text-right drop-shadow-lg">
                      {product.title}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* External Action Buttons */}
        {isTopCard && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{
              x: isDragging ? x : 0,
              opacity: isDragging ? 0.7 : 1,
              marginTop: "20px",
            }}
          >
            <div className="max-w-[360px] mx-auto px-5 pr-5 pl-9">
              <div className="bg-white/95 backdrop-blur-xl rounded-xl pb-2 shadow-lg border border-white/30 mx-8 mr-8 ml-6">
                <div className="flex items-center justify-center gap-4 pt-1 -mt-px">
                  <motion.button
                    className="bg-white shadow-md rounded-full p-2 text-red-500 hover:bg-red-50 transition-all duration-200 border border-red-100 hover:shadow-lg"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwipe("left");
                    }}
                    title="Nope - Not interested"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    className="bg-white shadow-md rounded-full p-3 text-purple-500 hover:bg-purple-50 transition-all duration-200 border border-purple-100 hover:shadow-lg"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwipe("up");
                    }}
                    title="Love It - Add to cart"
                  >
                    <Star className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="bg-white shadow-md rounded-full p-2 text-green-500 hover:bg-green-50 transition-all duration-200 border border-green-100 hover:shadow-lg"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwipe("right");
                    }}
                    title="Like - Add to favorites"
                  >
                    <Heart className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Action Labels */}
                <div className="flex items-center justify-center gap-4 mt-1">
                  <span className="text-[10px] font-medium text-red-600">
                    Nope
                  </span>
                  <span className="text-[10px] font-medium text-purple-600">
                    Love It
                  </span>
                  <span className="text-[10px] font-medium text-green-600">
                    Like
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </>
    );
  },
);

ProductCard.displayName = "ProductCard";
