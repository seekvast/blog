"use client";

import * as React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileDrawer({ 
  children, 
  className,
  open,
  onOpenChange
}: MobileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className={cn(
          "w-[280px] sm:w-[320px] p-0",
          "safe-area-top safe-area-bottom",
          className
        )}
      >
        <nav className="h-full overflow-y-auto py-6 px-4">
          {children}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
