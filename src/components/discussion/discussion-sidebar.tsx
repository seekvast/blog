import { Button } from "@/components/ui/button";
import { ChevronDown, Star, Bookmark, ChevronUp, ChevronFirst, ChevronLast } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscussionSidebarProps {
  className?: string;
}

export function DiscussionSidebar({ className }: DiscussionSidebarProps) {
  return (
    <div className={cn("flex w-full flex-col space-y-3", className)}>
      {/* 回复按钮 */}
      <Button className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90">
        回复
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* 关注按钮 */}
      <Button variant="secondary" className="w-full justify-between">
        <div className="flex items-center">
          <Star className="mr-2 h-4 w-4" />
          关注
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* 书签按钮 */}
      <Button variant="secondary" className="w-full justify-between">
        <div className="flex items-center">
          <Bookmark className="mr-2 h-4 w-4" />
          书签
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* 最早文章 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ChevronFirst className="h-4 w-4" />
          <span>最早文章</span>
        </div>
        <div className="text-sm">
          <div>1/15 日</div>
          <div className="text-muted-foreground">十一月 2022</div>
          <div className="mt-2">14 未读</div>
        </div>
      </div>

      {/* 最后回复 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ChevronLast className="h-4 w-4" />
          <span>最后回复</span>
        </div>
      </div>

      {/* 广告区域 */}
      {/* <div className="relative mt-4 overflow-hidden rounded-lg">
        <img
          src="/images/ad-placeholder.jpg"
          alt="Advertisement"
          className="w-full object-cover"
        />
        <div className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
          广告
        </div>
      </div> */}
    </div>
  );
}
