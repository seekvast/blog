"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// 模拟子版数据
const BOARDS = [
  { id: 1, name: "OTA测试室", icon: "#" },
  { id: 2, name: "故事记", icon: "#" },
  { id: 3, name: "记忆迷宫", icon: "#" },
  { id: 4, name: "记忆迷宫", icon: "#" },
  { id: 5, name: "充电攻略", icon: "#" },
  { id: 6, name: "NGP体验营", icon: "#" },
  { id: 7, name: "新能源", icon: "#" },
  { id: 8, name: "记忆迷宫", icon: "#" },
  { id: 9, name: "充电攻略", icon: "#" },
  { id: 10, name: "充电攻略", icon: "#" },
  { id: 11, name: "充电攻略", icon: "#" },
  { id: 12, name: "充电攻略", icon: "#" },
  { id: 13, name: "充电攻略", icon: "#" },
]

export default function NewDiscussionPage() {
  const [content, setContent] = React.useState("")
  const [title, setTitle] = React.useState("")

  const handleImageUpload = React.useCallback(async (file: File) => {
    // 这里实现图片上传逻辑
    return Promise.resolve("")
  }, [])

  const handlePublish = React.useCallback(() => {
    // 处理发布逻辑
    console.log({ title, content })
  }, [title, content])

  const handleSaveDraft = React.useCallback(() => {
    // 处理保存草稿逻辑
    console.log("Save draft", { title, content })
  }, [title, content])

  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-[808px] items-center justify-between px-6 py-4">
        <h1 className="text-lg font-medium">发布文章</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            保存草稿箱
          </Button>
          <Button size="sm" onClick={handlePublish}>
            发布
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-[808px] px-6">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {BOARDS.map((board) => (
              <Badge
                key={board.id}
                variant="secondary"
                className="flex items-center space-x-1 rounded-full px-3 py-1"
              >
                <span>{board.icon}</span>
                <span>{board.name}</span>
              </Badge>
            ))}
          </div>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题"
          className="mb-4 border-0 px-0 text-lg placeholder:text-gray-400 focus-visible:ring-0"
        />

        <MarkdownEditor
          value={content}
          onChange={setContent}
          onImageUpload={handleImageUpload}
          className="rounded-lg border"
        />
      </main>
    </div>
  )
}
