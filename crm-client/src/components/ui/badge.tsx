import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-100 text-emerald-700 border border-emerald-200",
        secondary:
          "bg-blue-100 text-blue-700 border border-blue-200",
        destructive:
          "bg-red-100 text-red-700 border border-red-200",
        outline: "text-foreground border border-slate-200",
        success:
          "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning:
          "bg-amber-100 text-amber-700 border border-amber-200",
        info:
          "bg-blue-100 text-blue-700 border border-blue-200",
        purple:
          "bg-purple-100 text-purple-700 border border-purple-200",
        vip:
          "bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }