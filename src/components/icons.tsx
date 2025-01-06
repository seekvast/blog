import * as React from "react";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, filled = false, className = "", ...props }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      {...props}
    >
      {name}
    </span>
  );
}
