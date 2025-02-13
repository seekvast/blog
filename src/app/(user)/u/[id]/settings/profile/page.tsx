"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface ProfileFormValues {
  avatar: string;
  nickname: string;
  bio: string;
  email: string;
  emailNotifications: boolean;
}

export default function ProfilePage() {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      avatar: "",
      nickname: "",
      bio: "",
      email: "",
      emailNotifications: true,
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">个人资料</h3>
        <p className="text-sm text-muted-foreground">
          更新你的个人信息，让其他用户更好地了解你
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 头像上传 */}
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>头像</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={field.value} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      更换头像
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  点击更换头像按钮上传新的头像图片
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 昵称 */}
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>昵称</FormLabel>
                <FormControl>
                  <Input placeholder="输入你的昵称" {...field} />
                </FormControl>
                <FormDescription>
                  这是你在社区中显示的名称
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 个人简介 */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>个人简介</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="介绍一下你自己"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  简单介绍一下你自己，让其他用户更了解你
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 邮箱 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormDescription>
                  这是你的主要联系邮箱
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 邮件通知 */}
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    邮件通知
                  </FormLabel>
                  <FormDescription>
                    接收重要的邮件通知
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">保存更改</Button>
        </form>
      </Form>
    </div>
  );
}
