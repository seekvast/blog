"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewPostPage() {
  const { t } = useTranslation();
  const [value, setValue] = React.useState("**Hello world!!!**");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">发表文章</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline">保存草稿</Button>
          <Button>发布</Button>
        </div>
      </div>

      <div className="space-y-4">
        <Input className="text-lg" placeholder="输入标题..." />

        <div className="flex items-center space-x-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择看板" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">看板 1</SelectItem>
              <SelectItem value="2">看板 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">分类 1</SelectItem>
              <SelectItem value="2">分类 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div data-color-mode="light">
          <MDEditor
            value={value}
            onChange={(val) => setValue(val || "")}
            height={500}
          />
        </div>
      </div>
    </div>
  );
}
