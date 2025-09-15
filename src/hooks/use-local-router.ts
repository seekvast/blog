// src/hooks/use-localized-router.ts

"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * 一个包装了 Next.js useRouter 的自定义 Hook，
 * 自动处理所有路径的语言本地化。
 */
export function useLocalRouter() {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || "en"; // 提供一个回退

  /**
   * 返回一个添加了当前语言前缀的绝对路径。
   * @param path - 一个以 '/' 开头的绝对路径.
   * @returns 本地化后的路径，例如 /en/about
   */
  const getLocalPath = useCallback(
    (path: string): string => {
      if (!path.startsWith("/")) {
        // 为了安全，只处理绝对路径，避免意外行为
        console.warn(
          `[useLocalRouter] Path "${path}" is not an absolute path and will not be localized.`
        );
        return path;
      }
      return `/${lng}${path}`;
    },
    [lng]
  );

  /**
   * 包装了 router.push，自动为路径添加语言前缀。
   */
  const push = useCallback(
    (path: string, options?: any) => {
      const localPath = getLocalPath(path);
      router.push(localPath, options);
    },
    [getLocalPath, router]
  );

  return {
    ...router, // 仍然可以访问原始 router 的所有其他方法，如 back(), refresh()
    push, // 覆盖原始的 push 方法
    getPath: getLocalPath, // 提供一个独立的路径生成函数，用于非 push 的场景
  };
}