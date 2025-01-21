import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export default function Forbidden() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <ShieldAlert className="h-12 w-12 text-warning" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">访问受限</h1>
          <p className="text-muted-foreground">
            抱歉，您没有权限访问此页面。
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
