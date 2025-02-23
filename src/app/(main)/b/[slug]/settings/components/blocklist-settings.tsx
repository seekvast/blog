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
import { Search } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlocklistSettingsProps {
  board: Board;
}

export function BlocklistSettings({ board }: BlocklistSettingsProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [adminFilter, setAdminFilter] = React.useState("all");
  const [timeFilter, setTimeFilter] = React.useState("all");

  return (
    <div className="space-y-4">
      {/* 顶部标题和搜索 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">封锁名单</h3>
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

      {/* 封锁列表 */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors gap-4"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">昵称</div>
                <div className="text-sm text-muted-foreground">
                  @218218121u21i
                </div>
                <div className="flex flex-col text-sm text-muted-foreground">
                  <div>状态：永久封锁</div>
                  <div className="line-clamp-1">
                    原因：频繁违规频繁违规频繁违规频繁违规频繁违规频繁违规
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 whitespace-nowrap"
              >
                撤销
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
