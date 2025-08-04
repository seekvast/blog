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

export default function LanguageSettings() {
  const [theme, setTheme] = React.useState<"light" | "dark" | "auto">("auto");

  return (
    <div className="">
      <Select
        value={theme}
        onValueChange={(value: "light" | "dark" | "auto") => setTheme(value)}
      >
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="选择语言" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">跟随系统</SelectItem>
          <SelectItem value="light">中文</SelectItem>
          <SelectItem value="dark">英文</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
