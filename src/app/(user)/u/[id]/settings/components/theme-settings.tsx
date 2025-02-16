"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        根據您的偏好，來調整顯示模式，讓您在任何時刻都能擁有最佳的瀏覽體驗。
      </div>

      <Select
        value={theme}
        onValueChange={setTheme}
      >
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="选择模式">
            {theme === "light" && "淺色"}
            {theme === "dark" && "深色"}
            {theme === "system" && "自動"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">自動</SelectItem>
          <SelectItem value="light">淺色</SelectItem>
          <SelectItem value="dark">深色</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
