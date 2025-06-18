import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Check if it's a range slider (has array value)
  const isRange =
    Array.isArray(props.value) || Array.isArray(props.defaultValue);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-pink-500 to-purple-600" />
      </SliderPrimitive.Track>

      {/* First thumb (always present) */}
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95" />

      {/* Second thumb (only for range sliders) */}
      {isRange && (
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95" />
      )}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
