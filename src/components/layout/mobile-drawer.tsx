"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileDrawer({ children, className }: MobileDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed left-4 top-2 lg:hidden z-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
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
