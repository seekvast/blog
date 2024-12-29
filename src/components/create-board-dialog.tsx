"use client"

import * as React from "react"
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateBoardDialogProps {
  trigger?: React.ReactNode
}

export function CreateBoardDialog({ trigger }: CreateBoardDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [preview, setPreview] = React.useState<string>()
  const [agreed, setAgreed] = React.useState(false)

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 处理表单提交
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>建立看板</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>建立看板</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>看板头像</Label>
            <div className="flex justify-center">
              <FileUpload
                preview={preview}
                onFileSelect={handleFileSelect}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              照片上传规格要求：格式为JPG、JPEG、GIF或者png，大小2MB以内。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">看板名称</Label>
            <Input
              id="name"
              placeholder="最长15个中文字或相同长度英文字"
              maxLength={15}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">看板网址</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">https://kater.me/community/</span>
              <Input
                id="url"
                placeholder="xxx"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">看板简介</Label>
            <Textarea
              id="description"
              placeholder="请输入看板简介"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>看板被搜寻</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="选择公开范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">公开</SelectItem>
                <SelectItem value="private">私密</SelectItem>
                <SelectItem value="unlisted">不公开</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>看板类型</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="选择看板类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">综合</SelectItem>
                  <SelectItem value="tech">科技</SelectItem>
                  <SelectItem value="life">生活</SelectItem>
                  <SelectItem value="game">游戏</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>讨论类型</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="选择讨论类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文字</SelectItem>
                  <SelectItem value="image">图片</SelectItem>
                  <SelectItem value="link">链接</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked: boolean) => setAgreed(checked)}
              required
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              建立看板的同时，代表您已同意
              <a href="#" className="text-primary hover:underline">
                《内容政策》
              </a>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={!agreed}>
            建立看板
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
