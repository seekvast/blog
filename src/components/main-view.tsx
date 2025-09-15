"use client";

import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PostEditorProvider } from "./providers/post-editor-provider";

export function MainView({ children }: { children: React.ReactNode }) {
  return (
    // <PostEditorProvider>
    <>
      <div className="container flex items-start mx-auto">
        <LeftSidebar className="sticky top-0 hidden lg:block lg:w-1/4 xl:w-1/5" />
        <main className="w-full lg:w-3/4 xl:w-3/5 lg:border-x">{children}</main>
        <RightSidebar className="sticky top-0 hidden xl:block xl:w-1/5" />
      </div>
      <MobileNav />
    </>
    // </PostEditorProvider>
  );
}
