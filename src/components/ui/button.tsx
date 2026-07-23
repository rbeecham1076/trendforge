import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:shadow-indigo-500/40",
        destructive:
          "bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-500",
        outline:
          "border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
        ghost: "text-gray-300 hover:text-white hover:bg-white/5",
        link: "text-indigo-400 underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 animate-gradient bg-right hover:bg-left",
        // New multi-color gradient variant
        vibrant:
          "bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-coral-600 bg-[length:200%_100%] text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 animate-gradient bg-right hover:bg-left",
        // Sunset variant
        sunset:
          "bg-gradient-to-r from-coral-600 via-pink-600 to-violet-600 bg-[length:200%_100%] text-white shadow-lg shadow-coral-500/25 hover:shadow-coral-500/40 animate-gradient bg-right hover:bg-left",
        // Ocean variant
        ocean:
          "bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 bg-[length:200%_100%] text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 animate-gradient bg-right hover:bg-left",
        // Forest variant
        forest:
          "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-[length:200%_100%] text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 animate-gradient bg-right hover:bg-left",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
