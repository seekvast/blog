import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const handleNext = () => {
    setStep(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-8">
        <DialogHeader className="mb-6">
          <div className="text-sm text-muted-foreground">第{step}步,共2步</div>
          <DialogTitle className="text-2xl font-medium">
            {step === 1 ? "創建一個賬號" : "創建資料"}
          </DialogTitle>
          {step === 1 && (
            <div className="text-sm text-muted-foreground">
              已有賬號？
              <Link href="/login" className="text-primary hover:underline">
                去登入
              </Link>
            </div>
          )}
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-neutral-500">郵箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="請輸入電子郵箱"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-neutral-500">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                className="h-12"
              />
            </div>
            <div className="space-y-4">
              <div className="h-[100px] bg-muted rounded-md">
                {/* reCAPTCHA placeholder */}
              </div>
              <Button 
                className="w-full h-12 bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-400"
                onClick={handleNext}
              >
                繼續
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-neutral-500">使用者賬號</Label>
              <Input
                id="username"
                placeholder="請輸入2-16位英文、數字賬號"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm text-neutral-500">暱稱</Label>
              <Input
                id="nickname"
                placeholder="請輸入1-16位暱稱"
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-neutral-500">性別</Label>
                <Select>
                  <SelectTrigger className="h-12">
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
                <Label className="text-sm text-neutral-500">生日</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="年" 
                    className="w-20 h-12" 
                    value={year}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setYear(value);
                    }}
                  />
                  <Input 
                    placeholder="月" 
                    className="w-16 h-12"
                    value={month}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                      if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                        setMonth(value);
                      }
                    }}
                  />
                  <Input 
                    placeholder="日" 
                    className="w-16 h-12"
                    value={day}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                      if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                        setDay(value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <Button 
              className="w-full h-12 bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-400"
            >
              完成
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
