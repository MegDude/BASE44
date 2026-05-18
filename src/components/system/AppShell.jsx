import React from "react";
import { cn } from "@/lib/utils";

export default function AppShell({ children, className = "", nav, footer }) {
  return (
    <div className={cn("min-h-screen bg-[#f7f7fb] text-slate-950 antialiased", className)}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[34rem] w-[34rem] rounded-full bg-blue-200/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-amber-200/12 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-slate-300/14 blur-[120px]" />
      </div>

      {nav ? <div className="relative z-20">{nav}</div> : null}

      <main className="relative z-10">{children}</main>

      {footer ? <div className="relative z-10">{footer}</div> : null}
    </div>
  );
}
