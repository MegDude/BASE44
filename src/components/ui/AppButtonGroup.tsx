import * as React from "react";
import { cn } from "@/lib/utils";

type AppButtonGroupProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppButtonGroup({ children, className }: AppButtonGroupProps) {
  return <div className={cn("dp-app-button-group", className)}>{children}</div>;
}
