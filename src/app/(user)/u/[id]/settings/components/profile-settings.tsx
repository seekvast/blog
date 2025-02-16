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
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar_url ?? null);
  const [birthday, setBirthday] = useState<string>(user?.birthday ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const data = await uploadFile(file, AttachmentType.USER_AVATAR);
      setAvatar(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "图片上传失败，请重试",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await api.users.update({
        ...values,
        avatar_url: avatar ?? values.avatar_url,
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>修改个人资料</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 头像 */}
              <div className="flex flex-col gap-2">
                <Label>头像</Label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={handleImageClick}
                    className={`w-20 h-20 rounded-full bg-gray-100 overflow-hidden relative cursor-pointer group ${
                      isUploading && "pointer-events-none"
                    }`}
                  >
                    {avatar ? (
                      <>
                        <Image
                          src={avatar}
                          alt="User avatar"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-white text-2xl mb-1">+</div>
                          <div className="text-white text-xs">点击更换</div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-2xl mb-1">+</div>
                        <div className="text-gray-400 text-xs">点击更换</div>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-white"></div>
                        <div className="text-white text-xs mt-2">上传中...</div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* 用户名 */}
              <div className="flex flex-col gap-2">
                <Label>用户名</Label>
                <Input value={user.username} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">
                  用户名是你的唯一标识，创建后不可修改
                </p>
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

              {/* 生日 */}
              {/* <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>生日</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={birthday}
                        onChange={(e) => {
                          field.onChange(e);
                          setBirthday(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

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
