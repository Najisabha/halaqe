import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Provider (wrap your app or component tree)
export const TooltipProvider = TooltipPrimitive.Provider;

// Root Tooltip
export const Tooltip = TooltipPrimitive.Root;

// Trigger (the element that shows the tooltip on hover/focus)
export const TooltipTrigger = TooltipPrimitive.Trigger;

// Content (what’s shown in the tooltip)
export const TooltipContent = React.forwardRef(
  ({ className = "", side = "top", align = "center", children, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      align={align}
      className={`z-50 rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white shadow-md ${className}`}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-gray-900" />
    </TooltipPrimitive.Content>
  )
);

TooltipContent.displayName = "TooltipContent";
