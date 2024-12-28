import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Board {
  id: number
  name: string
  avatar: string
  members: number
}

interface RecommendedBoardsProps {
  boards: Board[]
}

export function RecommendedBoards({ boards }: RecommendedBoardsProps) {
  return (
    <div className="space-y-2">
      {boards.map((board) => (
        <Button
          key={board.id}
          variant="ghost"
          className="w-full justify-start h-auto py-2"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={board.avatar} />
              <AvatarFallback>{board.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1 text-left">
              <p className="text-sm leading-none">{board.name}</p>
              <p className="text-xs text-muted-foreground">
                {board.members.toLocaleString()} 人加入
              </p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
