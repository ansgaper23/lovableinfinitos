import * as React from "react";
import { Star } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface PurpleGradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  starPosition?: "left" | "right";
  starClassName?: string;
  showStar?: boolean;
  size?: "default" | "sm" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-9 px-4 text-xs rounded-lg gap-1.5",
  default: "h-11 px-6 text-sm rounded-xl gap-2",
  lg: "h-13 px-8 text-base rounded-xl gap-2.5",
  xl: "h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-2xl gap-3 font-black",
};

export const PurpleGradientButton = React.forwardRef<
  HTMLButtonElement,
  PurpleGradientButtonProps
>(
  (
    {
      children = "Comenzar Ahora",
      className,
      starPosition = "left",
      starClassName,
      showStar = true,
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const starIcon = showStar ? (
      <Star
        className={cn(
          "w-4 h-4 fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)] shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110",
          size === "xl" && "w-5 h-5",
          size === "sm" && "w-3.5 h-3.5",
          starClassName
        )}
      />
    ) : null;

    const baseClasses = cn(
      "group relative inline-flex items-center justify-center font-bold text-white transition-all duration-300 select-none cursor-pointer",
      "bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-500 hover:to-indigo-500",
      "shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)]",
      "border border-purple-400/40 hover:border-purple-300/60",
      "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
      "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
      sizeClasses[size],
      className
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={baseClasses} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {/* Shine highlight */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none rounded-[inherit]" />
        
        {starPosition === "left" && starIcon}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {starPosition === "right" && starIcon}
      </button>
    );
  }
);

PurpleGradientButton.displayName = "PurpleGradientButton";

export default PurpleGradientButton;

