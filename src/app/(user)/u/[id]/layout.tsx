"use client";

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div>
      {/* 顶部用户信息区 */}
      <div className="w-full bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-semibold">Ronald Richards</h1>
                  <span className="text-sm text-muted-foreground">@Richards</span>
                </div>
                <p className="text-muted-foreground">加入时间：2024年1月11日</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/u/${userId}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="mx-auto max-w-7xl px-4 -mt-10">
        {children}
      </div>
    </div>
  );
}
