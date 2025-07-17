"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface RightSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RightSidebar({ className, ...props }: RightSidebarProps) {
  const { data: randomDiscussions, refetch: refetchRandomDiscussions } =
    useQuery({
      queryKey: ["random-discussions"],
      queryFn: () => api.discussions.getRandom(),
    });

  return (
    <aside className={cn(className)} {...props}>
      {/* 精品专题 */}
      {/* <div className="">
        <div className="border-b px-2">
          <h3 className="h-[40px] text-sm font-medium flex items-center">
            精品专题
          </h3>
        </div>
        <div className="space-y-2 p-2">
          <Link href="#" className="block text-sm hover:text-primary">
            小阿喵思考lsajbsan爱上
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            阿喵思考会聊妳聊妳聊阿森纳说
          </Link>
        </div>

        <Link
          href="#"
          className="my-2 w-full block text-sm hover:text-primary text-muted-foreground px-2"
        >
          <Button className="rounded-full w-full" size="sm" variant="outline">
            更多专题
          </Button>
        </Link>
      </div> */}

      {/* 相关文章 */}
      <div className="">
        <div className="flex items-center justify-between border-b px-2">
          <h3 className="h-[40px] text-sm font-medium flex items-center">
            相关文章
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
            onClick={() => refetchRandomDiscussions()}
          >
            换一换
          </Button>
        </div>
        <div className="space-y-2 p-2">
          {randomDiscussions?.map((discussion) => (
            <Link
              key={discussion.slug}
              href={`/d/${discussion.slug}?board_id=${discussion.board_id}`}
              className="block text-sm hover:text-primary line-clamp-1"
            >
              {discussion.title}
            </Link>
          ))}
        </div>
      </div>

      {/* 广告 */}
      {/* <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src="/ad.jpg"
          alt="Advertisement"
          fill
          className="object-cover"
        />
      </div> */}
    </aside>
  );
}
