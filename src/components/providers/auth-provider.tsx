"use client";

import * as React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  
  const user = session ? {
    hashid: session.user.id,
    username: session.user.username,
    email: session.user.email,
    nickname: session.user.nickname || "",
    avatar_url: session.user.avatar_url || "",
  } as User : null;

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
