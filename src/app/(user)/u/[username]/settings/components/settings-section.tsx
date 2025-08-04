import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DESIGN_TOKENS, combineClasses } from "../constants/design-system";

interface SettingsSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLElement>;
  showBorder?: boolean;
}

const SettingsSection = React.forwardRef<HTMLElement, SettingsSectionProps>(
  ({ id, title, children, className, showBorder = true }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          combineClasses(
            DESIGN_TOKENS.spacing.section,
            DESIGN_TOKENS.spacing.scrollMargin,
            showBorder && DESIGN_TOKENS.spacing.sectionBorder
          ),
          className
        )}
        role="region"
        aria-labelledby={`${id}-title`}
      >
        {title && (
          <h2
            id={`${id}-title`}
            className={combineClasses(
              DESIGN_TOKENS.typography.sectionTitle,
              DESIGN_TOKENS.spacing.titleMargin
            )}
          >
            {title}
          </h2>
        )}
        {children}
      </section>
    );
  }
);

SettingsSection.displayName = "SettingsSection";

export default SettingsSection;
