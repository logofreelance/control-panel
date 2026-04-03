import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textHeadingVariants = cva(
  "text-foreground transition-colors",
  {
    variants: {
      size: {
        h1: "text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05]",
        h2: "text-2xl md:text-4xl lg:text-5xl leading-tight",
        h3: "text-xl md:text-3xl lg:text-4xl leading-tight",
        h4: "text-lg md:text-2xl lg:text-3xl leading-snug",
        h5: "text-base md:text-lg lg:text-xl leading-snug",
        h6: "text-sm md:text-base lg:text-lg leading-snug",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
      },
    },
    defaultVariants: {
      size: "h2",
      weight: "semibold",
    },
  }
)

export interface TextHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof textHeadingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
}

const TextHeading = React.forwardRef<HTMLHeadingElement, TextHeadingProps>(
  ({ className, size, weight, as: Tag = "h2", ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn(textHeadingVariants({ size, weight, className }))}
        {...props}
      />
    )
  }
)

TextHeading.displayName = "TextHeading"

export { TextHeading, textHeadingVariants }
