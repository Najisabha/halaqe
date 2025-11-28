import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Root component
export const Dialog = DialogPrimitive.Root;

// Overlay
export const DialogOverlay = React.forwardRef(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`
      fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
      ${className}
    `}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

// Content
export const DialogContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`
        fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2
        rounded-xl bg-white p-6 shadow-lg focus:outline-none
        ${className}
      `}
      {...props}
    />
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

// Header
export function DialogHeader({ className = "", ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
  );
}

// Title
export const DialogTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";
export const DialogTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} className={className} {...props}>
    {children}
  </DialogPrimitive.Trigger>
));
DialogTrigger.displayName = "DialogTrigger";