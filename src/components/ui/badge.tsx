import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30",
        secondary:
          "bg-white/10 text-gray-300 border border-white/10",
        destructive:
          "bg-red-600/20 text-red-300 border border-red-500/30",
        outline: "border border-white/20 text-gray-300",
        success:
          "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30",
        // New vibrant variants
        pink: "bg-pink-600/20 text-pink-300 border border-pink-500/30",
        coral:
          "bg-coral-600/20 text-coral-300 border border-coral-500/30",
        teal: "bg-teal-600/20 text-teal-300 border border-teal-500/30",
        amber:
          "bg-amber-600/20 text-amber-300 border border-amber-500/30",
        fuchsia:
          "bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30",
        cyan: "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30",
        // Gradient variants
        gradient:
          "bg-gradient-to-r from-indigo-600/20 via-fuchsia-600/20 to-coral-600/20 text-fuchsia-300 border border-fuchsia-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
