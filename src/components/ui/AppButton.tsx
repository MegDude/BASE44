import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type AppButtonVariant = "primary" | "secondary" | "gold" | "ghost" | "text";
type AppButtonSize = "sm" | "md" | "icon";

type AppButtonProps = {
  as?: "button" | "a" | "link";
  to?: string;
  href?: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const variantClassNames: Record<AppButtonVariant, string> = {
  primary: "dp-app-button--primary",
  secondary: "dp-app-button--secondary",
  gold: "dp-app-button--gold",
  ghost: "dp-app-button--ghost",
  text: "dp-app-button--text",
};

const sizeClassNames: Record<AppButtonSize, string> = {
  sm: "dp-app-button--sm",
  md: "dp-app-button--md",
  icon: "dp-app-button--icon",
};

export const AppButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, AppButtonProps>(
  (
    {
      as,
      to,
      href,
      variant = "secondary",
      size = "md",
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const sharedClassName = cn("dp-app-button", variantClassNames[variant], sizeClassNames[size], className);

    if (to || as === "link") {
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to || "#"} className={sharedClassName} {...props}>
          {children}
        </Link>
      );
    }

    if (href || as === "a") {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href || "#"} className={sharedClassName} {...props}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} className={sharedClassName} {...props}>
        {children}
      </button>
    );
  },
);

AppButton.displayName = "AppButton";
