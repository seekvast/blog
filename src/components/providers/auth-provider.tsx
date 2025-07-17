"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { User } from "@/types/user";
import { useDraftStore } from "@/store/draft";
import { api } from "@/lib/api";
import { clearSessionCache } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [user, setUser] = React.useState<User | null>(null);
  const { setDraft } = useDraftStore();
  const draftFetchedRef = useRef(false);
  const sessionUserIdRef = useRef<string | null>(null);

  // 获取草稿数据
  const fetchDraft = React.useCallback(async () => {
    // 如果已经获取过草稿，且用户ID没有变化，则跳过
    if (
      draftFetchedRef.current &&
      sessionUserIdRef.current === session?.user?.hashid
    ) {
      return;
    }

    try {
      const draft = await api.discussions.draft();
      if (draft) {
        setDraft(draft);
        draftFetchedRef.current = true;
        sessionUserIdRef.current = session?.user?.hashid || null;
      }
    } catch (error) {
      console.error("获取草稿失败:", error);
    }
  }, [setDraft, session?.user?.hashid]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session?.user) {
      const newUser = {
        hashid: session.user.hashid,
        username: session.user.username,
        email: session.user.email || "",
        nickname: session.user.nickname || "",
        avatar_url: session.user.avatar_url || "",
        cover: session.user.cover || "",
        bio: session.user.bio || "",
        gender: session.user.gender || 0,
        birthday: session.user.birthday || "",
        is_email_confirmed: session.user.is_email_confirmed || 0,
        joined_at: session.user.joined_at || "",
        last_seen_at: session.user.last_seen_at || "",
        token: session.user.token || "",
        preferences: session.user.preferences,
        is_board_moderator: session.user.is_board_moderator || 0,
        age_verified: session.user.age_verified || 0,
      };

      // 只有当用户数据真正发生变化时才更新
      setUser((prevUser) => {
        if (!prevUser || prevUser.hashid !== newUser.hashid) {
          // 用户发生变化，重置草稿获取状态和清理 session 缓存
          draftFetchedRef.current = false;
          sessionUserIdRef.current = newUser.hashid;
          clearSessionCache();
          return newUser;
        }
        return prevUser;
      });

      // 用户登录时获取草稿
      fetchDraft();
    } else {
      setUser(null);
      // 用户登出时清除草稿状态和重置标志
      setDraft(null);
      draftFetchedRef.current = false;
      sessionUserIdRef.current = null;
      clearSessionCache();
    }
  }, [session, status, fetchDraft, setDraft]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
