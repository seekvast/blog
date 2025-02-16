"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Heart,
  MessageCircle,
  AtSign,
  Lock,
  AlertTriangle,
  BookmarkPlus,
  ThumbsUp,
} from "lucide-react";

export default function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* 自动关注 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">
              自动关注我回复的文章
            </Label>
          </div>
          <Switch />
        </div>

        {/* 当我的文章被下方推时 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">
              當我的文章被按下推/噓時
            </Label>
          </div>
          <Switch />
        </div>

        {/* 有人回覆我 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">有人回覆我</Label>
          </div>
          <Switch />
        </div>

        {/* 关注的文章有新回覆 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">關注的文章有新回覆</Label>
          </div>
          <Switch />
        </div>

        {/* 有人标注我 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <AtSign className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">有人標注我</Label>
          </div>
          <Switch />
        </div>

        {/* 文章被锁定 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">文章被鎖定</Label>
          </div>
          <Switch />
        </div>

        {/* 这反内容政策 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-500">违反內容政策</Label>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
