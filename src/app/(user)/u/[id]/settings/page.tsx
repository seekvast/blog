"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Languages,
  ChevronRight,
} from "lucide-react";

const settingsCards = [
  {
    title: "个人资料",
    description: "更新你的个人信息，让其他用户更好地了解你",
    href: "profile",
    icon: User,
  },
  {
    title: "账号安全",
    description: "管理你的密码和账号安全设置",
    href: "account",
    icon: Shield,
  },
  {
    title: "通知设置",
    description: "自定义你想要接收的通知类型",
    href: "notification",
    icon: Bell,
  },
  {
    title: "语言设置",
    description: "选择你偏好的界面语言",
    href: "language",
    icon: Languages,
  },
];

export default function SettingsPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
        <p className="text-sm text-muted-foreground">
          管理你的账号设置和偏好
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={`/u/${userId}/settings/${card.href}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h2 className="text-lg font-medium">{card.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
