import * as React from "react";
import { Star } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PurpleGradientButtonProps extends Omit<ButtonProps, "variant"> {
  starPosition?: "left" | "right";
  starClassName?: string;
  showStar?: boolean;
}

export const PurpleGradientButton = React.forwardRef<HTMLButtonElement, PurpleGradientButtonProps>(
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
          starClassName
        )}
      />
    ) : null;

    if (asChild) {
      return (
        <Button
          ref={ref}
          asChild
          variant="purpleGradient"
          size={size}
          className={cn(
            "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 transition-all duration-300 hover:from-purple-500 hover:via-indigo-500 hover:to-fuchsia-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        variant="purpleGradient"
        size={size}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 transition-all duration-300 hover:from-purple-500 hover:via-indigo-500 hover:to-fuchsia-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {starPosition === "left" && starIcon}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {starPosition === "right" && starIcon}
      </Button>
    );
  }
);

PurpleGradientButton.displayName = "PurpleGradientButton";
