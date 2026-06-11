import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "dp-button inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] text-[11.5px] font-semibold tracking-[0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/45 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-[rgba(200,169,106,0.34)] bg-white/84 text-[#0B1F33] shadow-none backdrop-blur-md hover:-translate-y-px hover:bg-white",
        destructive:
          "border border-[rgba(11,31,51,0.08)] bg-white/84 text-[#0B1F33] shadow-none hover:-translate-y-px hover:border-[#C8A96A]/45",
        outline:
          "border border-[rgba(11,31,51,0.08)] bg-white/72 text-[#0B1F33] shadow-none backdrop-blur-md hover:-translate-y-px hover:border-[#C8A96A]/45 hover:bg-white hover:text-[#0B1F33]",
        secondary:
          "border border-[rgba(11,31,51,0.08)] bg-white/68 text-[#0B1F33] shadow-none backdrop-blur-md hover:-translate-y-px hover:bg-white",
        ghost: "bg-transparent text-[#0B1F33]/68 shadow-none hover:-translate-y-px hover:text-[#0B1F33]",
        link: "bg-transparent text-[#0B1F33] underline-offset-4 shadow-none hover:text-[#C8A96A] hover:underline",
      },
      size: {
        default: "h-[30px] px-2.5 py-1",
        sm: "h-7 px-2.5 text-[11px]",
        lg: "h-8 px-3",
        icon: "h-[30px] w-[30px]",
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
