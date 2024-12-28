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
    <aside className={cn("sticky top-14 flex-shrink-0", className)} {...props}>
      {/* 精品专题 */}
      <div className="">
        <h3 className="text-sm font-medium pb-2 px-2 border-b">精品专题</h3>
        <div className=" space-y-2 py-2 px-2">
          <Link href="#" className="block text-sm hover:text-primary">
            发点色图
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            老司机的操作
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            XXX交流
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            小阿喵思考lsajbsan爱上
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            阿喵思考会聊妳聊妳聊阿森纳说
          </Link>
        </div>

        <Button variant="outline" size="sm" className="my-2 w-full">更多专题</Button>
      </div>

      {/* 相关文章 */}
      <div className="">
        <div className="flex items-center justify-between py-2 px-2 border-b">
          <h3 className="text-sm font-medium">相关文章</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            换一换
          </Button>
        </div>
        <div className="space-y-2 py-2 px-2">
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
          <Link href="#" className="block text-sm hover:text-primary">
            T楼送碑名
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            煮了7個新米,新玩具
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            「郭家軍」被禁黑
          </Link>
          <Link href="#" className="block text-sm hover:text-primary">
            敏感羅莉娘性感精油按摩
          </Link>
        </div>
      </div>

      {/* 广告 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src="/ad.jpg"
          alt="Advertisement"
          fill
          className="object-cover"
        />
      </div>
    </aside>
  );
}
