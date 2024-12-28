"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MainLayout } from "@/components/layouts/main-layout"
import { PostCard } from "@/components/post-card"

const VIEW_OPTIONS = [
  { value: "card", label: "view.imageText" },
  { value: "list", label: "view.textOnly" },
]

const SORT_OPTIONS = [
  { value: "latest", label: "sort.latest" },
  { value: "lastReply", label: "sort.lastReply" },
]

// 示例数据
const SAMPLE_BOOKMARKED_POSTS = [
  {
    id: "1",
    title: "值得收藏的编程资源整理",
    content: "整理了一些非常有用的编程学习资源和工具推荐...",
    image: "/placeholder.jpg",
    author: {
      name: "资源达人",
      avatar: "/avatar.jpg"
    },
    board: {
      name: "资源分享",
      icon: "/board-icon.jpg"
    },
    stats: {
      likes: 320,
      comments: 45,
      views: 1280
    },
    isRead: true,
    isPinned: false,
    hasVote: false,
    createdAt: "2024-12-27T18:20:00+08:00"
  },
  {
    id: "2",
    title: "提升工作效率的实用技巧",
    content: "分享一些在日常工作中提升效率的小技巧...",
    author: {
      name: "效率专家",
      avatar: "/avatar2.jpg"
    },
    board: {
      name: "职场技巧",
      icon: "/board-icon2.jpg"
    },
    stats: {
      likes: 156,
      comments: 28,
      views: 890
    },
    isRead: false,
    isPinned: false,
    hasVote: true,
    createdAt: "2024-12-26T14:45:00+08:00"
  }
]

export default function BookmarkedPage() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = React.useState("card")
  const [sortMode, setSortMode] = React.useState("latest")

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={sortMode} onValueChange={setSortMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("sort.latest")} />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("view.imageText")} />
              </SelectTrigger>
              <SelectContent>
                {VIEW_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_BOOKMARKED_POSTS.map((post) => (
            <PostCard
              key={post.id}
              mode={viewMode as "card" | "list"}
              {...post}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
