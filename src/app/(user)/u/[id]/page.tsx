"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "回复",
    count: 22,
    href: "replies"
  },
  {
    label: "文章",
    count: 45,
    href: "posts"
  },
  {
    label: "帖子",
    count: 46,
    href: "threads"
  },
  {
    label: "黑名单",
    count: 41,
    href: "blacklist"
  },
  {
    label: "浏览记录",
    count: 41,
    href: "history"
  },
  {
    label: "浏览者和访问记录",
    count: 41,
    href: "visitors"
  }
];

interface PostCardProps {
  title: string;
  content: string;
  date: string;
  commentCount: number;
  likeCount: number;
}

function PostCard({ title, content, date, commentCount, likeCount }: PostCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium hover:text-primary cursor-pointer">
          {title}
        </h3>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <button className="hover:text-foreground">👍 {likeCount}</button>
        <button className="hover:text-foreground">💬 {commentCount}</button>
      </div>
    </Card>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.id as string;

  const mockPosts = [
    {
      title: "《代码与评判》",
      content: "论文是要写完的，但个性化的风格也是值得保留的。",
      date: "2024/04/11",
      commentCount: 5,
      likeCount: 12
    },
    {
      title: "《代码与评判》",
      content: "论文是要写完的，但个性化的风格也是值得保留的。",
      date: "2024/04/11",
      commentCount: 3,
      likeCount: 8
    },
    {
      title: "《代码与评判》",
      content: "论文是要写完的，但个性化的风格也是值得保留的。",
      date: "2024/04/11",
      commentCount: 7,
      likeCount: 15
    }
  ];

  return (
    <div className="py-8">
      <div className="flex gap-8">
        {/* 左侧导航 */}
        <div className="w-60 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/u/${userId}/${item.href}`}
                className={cn(
                  "flex items-center justify-between px-4 py-2 text-sm rounded-lg",
                  pathname === `/u/${userId}/${item.href}`
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{item.label}</span>
                <span>{item.count}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 space-y-4">
          {mockPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
