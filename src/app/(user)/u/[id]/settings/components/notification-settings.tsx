"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Heart,
  MessageCircle,
  AtSign,
  Lock,
  AlertTriangle,
  BookmarkPlus,
  ThumbsUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User } from "@/types/user";
import { useRequireAuth } from "@/hooks/use-require-auth";

type NotifyPreferences = {
  discloseOnline: string;
  autoFollow: string;
  nsfwVisible: string;
  notify_voted: string;
  notify_reply: string;
  notify_newPost: string;
  notify_userMentioned: string;
  notify_discussionLocked: string;
  notify_report: string;
};

export default function NotificationSettings({ user }: { user: User | null }) {
  const { requireAuthAndEmailVerification } = useRequireAuth();
  const [settings, setSettings] = useState<NotifyPreferences | undefined>(
    user?.preferences
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    setSettings(user?.preferences);
  }, [user?.preferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (key: NotifyPreferences) => {
      return api.users.savePreferences({ preferences: key });
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ["user", user?.hashid] });

      // 保存之前的设置
      const previousSettings = queryClient.getQueryData<User>([
        "user",
        user?.hashid,
      ]);

      // 乐观地更新 settings 状态
      setSettings(newSettings);

      // 乐观地更新 user query cache
      queryClient.setQueryData<User>(["user", user?.hashid], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          preferences: newSettings,
        };
      });

      // 返回之前的设置以便回滚
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // 如果请求失败，回滚到之前的设置
      if (context?.previousSettings) {
        setSettings(context.previousSettings.preferences);
        queryClient.setQueryData(
          ["user", user?.hashid],
          context.previousSettings
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.hashid] });
    },
  });

  const handleToggle = (key: keyof NotifyPreferences) => {
    if (!settings) return;
    requireAuthAndEmailVerification(() => {
      const toggle = {
        ...settings,
        [key]: settings[key] === "yes" ? "no" : "yes",
      };

      updatePreferencesMutation.mutate(toggle);
    });
  };

  return (
    <div className="">
      {/* 自动关注我回复的文章 */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <BookmarkPlus className="w-4 h-4" />
          <Label className="text-sm ">自动关注我回复的文章</Label>
        </div>
        <Switch
          checked={settings?.autoFollow === "yes"}
          onCheckedChange={() => handleToggle("autoFollow")}
        />
      </div>

      {/* 当我的文章被下方推时 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 " />
          <Label className="text-sm ">當我的文章被按下推/噓時</Label>
        </div>
        <Switch
          checked={settings?.notify_voted === "yes"}
          onCheckedChange={() => handleToggle("notify_voted")}
        />
      </div>

      {/* 有人回覆我 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 " />
          <Label className="text-sm ">有人回覆我</Label>
        </div>
        <Switch
          checked={settings?.notify_reply === "yes"}
          onCheckedChange={() => handleToggle("notify_reply")}
        />
      </div>

      {/* 关注的文章有新回覆 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 " />
          <Label className="text-sm ">關注的文章有新回覆</Label>
        </div>
        <Switch
          checked={settings?.notify_newPost === "yes"}
          onCheckedChange={() => handleToggle("notify_newPost")}
        />
      </div>

      {/* 有人标注我 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-2">
          <AtSign className="w-4 h-4 " />
          <Label className="text-sm ">有人標注我</Label>
        </div>
        <Switch
          checked={settings?.notify_userMentioned === "yes"}
          onCheckedChange={() => handleToggle("notify_userMentioned")}
        />
      </div>

      {/* 文章被锁定 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 " />
          <Label className="text-sm ">文章被鎖定</Label>
        </div>
        <Switch
          checked={settings?.notify_discussionLocked === "yes"}
          onCheckedChange={() => handleToggle("notify_discussionLocked")}
        />
      </div>

      {/* 这反内容政策 */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 " />
          <Label className="text-sm ">违反內容政策</Label>
        </div>
        <Switch
          checked={settings?.notify_report === "yes"}
          onCheckedChange={() => handleToggle("notify_report")}
        />
      </div>
    </div>
  );
}
