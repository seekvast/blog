import Link from "next/link";
import React from "react";

interface UserLinkProps {
  href: string;
  children: React.ReactNode;
}

export function UserLink({ href, children }: UserLinkProps) {
  console.log('UserLink props:', { href, children });

  // 处理空链接
  if (!href) return <>{children}</>;

  // 处理用户链接
  if (href.startsWith("@")) {
    const username = href.slice(1);
    return (
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline font-medium"
      >
        {children}
      </Link>
    );
  }

  // 处理普通用户链接
  if (href.startsWith("/users/")) {
    return (
      <Link href={href} className="text-primary hover:underline font-medium">
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}
