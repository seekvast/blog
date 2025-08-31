import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Star,
  Bookmark,
  ChevronUp,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface DiscussionSidebarProps {
  className?: string;
}

export function DiscussionSidebar({ className }: DiscussionSidebarProps) {
  const { requireAuth, requireAuthAndEmailVerification } = useRequireAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const slug = params?.slug as string;

  // 关注讨论 mutation
  const followMutation = useMutation({
    mutationFn: (action: string | null) =>
      api.discussions.saveFollow({
        slug: slug,
        action,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion", slug] });
      toast({
        title: "操作成功",
        description: "讨论关注状态已更新",
      });
    },
    onError: (error) => {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "default",
      });
    },
  });

  // 书签 mutation
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      api.discussions.saveBookmark({
        slug: slug,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion", slug] });
      toast({
        title: "操作成功",
        description: "书签状态已更新",
      });
    },
    onError: (error) => {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "default",
      });
    },
  });

  const handleFollowDiscussion = () => {
    requireAuthAndEmailVerification(() => {
      followMutation.mutate("follow");
    });
  };

  const handleBookmarkDiscussion = () => {
    requireAuthAndEmailVerification(() => {
      bookmarkMutation.mutate();
    });
  };

  return (
    <div className={cn("flex w-full flex-col space-y-3", className)}>
      {/* 回复按钮 */}
      {/* <Button className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90">
        回复
      </Button> */}

      {/* 关注按钮 */}
      <Button
        variant="secondary"
        className="w-full justify-between"
        onClick={handleFollowDiscussion}
        disabled={followMutation.isPending}
      >
        <div className="flex items-center">
          <Star className="mr-2 h-4 w-4" />
          {followMutation.isPending ? "处理中..." : "关注"}
        </div>
        {/* <ChevronDown className="h-4 w-4" /> */}
      </Button>

      {/* 书签按钮 */}
      <Button
        variant="secondary"
        className="w-full justify-between"
        onClick={handleBookmarkDiscussion}
        disabled={bookmarkMutation.isPending}
      >
        <div className="flex items-center">
          <Bookmark className="mr-2 h-4 w-4" />
          {bookmarkMutation.isPending ? "处理中..." : "书签"}
        </div>
        {/* <ChevronDown className="h-4 w-4" /> */}
      </Button>

      {/* 最早文章 */}
      {/* <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ChevronFirst className="h-4 w-4" />
          <span>最早文章</span>
        </div>
        <div className="text-sm">
          <div>1/15 日</div>
          <div className="text-muted-foreground">十一月 2022</div>
          <div className="mt-2">14 未读</div>
        </div>
      </div> */}

      {/* 最后回复 */}
      {/* <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ChevronLast className="h-4 w-4" />
          <span>最后回复</span>
        </div>
      </div> */}

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
