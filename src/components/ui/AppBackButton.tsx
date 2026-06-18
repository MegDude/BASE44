import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";

type AppBackButtonProps = {
  label?: string;
  to?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  className?: string;
};

export function AppBackButton({ label = "BACK TO WORKSPACE", to, onClick, className }: AppBackButtonProps) {
  return (
    <AppButton to={to} onClick={onClick} variant="secondary" className={className}>
      <ArrowLeft aria-hidden="true" />
      <span>{label}</span>
    </AppButton>
  );
}
