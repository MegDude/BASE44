import type { ReactNode } from "react";
import clsx from "clsx";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
};

const sizeMap = {
  default: "max-w-7xl",
  wide: "max-w-[88rem]",
  narrow: "max-w-4xl",
};

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  );
}
