"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ThemeSettings() {
  const [theme, setTheme] = React.useState<"light" | "dark" | "auto">("auto");

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
          根據您的偏好，來調整顯示模式，讓您在任何時刻都能擁有最佳的瀏覽體驗。
      </div>

      <Select value={theme} onValueChange={(value: "light" | "dark" | "auto") => setTheme(value)}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="选择模式" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">自動</SelectItem>
          <SelectItem value="light">淺色</SelectItem>
          <SelectItem value="dark">深色</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
