"use client";

import * as React from "react";
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { User } from "@/types/user";
import { useDraftStore } from "@/store/draft";
import { api } from "@/lib/api";

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

  // 获取草稿数据
  const fetchDraft = React.useCallback(async () => {
    try {
      const draft = await api.discussions.draft();
      if (draft) {
        setDraft(draft);
      }
    } catch (error) {
      console.error("获取草稿失败:", error);
    }
  }, [setDraft]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session?.user) {
      setUser({
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
      });
      // 用户登录时获取草稿
      fetchDraft();
    } else {
      setUser(null);
      // 用户登出时清除草稿状态
      setDraft(null);
    }
  }, [session, status, setDraft, fetchDraft]);

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
