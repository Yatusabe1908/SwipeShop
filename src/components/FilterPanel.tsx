import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { FilterOptions } from "@/lib/types";
import { collections } from "@/lib/mockData";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: FilterPanelProps) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const handlePriceChange = (values: number[]) => {
    setTempFilters((prev) => ({
      ...prev,
      priceRange: {
        min: values[0],
        max: values[1],
      },
    }));
  };

  const handleCollectionChange = (collection: string) => {
    setTempFilters((prev) => ({
      ...prev,
      collection: collection === "All" ? undefined : collection,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange: { min: 0, max: 500 },
      available: undefined,
      collection: undefined,
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-md mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Price Range
                  </h3>
                </div>

                <div className="px-2">
                  <div className="mb-4 text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-200">
                    <div className="text-lg font-bold text-gray-800 mb-1">
                      {formatPrice(tempFilters.priceRange.min)} -{" "}
                      {formatPrice(tempFilters.priceRange.max)}
                    </div>
                    <div className="text-xs text-gray-600">
                      🔄 Drag both circles to adjust the range
                    </div>
                  </div>

                  <div className="relative py-4">
                    <Slider
                      value={[
                        tempFilters.priceRange.min,
                        tempFilters.priceRange.max,
                      ]}
                      onValueChange={handlePriceChange}
                      max={500}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                    <div className="text-center">
                      <div className="font-semibold">$0</div>
                      <div>Minimum</div>
                    </div>
                    <div className="text-center px-2 text-pink-600 font-medium">
                      ← Drag the circles →
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">$500</div>
                      <div>Maximum</div>
                    </div>
                  </div>

                  {/* Quick preset buttons */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 text-center font-medium">
                      Quick ranges:
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceChange([0, 50])}
                        className="text-xs h-7 px-3 hover:bg-pink-50 border-pink-200"
                      >
                        Under $50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceChange([50, 150])}
                        className="text-xs h-7 px-3 hover:bg-pink-50 border-pink-200"
                      >
                        $50-$150
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceChange([150, 300])}
                        className="text-xs h-7 px-3 hover:bg-pink-50 border-pink-200"
                      >
                        $150-$300
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceChange([300, 500])}
                        className="text-xs h-7 px-3 hover:bg-pink-50 border-pink-200"
                      >
                        Over $300
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Collection
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => {
                    const isSelected =
                      collection === "All"
                        ? !tempFilters.collection
                        : tempFilters.collection === collection;

                    return (
                      <Badge
                        key={collection}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0"
                            : "hover:bg-pink-50 hover:border-pink-300"
                        }`}
                        onClick={() => handleCollectionChange(collection)}
                      >
                        {collection}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
