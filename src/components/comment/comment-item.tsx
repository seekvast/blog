import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { useCommentStore, useAuthStore, selectUser } from '@/store'
import type { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const currentUser = useAuthStore(selectUser)
  const updateComment = useCommentStore(state => state.updateComment)
  const deleteComment = useCommentStore(state => state.deleteComment)

  const isOwner = currentUser?.id === comment.author.id

  const handleUpdate = async () => {
    if (content === comment.content) {
      setIsEditing(false)
      return
    }

    await updateComment(comment.id, content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这条评论吗？')) {
      await deleteComment(comment.id)
    }
  }

  return (
    <div className="flex space-x-4 p-4">
      <Avatar>
        <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
        <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{comment.author.username}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhCN
              })}
            </span>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button size="sm" onClick={handleUpdate}>
                保存
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{comment.content}</p>
        )}
      </div>
    </div>
  )
}
