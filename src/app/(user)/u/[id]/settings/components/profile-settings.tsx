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
  nickname: z
    .string()
    .min(1, "昵称不能为空")
    .max(16, "昵称最多16个字符")
    .regex(/^[^\s]+$/, "昵称不能包含空格"),
  avatar_url: z.string().max(500, "头像URL最多500个字符").optional(),
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
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isBgUploading, setIsBgUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar_url ?? null);
  const [bgImage, setBgImage] = useState<string | null>(
    user?.bg_image_url ?? null
  );
  const [birthday, setBirthday] = useState<string>(user?.birthday ?? "");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: user?.nickname ?? "",
      avatar_url: user?.avatar_url,
      gender: user?.gender,
      //   birthday: user?.birthday,
    },
  });

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleBgClick = () => {
    bgInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAvatarUploading(true);

    try {
      const data = await uploadFile(file, AttachmentType.USER_AVATAR);
      setAvatar(data.url);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "头像上传失败，请重试",
      });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBgUploading(true);

    try {
      const data = await uploadFile(file, AttachmentType.USER_BACKGROUND);
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
        bg_image_url: bgImage,
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
      <div className="py-3 border-b">
        <div>
          <Label>個人檔案</Label>
        </div>
        <div
          className="flex items-center justify-between gap-2 text-gray-500 "
          onClick={() => setOpen(true)}
        >
          <p className="text-sm text-gray-500 mt-1">
            更新你的個人資訊，讓其他使用者了解更多關於你的資料。
          </p>
          <ChevronRight className="h-4 w-4 cursor-pointer" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <div className="relative">
            {/* 背景图 */}
            <div className="h-[160px] sm:h-[200px] bg-gradient-to-b from-gray-100 to-gray-50 overflow-hidden relative">
              {bgImage && (
                <Image
                  src={bgImage}
                  alt="Background"
                  fill
                  className="object-cover"
                />
              )}
              {isBgUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-white"></div>
                </div>
              )}

              {/* 横幅内容布局 */}
              <div className="absolute inset-0 p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between">
                {/* 左侧：头像和用户信息 */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* 头像 */}
                  <div>
                    <div
                      onClick={handleAvatarClick}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white overflow-hidden relative cursor-pointer shadow-md ${
                        isAvatarUploading && "pointer-events-none"
                      }`}
                    >
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt="User avatar"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <div className="text-gray-400 text-2xl">+</div>
                        </div>
                      )}
                      {isAvatarUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-white"></div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  {/* 用户信息 */}
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-medium mb-1">
                      {user.nickname || user.username}
                    </h2>
                    <div className="text-xs sm:text-sm opacity-80 mb-1">
                      {user.nickname && <span>@{user.nickname}</span>} 加入于{" "}
                      {new Date(user.created_at).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 max-w-[250px] sm:max-w-[400px]">
                      {user.bio || "这个人很懒，什么都没写~"}
                    </p>
                  </div>
                </div>

                {/* 右侧：背景上传按钮 */}
                <button
                  onClick={handleBgClick}
                  className="absolute top-4 right-4 sm:static w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center shadow-sm"
                >
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </button>
              </div>

              <input
                type="file"
                ref={bgInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleBgUpload}
              />
            </div>
          </div>

          {/* 表单内容区域 */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 sm:p-8 space-y-6"
            >
              {/* 用户名 */}
              <div className="flex flex-col gap-2">
                <Label>用户名</Label>
                <Input value={user.username} />
              </div>

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
                        <SelectItem value="0">其他</SelectItem>
                        <SelectItem value="1">男</SelectItem>
                        <SelectItem value="2">女</SelectItem>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
