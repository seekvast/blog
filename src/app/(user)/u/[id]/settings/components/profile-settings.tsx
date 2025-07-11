"use client";

import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  Upload as UploadIcon,
  Trash as TrashIcon,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
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
import { useSession } from "next-auth/react";
import { useRequireAuth } from "@/hooks/use-require-auth";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(16, "用户名最多16个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  nickname: z
    .string()
    .min(1, "暱稱至少需要1個字符")
    .max(16, "暱稱最多16個字符")
    .regex(
      /^[^\s\u00A0\u2000-\u200B\u2028\u2029\u3000]+$/,
      "暱稱不能包含空白字符"
    ),
  avatar_url: z.string().max(500, "头像URL最多500个字符").nullable().optional(),
  cover: z.string().max(500, "头像URL最多500个字符").nullable().optional(),
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

  const { requireAuthAndEmailVerification } = useRequireAuth();

  const { data: session, update } = useSession();
  const queryClient = useQueryClient();

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
    console.log(values, "avatar_url");
    try {
      const updatedUser = await api.users.update({
        ...values,
        cover: bgImage,
      });

      setOpen(false);
      if (session?.user) {
        await update({
          user: {
            ...updatedUser,
          },
        });
      }
      //更新user缓存
      queryClient.setQueryData<User>(["user", user.hashid], (user) => {
        if (!user) return user;
        return {
          ...user,
          ...updatedUser,
        };
      });
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
          onClick={() => {
            requireAuthAndEmailVerification(() => {
              setOpen(true);
            });
          }}
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
                <div className="relative">
                  <AvatarUpload
                    url={user.avatar_url ?? null}
                    name={user.username || user.nickname}
                    attachmentType={AttachmentType.USER_AVATAR}
                    onUploadSuccess={(url) => {
                      setAvatar(url);
                      form.setValue("avatar_url", url);
                    }}
                    onRemove={() => {
                      setAvatar(null);
                      form.setValue("avatar_url", "");
                    }}
                    showDropdownMenu={true}
                    size="lg"
                  />
                </div>

                {/* 用户信息 */}
                <div className="flex flex-col justify-center text-white text-center sm:text-left ">
                  <h2 className="text-xl font-medium">
                    {user.nickname || user.username}
                  </h2>
                  <div className="text-xs sm:text-sm opacity-80">
                    {user.username && <span>@{user.username}</span>} 加入于{" "}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      disabled={isBgUploading}
                      className={`w-10 h-10 rounded-full ${
                        isBgUploading ? "opacity-50" : ""
                      } bg-white/30 transition-colors flex items-center justify-center shadow-sm hover:bg-white/40`}
                    >
                      <ImageIcon className="w-4 h-4 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleBgClick}
                      disabled={isBgUploading}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      <span>上传</span>
                    </DropdownMenuItem>
                    {bgImage && (
                      <DropdownMenuItem
                        onClick={() => {
                          setBgImage(null);
                          toast({ description: "背景图片已移除" });
                        }}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        <span>移除</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  onClick={form.handleSubmit(onSubmit)}
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
