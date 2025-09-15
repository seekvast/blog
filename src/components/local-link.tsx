"use client";

import Link, { type LinkProps } from "next/link";
import { useParams } from "next/navigation";
import React from "react";

type LocalizedLinkProps = Omit<React.ComponentProps<"a">, "href"> & LinkProps;

export const LocalLink = React.forwardRef<
  HTMLAnchorElement,
  LocalizedLinkProps
>(({ href, ...props }, ref) => {
  const params = useParams();
  const lng = (params?.lng as string) || "en"; // Fallback to a default language

  // 只为内部、绝对路径添加语言前缀
  // 外部链接 (http://...) 或锚点链接 (#...) 保持不变
  const localHref =
    typeof href === "string" && href.startsWith("/") ? `/${lng}${href}` : href;

  return <Link href={localHref} {...props} ref={ref} />;
});

LocalLink.displayName = "LocalLink";