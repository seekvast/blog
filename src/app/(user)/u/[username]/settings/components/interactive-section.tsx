import React, { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DESIGN_TOKENS, combineClasses } from "../constants/design-system";

interface InteractiveSectionProps {
  title: string;
  description?: string;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

const InteractiveSection: React.FC<InteractiveSectionProps> = ({
  title,
  description,
  onClick,
  className,
  ariaLabel,
  children,
}) => {
  if (children) {
    return (
      <div className={cn("space-y-3", className)} role="group">
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("cursor-pointer", className)}
      onClick={onClick}
      aria-label={ariaLabel || `点击查看${title}`}
    >
      <div className={DESIGN_TOKENS.layout.flexBetween + " gap-2"}>
        <div className={DESIGN_TOKENS.layout.flex1}>
          <div className={DESIGN_TOKENS.typography.itemTitle}>{title}</div>
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        <ChevronRight
          className={DESIGN_TOKENS.interaction.icon}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default InteractiveSection;
