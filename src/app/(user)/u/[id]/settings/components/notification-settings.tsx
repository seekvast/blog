"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* 自动关注 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="space-y-0.5">
            <Label className="text-sm text-gray-500">自动关注我回复的文章</Label>
          </div>
          <Switch />
        </div>

        {/* 这是状态模式 */}
        {/* <div className="flex items-center gap-2 py-3">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <div className="w-4 h-4 rounded-full bg-gray-200" />
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <div className="text-sm text-gray-500">这是状态模式</div>
        </div> */}

        {/* 当我的文章被下方推时 */}
        <div className="flex items-center justify-between py-3 border-b">
          <Label className="text-sm text-gray-500">當我的文章被下方推時</Label>
          <Switch />
        </div>

        {/* 有人回覆我 */}
        <div className="flex items-center justify-between py-3 border-b">
          <Label className="text-sm text-gray-500">有人回覆我</Label>
          <Switch />
        </div>

        {/* 关注的文章有新回覆 */}
        <div className="flex items-center justify-between py-3 border-b">
          <Label className="text-sm text-gray-500">關注的文章有新回覆</Label>
          <Switch />
        </div>

        {/* 有人标注我 */}
        <div className="flex items-center justify-between py-3 border-b">
          <Label className="text-sm text-gray-500">有人標注我</Label>
          <Switch />
        </div>

        {/* 文章被锁定 */}
        <div className="flex items-center justify-between py-3 border-b">
          <Label className="text-sm text-gray-500">文章被鎖定</Label>
          <Switch />
        </div>

        {/* 这反内容政策 */}
        <div className="flex items-center justify-between py-3 border-b">
          <Label className="text-sm text-gray-500">违反內容政策</Label>
          <Switch />
        </div>
      </div>
    </div>
  );
}
