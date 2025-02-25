import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/common/avatar-upload";
import { AttachmentType } from "@/constants/attachment-type";
import { FormFields, SharedSettingsProps } from "./shared";

export function MobileBaseSettings({
  form,
  isSubmitting,
  boardAvatar,
  categories,
  onSubmit,
}: SharedSettingsProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-medium">設定</h1>
      </div>

      {/* 主要内容 */}
      <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 头像上传 */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <AvatarUpload
                  url={boardAvatar}
                  name={form.getValues("name")}
                  size="sm"
                  attachmentType={AttachmentType.BOARD_AVATAR}
                  onUploadSuccess={(url) => {
                    form.setValue("avatar", url);
                  }}
                />
                <div>
                  <div className="font-medium">看板头像</div>
                  <div className="text-sm text-muted-foreground">
                    点击更换看板头像
                  </div>
                </div>
              </div>
            </div>

            {/* 表单字段 */}
            <FormFields form={form} categories={categories} variant="mobile" />

            {/* 提交按钮 */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存设置"}
            </Button>
          </form>
        </Form>
      </>
    </div>
  );
}
