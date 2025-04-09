import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ServerAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode; // 未登录时显示的内容
}

/**
 * @example
 * <ServerAuthGuard fallback={<p>请登录后查看</p>}>
 *   <AdminDashboard />
 * </ServerAuthGuard>
 */
export async function ServerAuthGuard({
  children,
  fallback = null,
}: ServerAuthGuardProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) return <>{fallback}</>;

  return <>{children}</>;
}
