"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  User,
  Settings,
  Bell,
  Shield,
  Languages,
  ChevronLeft,
} from "lucide-react";

const settingsNavItems = [
  {
    title: "个人资料",
    href: "profile",
    icon: User,
  },
  {
    title: "账号安全",
    href: "account",
    icon: Shield,
  },
  {
    title: "通知设置",
    href: "notification",
    icon: Bell,
  },
  {
    title: "语言设置",
    href: "language",
    icon: Languages,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.id as string;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 移动端返回按钮 */}
      <div className="lg:hidden mb-4">
        <Link
          href={`/u/${userId}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          返回个人主页
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 侧边导航 */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsNavItems.map((item) => {
              const href = `/u/${userId}/settings/${item.href}`;
              const isActive = pathname === href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-lg",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
