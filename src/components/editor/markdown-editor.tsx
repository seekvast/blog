"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { type MDEditorProps } from "@uiw/react-md-editor"
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Quote, 
  Code, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  List, 
  ListOrdered, 
  AtSign,
  Hash,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps extends Omit<MDEditorProps, "onChange"> {
  onChange?: (value: string) => void
  onImageUpload?: (file: File) => Promise<string>
  className?: string
}

const commands = {
  h1: {
    name: "一级标题",
    keyCommand: "h1",
    buttonProps: { "aria-label": "插入一级标题" },
    icon: <span className="text-sm font-bold">H1</span>,
    execute: (state: any, api: any) => {
      const modifyContent = `# ${state.selectedText}\n`
      api.replaceSelection(modifyContent)
    },
  },
  h2: {
    name: "二级标题",
    keyCommand: "h2",
    buttonProps: { "aria-label": "插入二级标题" },
    icon: <span className="text-sm font-bold">H2</span>,
    execute: (state: any, api: any) => {
      const modifyContent = `## ${state.selectedText}\n`
      api.replaceSelection(modifyContent)
    },
  },
  h3: {
    name: "三级标题",
    keyCommand: "h3",
    buttonProps: { "aria-label": "插入三级标题" },
    icon: <span className="text-sm font-bold">H3</span>,
    execute: (state: any, api: any) => {
      const modifyContent = `### ${state.selectedText}\n`
      api.replaceSelection(modifyContent)
    },
  },
  bold: {
    name: "粗体",
    keyCommand: "bold",
    buttonProps: { "aria-label": "添加粗体文本" },
    icon: <Bold className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `**${state.selectedText}**`
      api.replaceSelection(modifyContent)
    },
  },
  italic: {
    name: "斜体",
    keyCommand: "italic",
    buttonProps: { "aria-label": "添加斜体文本" },
    icon: <Italic className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `_${state.selectedText}_`
      api.replaceSelection(modifyContent)
    },
  },
  strikethrough: {
    name: "删除线",
    keyCommand: "strikethrough",
    buttonProps: { "aria-label": "添加删除线" },
    icon: <Strikethrough className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `~~${state.selectedText}~~`
      api.replaceSelection(modifyContent)
    },
  },
  quote: {
    name: "引用",
    keyCommand: "quote",
    buttonProps: { "aria-label": "插入引用" },
    icon: <Quote className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `> ${state.selectedText}\n`
      api.replaceSelection(modifyContent)
    },
  },
  spoiler: {
    name: "黑幕",
    keyCommand: "spoiler",
    buttonProps: { "aria-label": "添加黑幕" },
    icon: <Eye className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `>!${state.selectedText}!<`
      api.replaceSelection(modifyContent)
    },
  },
  code: {
    name: "代码",
    keyCommand: "code",
    buttonProps: { "aria-label": "插入代码" },
    icon: <Code className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `\`${state.selectedText}\``
      api.replaceSelection(modifyContent)
    },
  },
  link: {
    name: "链接",
    keyCommand: "link",
    buttonProps: { "aria-label": "插入链接" },
    icon: <LinkIcon className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const url = state.selectedText.match(/^https?:\/\//) ? state.selectedText : ""
      const modifyContent = `[${state.selectedText}](${url})`
      api.replaceSelection(modifyContent)
    },
  },
  image: {
    name: "图片",
    keyCommand: "image",
    buttonProps: { "aria-label": "插入图片" },
    icon: <ImageIcon className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `![](${state.selectedText})`
      api.replaceSelection(modifyContent)
    },
  },
  unorderedList: {
    name: "无序列表",
    keyCommand: "unordered-list",
    buttonProps: { "aria-label": "插入无序列表" },
    icon: <List className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `- ${state.selectedText}\n`
      api.replaceSelection(modifyContent)
    },
  },
  orderedList: {
    name: "有序列表",
    keyCommand: "ordered-list",
    buttonProps: { "aria-label": "插入有序列表" },
    icon: <ListOrdered className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `1. ${state.selectedText}\n`
      api.replaceSelection(modifyContent)
    },
  },
  mention: {
    name: "提及",
    keyCommand: "mention",
    buttonProps: { "aria-label": "提及用户" },
    icon: <AtSign className="h-4 w-4" />,
    execute: (state: any, api: any) => {
      const modifyContent = `@${state.selectedText}`
      api.replaceSelection(modifyContent)
    },
  },
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  className,
  ...props
}: MarkdownEditorProps) {
  const handlePaste = React.useCallback(
    async (event: React.ClipboardEvent) => {
      if (!onImageUpload) return

      const items = event.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.indexOf("image") === 0) {
          event.preventDefault()
          const file = item.getAsFile()
          if (!file) continue

          try {
            const url = await onImageUpload(file)
            const imageMarkdown = `![](${url})\n`
            onChange?.(value ? value + imageMarkdown : imageMarkdown)
          } catch (error) {
            console.error("Failed to upload image:", error)
          }
        }
      }
    },
    [onImageUpload, onChange, value]
  )

  const handleDrop = React.useCallback(
    async (event: React.DragEvent) => {
      if (!onImageUpload) return

      event.preventDefault()
      const files = event.dataTransfer.files

      for (const file of Array.from(files)) {
        if (file.type.indexOf("image") === 0) {
          try {
            const url = await onImageUpload(file)
            const imageMarkdown = `![](${url})\n`
            onChange?.(value ? value + imageMarkdown : imageMarkdown)
          } catch (error) {
            console.error("Failed to upload image:", error)
          }
        }
      }
    },
    [onImageUpload, onChange, value]
  )

  // 自动检测并转换 URL
  const handleInput = React.useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      const target = event.target as HTMLTextAreaElement
      const value = target.value
      const lastWord = value.split(/\s/).pop()

      // 检测 URL
      if (lastWord && /^https?:\/\/\S+$/.test(lastWord)) {
        // 如果是 YouTube URL，转换为嵌入代码
        const youtubeRegex = /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
        const youtubeShortRegex = /https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/
        const youtubeMatch = lastWord.match(youtubeRegex) || lastWord.match(youtubeShortRegex)

        if (youtubeMatch) {
          const videoId = youtubeMatch[1]
          const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
          const newValue = value.replace(lastWord, embedCode)
          onChange?.(newValue)
        }
        // 如果是普通 URL，转换为链接
        else {
          const newValue = value.replace(lastWord, `[${lastWord}](${lastWord})`)
          onChange?.(newValue)
        }
      }
    },
    [onChange]
  )

  return (
    <div
      className={cn("markdown-editor", className)}
      onPaste={handlePaste}
      onDrop={handleDrop}
    >
      <div className="border-b p-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {Object.entries(commands).map(([key, command]) => (
            <React.Fragment key={key}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                {...command.buttonProps}
                onClick={() => command.execute({ selectedText: "" }, {})}
              >
                {command.icon}
              </Button>
              {["h3", "italic", "quote", "code", "image", "orderedList"].includes(key) && (
                <Separator orientation="vertical" className="mx-1 h-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <MDEditor
        value={value}
        onChange={(val) => onChange?.(val || "")}
        preview="edit"
        hideToolbar={true}
        className="min-h-[400px] border-0"
        textareaProps={{
          placeholder: "说点什么...",
          onInput: handleInput,
        }}
        {...props}
      />
    </div>
  )
}
