import * as React from "react";
import { cn } from "@/app/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-black text-white hover:opacity-90",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        variant === "ghost" && "hover:bg-gray-100",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-6",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
