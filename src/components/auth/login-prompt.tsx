"use client";

import { useEffect } from "react";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";

interface LoginPromptProps {
  message?: string;
  title?: string;
}

export function LoginPrompt({
  message = "此内容需要登录后查看",
  title = "需要登录",
}: LoginPromptProps) {
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    openLoginModal();
  }, [openLoginModal]);

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LockIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={openLoginModal}>立即登录</Button>
        </CardContent>
      </Card>
    </div>
  );
}
