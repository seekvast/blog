import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">讨论不存在</h2>
        <p className="text-muted-foreground mb-8">
          你访问的讨论可能已被删除或从未存在过
        </p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
