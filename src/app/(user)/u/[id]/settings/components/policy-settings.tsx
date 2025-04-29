"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface PolicyItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

const policyItems: PolicyItem[] = [
  {
    id: "1",
    title: "服務條款",
    description:
      "查閱Kater的服務條款，了解我們提供的服務、使用規範及你的權利與義務。",
    href: "#",
  },
  {
    id: "2",
    title: "隱私權政策",
    description: "了解Kater如何收集、使用和保護你的個人資訊，保障你的隱私權。",
    href: "#",
  },
  {
    id: "3",
    title: "說明中心",
    description:
      "查閱常見問題、使用指南和幫助資源，快速解決你在Kater上的疑問。",
    href: "#",
  },
  {
    id: "4",
    title: "聯絡我們",
    description: "若有任何問題或建議，請隨時與我們聯繫，我們將為你提供幫助。",
    href: "#",
  },
];

export default function PolicySettings() {
  return (
    <div className="space-y-4">
      {policyItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className="group flex items-start justify-between py-4 border-b last:border-b-0"
        >
          <div className="space-y-1 flex-1">
            <div className="font-bold">{item.title}</div>
            <div className="text-sm">{item.description}</div>
          </div>
          <ArrowUpRight className="h-5 w-5 flex-shrink-0 mt-1" />
        </a>
      ))}
    </div>
  );
}
