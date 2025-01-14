import Link from "next/link";
import React from "react";

interface UserLinkProps {
  href: string;
  children: React.ReactNode;
}

export function UserLink({ href, children }: UserLinkProps) {
  // 处理空链接
  if (!href) return <>{children}</>;

  // 棄查是否是用户链接（支持两种格式）
  if (href.startsWith("/users/") || href.startsWith("@")) {
    const path = href.startsWith("@") ? `/users/${href.slice(1)}` : href;

    return (
      <Link href={path} className="text-primary hover:underline font-medium">
        {children}
      </Link>
    );
  }

  // 检查是否是内部链接
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="text-blue-600 hover:underline">
        {children}
      </Link>
    );
  }

  // 外部链接
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      {children}
    </a>
  );
}
