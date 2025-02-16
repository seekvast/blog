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

export default function ProfileSettings() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
          <div className="grid gap-6 py-4">
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

            {/* 昵称 */}
            <div className="flex flex-col gap-2">
              <Label>昵称</Label>
              <Input placeholder="请输入昵称" />
            </div>

            {/* 账号 */}
            <div className="flex flex-col gap-2">
              <Label>账号</Label>
              <Input value="@username" disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground">
                账号是你的唯一标识，创建后不可修改
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setOpen(false)}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
