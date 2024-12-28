"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Bold, Italic, Link, List, ListOrdered, Image as ImageIcon } from "lucide-react"

import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function Editor() {
  const { theme } = useTheme()
  const [content, setContent] = React.useState("")
  const [showLinkDialog, setShowLinkDialog] = React.useState(false)
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const editorRef = React.useRef<HTMLDivElement>(null)

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-1">
        <Toggle
          size="sm"
          onClick={() => execCommand("bold")}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={() => execCommand("italic")}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Toggle
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          aria-label="Toggle numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Toggle size="sm" aria-label="Insert link">
              <Link className="h-4 w-4" />
            </Toggle>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>插入链接</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="link"
                  placeholder="https://"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      execCommand("createLink", e.currentTarget.value)
                      setShowLinkDialog(false)
                    }
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogTrigger asChild>
            <Toggle size="sm" aria-label="Insert image">
              <ImageIcon className="h-4 w-4" />
            </Toggle>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>插入图片</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="image"
                  placeholder="https://"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      execCommand("insertImage", e.currentTarget.value)
                      setShowImageDialog(false)
                    }
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus-visible:outline-none"
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
