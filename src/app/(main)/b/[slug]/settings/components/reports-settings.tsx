import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Board } from "@/types";
import { ChevronDown, Search } from "lucide-react";
import Image from "next/image";

interface ReportsSettingsProps {
  board: Board;
}

export function ReportsSettings({ board }: ReportsSettingsProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [adminFilter, setAdminFilter] = React.useState("all");
  const [timeFilter, setTimeFilter] = React.useState("all");

  return (
    <div className="space-y-4">
      {/* 顶部标题和搜索 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">检举内容</h3>
        <div className="relative w-60 rounded-full">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="依昵称或账号搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-muted/50 rounded-full"
          />
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-4">
        <Select value={adminFilter} onValueChange={setAdminFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="管理者筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部管理者</SelectItem>
            <SelectItem value="admin1">管理者1</SelectItem>
            <SelectItem value="admin2">管理者2</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="操作时间" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            <SelectItem value="today">今天</SelectItem>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 检举列表 */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-muted/50 rounded-lg overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4">
              <Image
                src="/placeholder-avatar.jpg"
                alt="Avatar"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">那些喜欢小女生的根本人渣==</h4>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  这是一篇介绍这是一篇介绍这是一篇介绍这是一篇介绍这是一篇介绍这是一篇介绍这是一篇介绍这是一篇介绍
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div>检举内容：包含成人内容</div>
                  <div>检举理由：留图不留种</div>
                  <div>检举时间：2022年10月10日 09:00</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/70">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-7">
                  处理
                </Button>
                <Button variant="secondary" size="sm" className="h-7">
                  撤销
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                查看检举人名单
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
