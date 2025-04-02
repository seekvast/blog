"use client";

import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@/types/user";
import { api } from "@/lib/api";
import { z } from "zod";
import { signOut } from "next-auth/react";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "请输入当前密码"),
    password: z
      .string()
      .min(8, "密码长度至少为8位")
      .regex(
        /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_]).*$/,
        "密码必须包含数字、字母和特殊字符"
      ),
    password_confirm: z.string().min(1, "请输入确认密码"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "两次输入的新密码不一致",
    path: ["password_confirm"],
  });

type PasswordSchema = z.infer<typeof passwordSchema>;

export default function SecuritySettings({ user }: { user: User | null }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading user data...</div>
      </div>
    );
  }
  const { toast } = useToast();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const [gender, setGender] = useState(user.gender?.toString()); // Convert number to string
  const [birthday, setBirthday] = useState(user.birthday);
  const [passwordForm, setPasswordForm] = useState<PasswordSchema>({
    current_password: "",
    password: "",
    password_confirm: "",
  });
  const [nsfwVisible, setNsfwVisible] = useState(user.preferences?.nsfwVisible);

  const getGenderText = (value: string | undefined) => {
    switch (value) {
      case "0":
        return "其他";
      case "1":
        return "男";
      case "2":
        return "女";
      case "3":
        return "不愿透露";
      default:
        return "选择性别";
    }
  };

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthday(e.target.value);
  };

  const handleBirthdaySubmit = async () => {
    if (!birthday) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请选择生日",
      });
      return;
    }

    try {
      await api.users.updateBirthday({ birthday });
      toast({
        title: "更新成功",
        description: "生日已更新",
      });
      setBirthdayModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error?.message || "请稍后重试",
      });
    }
  };

  const handlePasswordChange =
    (field: keyof PasswordSchema) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handlePasswordSubmit = async () => {
    try {
      // 使用 zod 验证表单
      const validatedData = passwordSchema.parse(passwordForm);

      // 提交到后端
      await api.users.changePassword(validatedData);
      toast({
        title: "修改成功",
        description: "密码已更新, 请重新登录",
      });
      setPasswordModalOpen(false);
      // 重置表单
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirm: "",
      });
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 显示第一个验证错误
        toast({
          variant: "destructive",
          title: "验证错误",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "修改失败",
          description: error?.message || "请稍后重试",
        });
      }
    }
  };

  const handleToggle = (key: keyof User["preferences"], checked: boolean) => {
    setNsfwVisible(checked ? "yes" : "no");
    api.users.savePreferences({
      preferences: {
        nsfwVisible: checked ? "yes" : "no",
      },
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* 电子邮件设置 */}
      <div className="py-3 border-b">
        <Label>电子邮件</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 mt-1">
            更改你的电子邮件地址，以确保帐户安全并接收最新通知。
          </p>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 密码设置 */}
      <div className="py-3 border-b">
        <Label>密码</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 mt-1">
            更新你的密码，以提升帐户安全性并保护你的个人资料。
          </p>
          <div
            className="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            onClick={() => setPasswordModalOpen(true)}
          >
            <span className="text-sm text-blue-600">修改密码</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 密码修改Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 当前密码 */}
            <div className="flex flex-col gap-2">
              <Label>当前密码</Label>
              <Input
                type="password"
                placeholder="请输入当前密码"
                value={passwordForm.current_password}
                onChange={handlePasswordChange("current_password")}
              />
            </div>

            {/* 新密码 */}
            <div className="flex flex-col gap-2">
              <Label>新密码</Label>
              <Input
                type="password"
                placeholder="请输入新密码"
                value={passwordForm.password}
                onChange={handlePasswordChange("password")}
              />
              <p className="text-sm text-muted-foreground">
                密码长度至少8位，必须包含数字、字母和特殊字符
              </p>
            </div>

            {/* 确认新密码 */}
            <div className="flex flex-col gap-2">
              <Label>确认新密码</Label>
              <Input
                type="password"
                placeholder="请再次输入新密码"
                value={passwordForm.password_confirm}
                onChange={handlePasswordChange("password_confirm")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordForm({
                    current_password: "",
                    password: "",
                    password_confirm: "",
                  });
                }}
              >
                取消
              </Button>
              <Button onClick={handlePasswordSubmit}>确认修改</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 性别 */}
      {/* <div className="py-3 border-b">
        <Label>性别</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 mt-1">
            選擇你的性別，幫助我們更準確地了解你的興趣和偏好。
          </p>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setGenderModalOpen(true)}
          >
            <span className="text-sm">{getGenderText(gender)}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div> */}

      {/* 性别选择Modal */}
      <Dialog open={genderModalOpen} onOpenChange={setGenderModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>选择性别</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={gender}
              onValueChange={setGender}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="male" />
                <Label htmlFor="male">男</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="female" />
                <Label htmlFor="female">女</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="other" />
                <Label htmlFor="other">其他</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="notTell" />
                <Label htmlFor="notTell">不愿透露</Label>
              </div>
            </RadioGroup>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setGenderModalOpen(false)}
              >
                取消
              </Button>
              <Button onClick={() => setGenderModalOpen(false)}>确认</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 生日 */}
      <div className="py-3 border-b">
        <Label>生日</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 mt-1">
            設定你的生日，讓我們為你提供更合適的內容推薦。
          </p>
          <div
            className="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            onClick={() => setBirthdayModalOpen(true)}
          >
            <span className="text-sm">{birthday || "选择生日"}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 生日选择Modal */}
      <Dialog open={birthdayModalOpen} onOpenChange={setBirthdayModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>设置生日</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={birthday}
                onChange={handleBirthdayChange}
                max={today}
                className="w-full"
              />
              {/* <p className="text-sm text-muted-foreground">
                生日设置后将无法修改，请确保填写正确
              </p> */}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setBirthdayModalOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleBirthdaySubmit}>确认</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 年龄验证 */}
      <div className="py-3 border-b">
        <Label>年龄验证</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 mt-1">
            驗證你的年齡以存取特定內容
          </p>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-blue-600 ">去验证</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 成人内容 */}
      <div className="py-3 border-b">
        <Label>成人內容</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 mt-1">
            開啟後，可以自由選擇是否瀏覽成人文章與看板，並根據設定顯示相應的內容。
          </p>
          <Switch
            checked={nsfwVisible === "yes"}
            onCheckedChange={(checked) => {
              handleToggle("nsfwVisible", checked ? "yes" : "no");
            }}
          />
        </div>
      </div>
    </div>
  );
}
