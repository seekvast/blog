import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6;

    setIsValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-medium">
            登入
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            還沒有賬號？
            <Link href="/register" className="text-primary hover:underline">
              去註冊
            </Link>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-neutral-500">
              郵箱
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="請輸入電子郵箱"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-neutral-500">
              密碼
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="請輸入密碼"
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div className="h-[100px] bg-muted rounded-md">
              {/* reCAPTCHA placeholder */}
            </div>
            <Button 
              className={cn(
                "w-full h-12",
                isValid 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-400"
              )}
            >
              登入
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
