import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
  text?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

export function Loading({
  size = 'md',
  fullscreen = false,
  text,
  className,
  ...props
}: LoadingProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-2',
        className
      )}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
        {content}
      </div>
    )
  }

  return content
}
