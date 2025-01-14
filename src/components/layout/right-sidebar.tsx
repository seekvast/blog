"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RightSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RightSidebar({ className, ...props }: RightSidebarProps) {
  const { data: session } = useSession();

  return (
    <aside className={cn(className)} {...props}>
      {/* 精品专题 */}
      <div className="">
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
      </div>

      {/* 相关文章 */}
      <div className="mt-4">
        <div className="flex items-center justify-between border-b px-2">
          <h3 className="h-[40px] text-sm font-medium flex items-center">
            相关文章
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            换一换
          </Button>
        </div>
        <div className="space-y-2 p-2">
          <Link href="#" className="block text-sm hover:text-primary">
            最近翻译了，大家要小心不要
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            预览救命啊！公司服务器升级
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            北美性价比最高的杜甫
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            预览刚遇到一个怪事
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            不懂就问：美国商务部禁止
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            那扇局面已经控制不住了，
          </Link>
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
