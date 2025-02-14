"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      {/* 电子邮件设置 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>电子邮件</Label>
            <p className="text-sm text-gray-500 mt-1">
              更改你的电子邮件地址，以确保帐户安全并接收最新通知。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 cursor-pointer">
              user@example.com
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      {/* 密码设置 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>密码</Label>
            <p className="text-sm text-gray-500 mt-1">
              更新你的密码，以提升帐户安全性并保护你的个人资料。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 cursor-pointer">
              修改密码
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      {/* 性别 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>性别</Label>
            <p className="text-sm text-gray-500 mt-1">
              選擇你的性別，幫助我們更準確地了解你的興趣和偏好。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm cursor-pointer">男</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      {/* 生日 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>生日</Label>
            <p className="text-sm text-gray-500 mt-1">
              輸入你的生日，幫助我們更好地了解你的興趣和提供個性化內容。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm cursor-pointer">19991-1</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      {/* 年龄验证 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>年龄验证</Label>
            <p className="text-sm text-gray-500 mt-1">驗證你的年齡以存取特定內容</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 cursor-pointer">去验证</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      {/* 成人内容 */}
      <div className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Label>成人內容</Label>
            <p className="text-sm text-gray-500 mt-1">
              開啟後，可以自由選擇是否瀏覽成人文章與看板，並根據設定顯示相應的內容。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm cursor-pointer">開啟</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
