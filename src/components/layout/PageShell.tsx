import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="absolute inset-x-0 top-0 -z-10 h-[42rem] bg-gradient-to-b from-sky-100/60 via-slate-50 to-slate-50" />
      {children}
    </div>
  );
}
