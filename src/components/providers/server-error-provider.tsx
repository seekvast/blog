"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { serverErrorMiddleware } from "@/lib/api/server-error-middleware";

interface ServerErrorContextType {
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

const ServerErrorContext = createContext<ServerErrorContextType | undefined>(
  undefined
);

export function ServerErrorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<Error | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    // 注册全局服务端错误处理器
    const unregister = serverErrorMiddleware.use((apiError) => {
      setError(apiError);

      // 显示错误提示
      toast({
        title: "API 错误",
        description: apiError.message || "服务器请求失败",
        variant: "default",
      });
    });

    return () => {
      unregister();
    };
  }, []);

  return (
    <ServerErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ServerErrorContext.Provider>
  );
}

export function useServerErrorContext() {
  const context = useContext(ServerErrorContext);
  if (context === undefined) {
    throw new Error(
      "useServerErrorContext must be used within a ServerErrorProvider"
    );
  }
  return context;
}
