import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageSquare, ThumbsUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePostStore } from '@/store'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const updatePost = usePostStore(state => state.updatePost)

  const handleLike = async () => {
    await updatePost(post.id, {
      likes: post.likes + 1
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center space-x-4 space-y-0">
        <Avatar>
          <AvatarImage src={post.author.avatar} alt={post.author.username} />
          <AvatarFallback>{post.author.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link
            href={`/users/${post.author.id}`}
            className="text-sm font-semibold hover:underline"
          >
            {post.author.username}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: zhCN
            })}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <Link href={`/posts/${post.id}`}>
          <h3 className="text-xl font-semibold hover:text-primary">
            {post.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-3 text-muted-foreground">
          {post.content}
        </p>
      </CardContent>
      
      <CardFooter>
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="space-x-1"
            onClick={handleLike}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="space-x-1" asChild>
            <Link href={`/posts/${post.id}#comments`}>
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center space-x-4 space-y-0">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
      
      <CardFooter>
        <div className="flex space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardFooter>
    </Card>
  )
}
