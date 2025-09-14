import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="mb-2 text-2xl font-bold">页面未找到</h1>
      <p className="text-muted-foreground mb-8">
        抱歉，您访问的页面不存在或已被移除。
      </p>

      <Link href="/">
        <Button className="bg-primary hover:bg-primary/80 text-white min-w-[200px]">
          回首页
        </Button>
      </Link>
    </div>
  );
}
