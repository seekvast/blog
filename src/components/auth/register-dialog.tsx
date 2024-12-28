"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff, Calendar, ChevronLeft } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface RegisterDialogProps {
  trigger?: React.ReactNode
}

export function RegisterDialog({ trigger }: RegisterDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(1)
  const [showPassword, setShowPassword] = React.useState(false)
  const [agreed, setAgreed] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      // TODO: 处理注册逻辑
      setOpen(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const goBack = () => {
    setStep(1)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="ghost">註冊</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center">
            {step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8"
                onClick={goBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="flex-1">
              <div className="text-sm text-muted-foreground">
                第{step}步，共2步
              </div>
              {step === 1 ? "建立一個帳號" : "建立資料"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>已有帳戶？</div>
                  <Button variant="link" className="px-0" type="button">
                    登入
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="請輸入電子信箱"
                    required
                  />
                </div>
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
                <div className="text-sm text-muted-foreground">
                  包含至少8個字元，只能輸入英文、數字、特殊符號
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                  註冊登入即代表同意Kater
                  <Button variant="link" className="h-auto px-1 text-sm font-normal">
                    《服務條款》
                  </Button>
                  <Button variant="link" className="h-auto px-1 text-sm font-normal">
                    《隱私權政策》
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              繼續
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">使用者帳號</Label>
                <Input
                  id="username"
                  placeholder="請輸入2-16位英文、數字帳號"
                  required
                  pattern="^[a-zA-Z0-9]{2,16}$"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">暱稱</Label>
                <Input
                  id="nickname"
                  placeholder="請輸入暱稱"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>性別</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇性別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>生日</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="年"
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="月"
                      min="1"
                      max="12"
                      required
                    />
                    <Input
                      type="number"
                      placeholder="日"
                      min="1"
                      max="31"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              完成
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
