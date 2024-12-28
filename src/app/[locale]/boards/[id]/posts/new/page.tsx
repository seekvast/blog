"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MarkdownEditor } from "@/components/editor/markdown-editor"

const BOARD_TAGS = [
  { id: "1", name: "OTA测试版" },
  { id: "2", name: "故事记" },
  { id: "3", name: "记忆迟年" },
  { id: "4", name: "充电攻略" },
  { id: "5", name: "NGP体验营" },
  { id: "6", name: "新能源" },
]

export default function NewPostPage() {
  const { t } = useTranslation()
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const handleImageUpload = async (file: File) => {
    // TODO: 实现图片上传逻辑
    return URL.createObjectURL(file)
  }

  const handleSubmit = async () => {
    // TODO: 处理发帖逻辑
    console.log({
      title,
      content,
      tags: selectedTags,
    })
  }

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // TODO: 处理退出逻辑
    }
  }

  React.useEffect(() => {
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                Kater
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="看板名称/目前板名字" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">看板1</SelectItem>
                  <SelectItem value="2">看板2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={handleSubmit}>
                投票
              </Button>
              <Button variant="outline" onClick={handleSubmit}>
                保存草稿箱
              </Button>
              <Button onClick={handleSubmit}>
                发布
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-screen-2xl pt-20">
        <div className="grid grid-cols-[1fr,300px] gap-6">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="请输入文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl"
            />
            
            <MarkdownEditor
              value={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
              className="min-h-[500px]"
            />
          </div>

          <div>
            <div className="sticky top-20 space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">子版</h3>
                <div className="flex flex-wrap gap-2">
                  {BOARD_TAGS.map((tag) => (
                    <Button
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="h-8"
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed left-1/2 top-4 -translate-x-1/2 rounded-lg bg-secondary px-4 py-2 text-sm">
        若要退出全屏模式，请按 <kbd className="rounded border px-1">esc</kbd>
      </div>
    </div>
  )
}
