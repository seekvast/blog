import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">页面未找到</h1>
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被移除。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            返回上页
          </Button>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
