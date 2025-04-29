"use client";

import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { AttachmentType } from "@/constants/attachment-type";
import { uploadFile } from "@/lib/utils/upload";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { AvatarUpload } from "@/components/common/avatar-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon } from "lucide-react";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(16, "用户名最多16个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  nickname: z
    .string()
    .min(1, "昵称不能为空")
    .max(16, "昵称最多16个字符")
    .regex(/^[^\s]+$/, "昵称不能包含空格"),
  avatar_url: z.string().max(500, "头像URL最多500个字符").optional(),
  cover: z.string().max(500, "头像URL最多500个字符").optional(),
  gender: z.number().optional(),
  //   birthday: z.string().optional(),
});

export default function ProfileSettings({ user }: { user: User | null }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading user data...</div>
      </div>
    );
  }

  const [open, setOpen] = useState(false);
  const [isBgUploading, setIsBgUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar_url ?? null);
  const [bgImage, setBgImage] = useState<string | null>(user?.cover ?? null);
  const [birthday, setBirthday] = useState<string>(user?.birthday ?? "");
  const bgInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username ?? "",
      nickname: user?.nickname ?? "",
      avatar_url: user?.avatar_url,
      gender: user?.gender,
      //   birthday: user?.birthday,
    },
  });

  const handleBgClick = () => {
    bgInputRef.current?.click();
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBgUploading(true);

    try {
      const data = await uploadFile(file, AttachmentType.USER_PROFILE);
      setBgImage(data.url);
    } catch (error) {
      console.error("Error uploading background:", error);
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "背景图上传失败，请重试",
      });
    } finally {
      setIsBgUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await api.users.update({
        ...values,
        avatar_url: avatar ?? values.avatar_url,
        cover: bgImage,
      });
      toast({
        title: "更新成功",
        description: "个人资料已更新",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error?.message || "请稍后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 個人檔案 */}
      <div className="py-1 border-b">
        <div>
          <Label>個人檔案</Label>
        </div>
        <div
          className="flex items-center justify-between gap-2"
          onClick={() => setOpen(true)}
        >
          <p className="text-sm my-1">
            更新你的個人資訊，讓其他使用者了解更多關於你的資料。
          </p>
          <div className="flex items-center">
            <span className="text-sm cursor-pointer">@{user.username}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-3">
            <DialogTitle className="text-xl font-semibold">
              个人资料
            </DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "flex flex-col",
              !bgImage && "bg-black bg-opacity-30"
            )}
          >
            {/* 背景图 */}
            <div className="flex justify-between flex-row  px-4 overflow-hidden h-[200px] relative">
              {bgImage && (
                <div className="absolute inset-0 -z-10">
                  <Image
                    src={bgImage}
                    alt="Background"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {isBgUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500"></div>
                </div>
              )}

              {/* 左侧：头像和用户信息 */}
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <AvatarUpload
                  url={user.avatar_url ?? null}
                  name={user.username}
                  attachmentType={AttachmentType.USER_AVATAR}
                  onUploadSuccess={(url) => {
                    setAvatar(url);
                  }}
                />

                {/* 用户信息 */}
                <div className="flex flex-col justify-center text-white text-center sm:text-left ">
                  <h2 className="text-xl font-medium">
                    {user.nickname || user.username}
                  </h2>
                  <div className="text-xs sm:text-sm opacity-80">
                    {user.nickname && <span>@{user.nickname}</span>} 加入于{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "未知"}
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 max-w-[250px] sm:max-w-[400px]">
                    {user.bio || "这个人很懒，什么都没写~"}
                  </p>
                </div>
              </div>

              {/* 右侧：背景上传按钮 */}
              <div className="flex flex-col justify-center items-center z-10">
                <button
                  onClick={handleBgClick}
                  disabled={isBgUploading}
                  className={`w-10 h-10 rounded-full ${
                    isBgUploading ? "opacity-50" : ""
                  } bg-white/30 transition-colors flex items-center justify-center shadow-sm`}
                >
                  <ImageIcon className="w-4 h-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={bgInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleBgUpload}
                />
              </div>
            </div>
          </div>

          {/* 表单内容区域 */}
          <div className="p-4 sm:p-8 space-y-6">
            <Form {...form}>
              {/* 用户名 */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入用户名" />
                    </FormControl>
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
                      <Input {...field} placeholder="请输入昵称" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 性别 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">男</SelectItem>
                        <SelectItem value="2">女</SelectItem>
                        <SelectItem value="0">其他</SelectItem>
                        <SelectItem value="3">不愿透露</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    const values = form.getValues();
                    onSubmit(values);
                  }}
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
