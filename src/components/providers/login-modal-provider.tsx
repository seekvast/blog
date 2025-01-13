"use client";

import * as React from "react";
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

  // 当用户登录状态改变时，如果已登录则关闭弹窗
  React.useEffect(() => {
    if (user) {
      setIsOpen(false);
    }
  }, [user]);

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
    <LoginModalContext.Provider value={{ isOpen, openLoginModal, closeLoginModal }}>
      {children}
      <LoginModal open={isOpen} onOpenChange={handleOpenChange} />
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
