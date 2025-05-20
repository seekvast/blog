"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "./auth-provider";

interface LoginModalContextValue {
  isOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const LoginModalContext = React.createContext<LoginModalContextValue | undefined>(
  undefined
);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (searchParams) {
      const showLogin = searchParams.get("showLogin");
      const fromPath = searchParams.get("from");

      if (showLogin === "true") {
        setIsOpen(true);
        if (fromPath) {
          setRedirectPath(fromPath);
        }
      }
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (user) {
      setIsOpen(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (user && redirectPath) {
      try {
        router.push(redirectPath);
      } catch (error) {
        console.error("路由跳转错误:", error);
      }
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath;
        }
        setRedirectPath(null);
      }, 300);
    }
  }, [user, redirectPath, router]);

  const openLoginModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLoginModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <LoginModalContext.Provider
      value={{ isOpen, openLoginModal, closeLoginModal }}
    >
      {children}
      <LoginModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        isRedirect={!!redirectPath}
      />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = React.useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
  }
  return context;
}
