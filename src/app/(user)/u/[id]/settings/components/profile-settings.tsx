"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">基本资料</h2>
      </div>

      {/* 头像设置 */}
      <div className="space-y-4">
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
            <Button variant="outline" size="sm" className="text-sm">
              编辑头像
            </Button>
          </div>
        </div>
      </div>

      {/* 昵称设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>昵称</Label>
            <p className="text-sm text-gray-500 mt-1">
              更新你的昵称，让其他使用者更好地认识你。
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-sm">
            编辑昵称
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* 账号设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>账号</Label>
            <p className="text-sm text-gray-500 mt-1">
              查看或修改你的账号名称，这是你在Kater上的唯一标识。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">@username</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 密码设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>密码</Label>
            <p className="text-sm text-gray-500 mt-1">
              更新你的密码，以提升帐户安全性并保护你的个人资料。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600">修改密码</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 电子邮件设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>电子邮件</Label>
            <p className="text-sm text-gray-500 mt-1">
              更改你的电子邮件地址，以确保帐户安全并接收最新通知。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">user@example.com</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 年龄验证 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>年龄验证</Label>
            <p className="text-sm text-gray-500 mt-1">XXX</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600">去验证</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
