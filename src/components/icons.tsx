import * as React from "react";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  filled?: boolean;
  className?: string;
}

export function Icon({
  name,
  filled = false,
  className = "",
  ...props
}: IconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        fontFamily: "'Material Symbols Rounded'",
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
        WebkitFontSmoothing: "antialiased",
      }}
      {...props}
    >
      {name}
    </span>
  );
}
