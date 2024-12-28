"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface AuthDialogProps {
  trigger?: React.ReactNode
  mode?: "login" | "register"
}

export function AuthDialog({ trigger, mode = "login" }: AuthDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [currentMode, setCurrentMode] = React.useState(mode)
  const [agreed, setAgreed] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 处理登录/注册逻辑
    setOpen(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const switchMode = () => {
    setCurrentMode(currentMode === "login" ? "register" : "login")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="ghost">登入</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{currentMode === "login" ? "登入" : "建立一個帳號"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="請輸入電子信箱"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="請輸入密碼"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {currentMode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground"
                  >
                    記住我
                  </label>
                </div>
                <Button
                  variant="link"
                  className="px-0 text-sm font-normal"
                  type="button"
                >
                  忘記密碼？
                </Button>
              </div>
            )}

            {currentMode === "register" && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  註冊登入即代表同意Kater
                  <Button variant="link" className="h-auto px-1 text-sm font-normal">
                    《服務條款》
                  </Button>
                  <Button variant="link" className="h-auto px-1 text-sm font-normal">
                    《隱私權政策》
                  </Button>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={currentMode === "register" && !agreed}>
              {currentMode === "login" ? "繼續" : "註冊"}
            </Button>

            <div className="text-center text-sm">
              {currentMode === "login" ? "新用戶？" : "已有帳號？"}
              <Button
                variant="link"
                onClick={switchMode}
                className="px-1 text-sm font-normal"
                type="button"
              >
                {currentMode === "login" ? "建立一個帳號" : "登入"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
