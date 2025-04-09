"use client";

import { ReactNode } from "react";
import { useAuth } from "@/components/providers/auth-provider";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode; // 未登录时显示的内容
}

/**
 * @example
 * <AuthGuard fallback={<p>请登录后查看</p>}>
 *   <UserProfile />
 * </AuthGuard>
 */
export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <>{fallback}</>;

  return <>{children}</>;
}
