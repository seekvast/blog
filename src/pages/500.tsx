import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export default function ServerError() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">服务器错误</h1>
          <p className="text-muted-foreground">
            抱歉，服务器出现了问题。我们正在努力修复中。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            刷新页面
          </Button>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
