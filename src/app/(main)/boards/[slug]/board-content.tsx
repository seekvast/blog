'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { useBoardStore } from '@/store/board-detail'
import { useBoardChildrenStore } from '@/store/board-children'

export function BoardContent() {
  const { t } = useTranslation()
  const params = useParams()
  const slug = params.slug as string
  
  const {
    board,
    discussions,
    isLoading,
    isError,
    currentPage,
    totalPages,
    fetchBoard,
    fetchDiscussions,
    reset
  } = useBoardStore()

  const { items: boardChildren, fetchBoardChildren } = useBoardChildrenStore()

  useEffect(() => {
    fetchBoard(slug)
    fetchDiscussions(slug)
    fetchBoardChildren(slug)

    return () => {
      reset()
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (isError || !board) {
    return (
      <div className="text-center p-4">
        <p>{t('board.notFound')}</p>
      </div>
    )
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchDiscussions(slug, currentPage + 1)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={board.avatar} alt={board.name} />
            <AvatarFallback>{board.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{board.name}</h1>
            <p className="text-sm text-gray-600">{board.desc}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {boardChildren.map((child) => (
              <Badge
                key={child.id}
                variant={child.is_default ? 'default' : 'secondary'}
                className="cursor-pointer"
              >
                {child.name}
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm">
            {t('board.createPost')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id} className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={discussion.user.avatar_url} alt={discussion.user.username} />
                <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/discussions/${discussion.slug}`}
                    className="text-lg font-semibold hover:text-blue-500"
                  >
                    {discussion.title}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>{t('actions.report')}</DropdownMenuItem>
                      <DropdownMenuItem>{t('actions.share')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{discussion.user.username}</span>
                  <span>•</span>
                  <span>{discussion.diff_humans}</span>
                  {discussion.board_child && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        {discussion.board_child.name}
                      </Badge>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <Button variant="ghost" size="sm" className="space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{discussion.comment_count}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{discussion.votes}</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {currentPage < totalPages && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleLoadMore}
            aria-label={t('actions.loadMore')}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            {t('actions.loadMore')}
          </Button>
        )}
      </div>
    </div>
  )
}
