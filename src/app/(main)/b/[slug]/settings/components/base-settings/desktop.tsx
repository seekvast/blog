import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AvatarUpload, FormFields, SharedSettingsProps } from "./shared";

export function DesktopBaseSettings({
  form,
  isSubmitting,
  boardImage,
  isUploading,
  categories,
  handleImageUpload,
  handleImageClick,
  onSubmit,
}: SharedSettingsProps) {
  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 看板头像 */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <AvatarUpload
                boardImage={boardImage}
                isUploading={isUploading}
                handleImageClick={handleImageClick}
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
          <FormFields
            form={form}
            categories={categories}
            variant="desktop"
          />

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中..." : "保存设置"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
