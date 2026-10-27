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
    if (asChild) {
      return (
        <Button
          ref={ref}
          asChild
          variant="purpleGradient"
          size={size}
          className={cn(
            "bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/30 transition-all duration-300 transform hover:-translate-y-0.5",
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
          "bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/30 transition-all duration-300 transform hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        {showStar && starPosition === "left" && (
          <Star className={cn("w-4 h-4 fill-amber-300 text-amber-300 shrink-0", starClassName)} />
        )}
        {children}
        {showStar && starPosition === "right" && (
          <Star className={cn("w-4 h-4 fill-amber-300 text-amber-300 shrink-0", starClassName)} />
        )}
      </Button>
    );
  }
);

PurpleGradientButton.displayName = "PurpleGradientButton";
