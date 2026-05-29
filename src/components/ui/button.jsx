import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-[12px] font-medium tracking-[0.02em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#0B1F33] text-white shadow-[0_10px_24px_rgba(11,31,51,0.10)] hover:-translate-y-px hover:bg-[#081521] hover:shadow-[0_12px_28px_rgba(11,31,51,0.12),0_0_18px_rgba(179,143,79,0.08)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_24px_rgba(11,31,51,0.08)] hover:-translate-y-px hover:bg-destructive/90",
        outline:
          "bg-white/72 text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.045),0_8px_20px_rgba(11,31,51,0.04)] backdrop-blur-md hover:-translate-y-px hover:bg-white hover:text-[#0B1F33] hover:shadow-[inset_0_0_0_1px_rgba(179,143,79,0.12),0_10px_24px_rgba(11,31,51,0.05)]",
        secondary:
          "bg-white/68 text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04)] backdrop-blur-md hover:-translate-y-px hover:bg-white",
        ghost: "bg-transparent text-[#0B1F33]/68 shadow-none hover:-translate-y-px hover:text-[#0B1F33]",
        link: "bg-transparent text-[#0B1F33] underline-offset-4 shadow-none hover:text-[#B38F4F] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
