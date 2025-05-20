import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SharedSettingsProps } from "./shared/types";
import { FormFields } from "./shared/form-fields";
import { AvatarUpload } from "@/components/common/avatar-upload";
import { AttachmentType } from "@/constants/attachment-type";

export function MobileBaseSettings({
  form,
  isSubmitting,
  categories,
  onSubmit,
}: SharedSettingsProps) {
  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 看板头像 */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <AvatarUpload
                url={form.watch("avatar") ?? null}
                name={form.watch("name")}
                onRemove={() => form.setValue("avatar", "")}
                showDropdownMenu={true}
                size="sm"
                attachmentType={AttachmentType.BOARD_AVATAR}
                onUploadSuccess={(url) => {
                  form.setValue("avatar", url, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
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
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "保存中..." : "保存设置"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
