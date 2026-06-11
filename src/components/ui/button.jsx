import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "dp-button inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] text-[11.5px] font-semibold tracking-[0.04em] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.975] active:duration-75 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-[rgba(200,169,106,0.34)] bg-white/84 text-[#0B1F33] shadow-[0_1px_3px_rgba(11,31,51,0.06),0_4px_10px_rgba(11,31,51,0.04)] backdrop-blur-md hover:-translate-y-px hover:bg-white hover:shadow-[0_2px_8px_rgba(11,31,51,0.08),0_8px_20px_rgba(11,31,51,0.06)] active:translate-y-0 active:shadow-none",
        primary:
          "border-0 bg-[#0B1F33] text-white shadow-[0_2px_8px_rgba(11,31,51,0.18),0_8px_20px_rgba(11,31,51,0.12)] hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22),0_12px_28px_rgba(11,31,51,0.14)] active:translate-y-0 active:bg-[#0B1F33] active:shadow-[0_1px_4px_rgba(11,31,51,0.14)]",
        destructive:
          "border border-[rgba(11,31,51,0.08)] bg-white/84 text-[#0B1F33] shadow-none hover:-translate-y-px hover:border-[#C8A96A]/45",
        outline:
          "border border-[rgba(11,31,51,0.10)] bg-white/72 text-[#0B1F33] shadow-none backdrop-blur-md hover:-translate-y-px hover:border-[#C8A96A]/50 hover:bg-white hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.06)] active:translate-y-0",
        secondary:
          "border border-[rgba(11,31,51,0.08)] bg-white/68 text-[#0B1F33] shadow-none backdrop-blur-md hover:-translate-y-px hover:bg-white hover:shadow-[0_2px_8px_rgba(11,31,51,0.06)] active:translate-y-0",
        ghost: "bg-transparent text-[#0B1F33]/68 shadow-none hover:bg-[rgba(11,31,51,0.04)] hover:text-[#0B1F33] active:bg-[rgba(11,31,51,0.06)]",
        link: "bg-transparent text-[#0B1F33] underline-offset-4 shadow-none hover:text-[#C8A96A] hover:underline",
      },
      size: {
        default: "h-[32px] px-3 py-1",
        sm: "h-[28px] px-2.5 text-[11px]",
        lg: "h-[38px] px-4 text-[12.5px]",
        xl: "h-[44px] px-5 text-[13px]",
        icon: "h-[32px] w-[32px]",
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
