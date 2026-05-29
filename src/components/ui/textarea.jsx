import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-[5px] bg-white/72 px-3 py-2 text-[14px] text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.045)] placeholder:text-[#425466]/54 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] focus-visible:shadow-[inset_0_0_0_1px_rgba(179,143,79,0.12),0_0_22px_rgba(179,143,79,0.08)] disabled:cursor-not-allowed disabled:opacity-50 md:text-[13px]",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
