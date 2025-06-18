import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Star,
  ArrowLeft,
  Package,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/hooks/useCartAndFavorites";

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onBack: () => void;
  getCartTotal: () => number;
}

export const CartPage = ({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onBack,
  getCartTotal,
}: CartPageProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsProcessing(false);
      // Here we would integrate with Shopify checkout
      alert("Checkout processed! (Integrate with Shopify)");
    }, 2000);
  };

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
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            My Cart
          </h1>
          <p className="text-gray-600">
            {cart.length} "Love It" product{cart.length !== 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(getCartTotal())}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {cart.reduce((total, item) => total + item.quantity, 0)}{" "}
                    items
                  </p>
                  <Badge className="bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Love It
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cart Items */}
      <motion.div variants={itemVariants} className="space-y-4 mb-6">
        {cart.length > 0 ? (
          cart.map((item) => (
            <motion.div key={item.product.id} variants={itemVariants} layout>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 mr-3">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {item.product.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-1">
                            {item.product.vendor}
                          </p>
                          <p className="text-sm font-bold text-purple-600">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="text-red-500 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity - 1,
                              )
                            }
                            className="h-8 w-8 p-0"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="mx-2 font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity + 1,
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Empty Cart
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't loved any products yet. Swipe up on products you
                  love!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                  <Star className="w-4 h-4" />
                  <span>Love It = Add to cart</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Checkout Button */}
      {cart.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="fixed bottom-6 left-6 right-6 max-w-md mx-auto"
        >
          <Button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 mr-2"
                >
                  <DollarSign className="w-5 h-5" />
                </motion.div>
                Procesando...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 mr-2" />
                Checkout - {formatPrice(getCartTotal())}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
