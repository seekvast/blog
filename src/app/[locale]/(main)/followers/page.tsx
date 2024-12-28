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
  { value: "hot", label: "sort.hot" },
  { value: "latest", label: "sort.latest" },
  { value: "lastReply", label: "sort.lastReply" },
]

// 示例数据
const SAMPLE_FOLLOWED_POSTS = [
  {
    id: "1",
    title: "分享我的新设备使用体验",
    content: "最近入手了一台新设备，使用一周后来分享一下体验...",
    image: "/placeholder.jpg",
    author: {
      name: "数码达人",
      avatar: "/avatar.jpg"
    },
    board: {
      name: "数码评测",
      icon: "/board-icon.jpg"
    },
    stats: {
      likes: 86,
      comments: 24,
      views: 752
    },
    isRead: false,
    isPinned: false,
    hasVote: true,
    createdAt: "2024-12-28T01:30:00+08:00"
  },
  {
    id: "2",
    title: "摄影技巧分享",
    content: "今天给大家分享一些实用的摄影构图技巧...",
    image: "/placeholder2.jpg",
    author: {
      name: "摄影师小李",
      avatar: "/avatar2.jpg"
    },
    board: {
      name: "摄影技术",
      icon: "/board-icon2.jpg"
    },
    stats: {
      likes: 124,
      comments: 38,
      views: 960
    },
    isRead: true,
    isPinned: false,
    hasVote: false,
    createdAt: "2024-12-27T22:15:00+08:00"
  }
]

export default function FollowersPage() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = React.useState("card")
  const [sortMode, setSortMode] = React.useState("hot")

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={sortMode} onValueChange={setSortMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("sort.hot")} />
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
          {SAMPLE_FOLLOWED_POSTS.map((post) => (
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
