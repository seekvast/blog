"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      {/* 头像设置 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>头像</Label>
            <p className="text-sm text-gray-500 mt-1">
              上傳或更改你的頭像，讓其他使用者更容易識別你。
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* 昵称设置 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>昵称</Label>
            <p className="text-sm text-gray-500 mt-1">
              更新你的昵称，让其他使用者更好地认识你。
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-sm cursor-pointer">
              编辑昵称
            </span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>

      {/* 账号设置 */}
      <div className="space-y-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>账号</Label>
            <p className="text-sm text-gray-500 mt-1">
              查看或修改你的账号名称，这是你在Kater上的唯一标识。
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-sm ">@username</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
