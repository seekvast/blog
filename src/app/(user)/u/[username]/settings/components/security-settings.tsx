"use client";

import { useState, useRef } from "react";
import { useCountdown } from "@/store/countdown-store";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@/types/user";
import { api } from "@/lib/api";
import { z } from "zod";
import { signOut } from "next-auth/react";
import { Attachment } from "@/types";
import { PlusIcon } from "lucide-react";
import { X } from "lucide-react";
import Image from "next/image";
import { AttachmentType } from "@/constants/attachment-type";
import { useTranslation } from "react-i18next";
import { useRequireAuth } from "@/hooks/use-require-auth";

const passwordSchema = z
  .object({
    current_password: z.string().min(8, "请输入当前密码"),
    password: z
      .string()
      .min(8, "密码长度至少为8位")
      .regex(
        /^[0-9a-zA-Z!@#$%^&*\-_]{8,100}$/,
        "密碼至少8個字符，可输入大小寫字母、數字和特殊字符"
      ),
    password_confirm: z.string().min(8, "请输入确认密码"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "两次输入的新密码不一致",
    path: ["password_confirm"],
  });

const emailSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  captcha: z.string().min(1, "请输入验证码"),
});

type PasswordSchema = z.infer<typeof passwordSchema>;
type EmailSchema = z.infer<typeof emailSchema>;

export default function SecuritySettings({ user }: { user: User | null }) {
  const { t } = useTranslation();
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading user data...</div>
      </div>
    );
  }
  const { requireAuthAndEmailVerification } = useRequireAuth();
  const { toast } = useToast();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const [ageVerificationOpen, setAgeVerificationOpen] = useState(false);
  const [gender, setGender] = useState(user.gender?.toString()); // Convert number to string
  const [birthday, setBirthday] = useState(user.birthday);
  const [passwordForm, setPasswordForm] = useState<PasswordSchema>({
    current_password: "",
    password: "",
    password_confirm: "",
  });
  const [emailForm, setEmailForm] = useState<EmailSchema>({
    email: "",
    captcha: "",
  });
  const [isSendingCode, setIsSendingCode] = useState(false);
  const { remainingSeconds: countdown, startCountdown } = useCountdown(
    "email-verification",
    user
  );
  const [nsfwVisible, setNsfwVisible] = useState(user.preferences?.nsfwVisible);
  const [verificationImageUrl, setVerificationImageUrl] = useState<
    string | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        variant: "default",
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
        variant: "default",
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
      const validatedData = passwordSchema.parse(passwordForm);
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
        toast({
          variant: "default",
          title: "错误",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "default",
          title: "修改失败",
          description: error?.message || "请稍后重试",
        });
      }
    }
  };

  const handleEmailChange =
    (field: keyof EmailSchema) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmailForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSendVerificationCode = async () => {
    if (!emailForm.email) {
      toast({
        variant: "default",
        title: "错误",
        description: "请输入新邮箱",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
      toast({
        variant: "default",
        title: "错误",
        description: "请输入有效的邮箱地址",
      });
      return;
    }

    try {
      setIsSendingCode(true);
      // 调用发送验证码API
      await api.users.sendEmail({ email: emailForm.email });
      toast({
        title: "发送成功",
        description: "验证码已发送到您的新邮箱",
      });

      // 使用hook启动倒计时
      startCountdown(60);
    } catch (error) {
      toast({
        variant: "default",
        title: "发送失败",
        description: error?.message || "请稍后重试",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      // 使用 zod 验证表单
      const validatedData = emailSchema.parse(emailForm);

      // 提交到后端
      await api.users.updateEmail({
        email: validatedData.email,
        captcha: validatedData.captcha,
      });

      toast({
        title: "修改成功",
        description: "邮箱已更新，请重新登录",
      });

      setEmailModalOpen(false);
      // 重置表单
      setEmailForm({
        email: "",
        captcha: "",
      });

      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 显示第一个验证错误
        toast({
          variant: "default",
          title: "验证错误",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "default",
          title: "修改失败",
          description: error?.message || "请稍后重试",
        });
      }
    }
  };

  const handleToggle = (key: string, checked: boolean) => {
    setNsfwVisible(checked ? "yes" : "no");
    api.users.savePreferences({
      preferences: {
        nsfwVisible: checked ? "yes" : "no",
      },
    });
  };

  const handleAgeVerificationImageUpload = (attachment: Attachment) => {
    setVerificationImageUrl(attachment.url);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAgeVerificationOpen = () => {
    if (
      user?.age_verification === null ||
      user?.age_verification?.status === -1
    ) {
      setAgeVerificationOpen(true);
    } else {
      toast({
        variant: "default",
        title: "错误",
        description: "您提交过年龄验证",
      });
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "default",
        title: "文件过大",
        description: "文件大小不能超过2MB",
      });
      return;
    }

    // 检查文件类型
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedFormats.includes(file.type)) {
      toast({
        variant: "default",
        title: "格式不支持",
        description: "只支持JPG、JPEG、PNG格式",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("attachment_type", AttachmentType.AGE_KYC);

      const data = await api.upload.image(formData);
      handleAgeVerificationImageUpload(data);

      toast({
        description: "上傳成功",
      });
    } catch (error) {
      toast({
        variant: "default",
        title: "上傳失敗",
        description: "圖片上傳失敗，請重試",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAgeVerificationSubmit = async () => {
    if (!verificationImageUrl) {
      toast({
        variant: "default",
        title: "错误",
        description: "请上传身份证明文件",
      });
      return;
    }

    try {
      setIsVerifying(true);
      await api.users.verifyAge({ image: verificationImageUrl });
      toast({
        title: "提交成功",
        description: "年龄验证已提交，请等待审核",
      });
      setAgeVerificationOpen(false);
    } catch (error) {
      toast({
        variant: "default",
        title: "提交失败",
        description: error?.message || "请稍后重试",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const minDate = "1900-01-01";
  const maxDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    return date.toISOString().split("T")[0];
  })();

  return (
    <div className="">
      {/* 电子邮件设置 */}
      <div className="pb-3 border-b">
        <Label className="font-bold">电子邮件</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm  mt-1">
            更改你的电子邮件地址，以确保帐户安全并接收最新通知。
          </p>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setEmailModalOpen(true)}
          >
            <span className="text-sm">{user?.email}</span>
            <ChevronRight className="h-4 w-4 " />
          </div>
        </div>
      </div>

      {/* 密码设置 */}
      <div className="py-3 border-b">
        <Label className="font-bold">密码</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm mt-1">
            更新你的密码，以提升帐户安全性并保护你的个人资料。
          </p>
          <div
            className="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            onClick={() => setPasswordModalOpen(true)}
          >
            <span className="text-sm text-blue-600">修改密码</span>
            <ChevronRight className="h-4 w-4 " />
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
              <p className="text-sm ">{t("auth.password_prompt")}</p>
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

      {/* 邮箱修改Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>更改邮箱</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 新邮箱 */}
            <div className="flex flex-col gap-2">
              <Label>新邮箱</Label>
              <Input
                type="email"
                placeholder="请输入新邮箱"
                value={emailForm.email}
                onChange={handleEmailChange("email")}
              />
            </div>

            {/* 验证码 */}
            <div className="flex flex-col gap-2">
              <Label>验证码</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="请输入验证码"
                  value={emailForm.captcha}
                  onChange={handleEmailChange("captcha")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendVerificationCode}
                  disabled={countdown > 0 || isSendingCode}
                  className="whitespace-nowrap"
                >
                  {isSendingCode
                    ? "发送中..."
                    : countdown > 0
                    ? `发送验证码(${countdown}s)`
                    : "发送验证码"}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailModalOpen(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={handleEmailSubmit}>
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 性别 */}
      {/* <div className="py-3 border-b">
        <Label>性别</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground mt-1">
            選擇你的性別，幫助我們更準確地了解你的興趣和偏好。
          </p>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setGenderModalOpen(true)}
          >
            <span className="text-sm">{getGenderText(gender)}</span>
            <ChevronRight className="h-4 w-4 " />
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
        <Label className="font-bold">生日</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm mt-1">
            設定你的生日，讓我們為你提供更合適的內容推薦。
          </p>
          <div
            className="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            onClick={() => {
              requireAuthAndEmailVerification(() => {
                setBirthdayModalOpen(true);
              });
            }}
          >
            <span className="text-sm">{birthday || "选择生日"}</span>
            <ChevronRight className="h-4 w-4 " />
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
                min={minDate}
                max={maxDate}
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
      <div className="pt-3">
        <Label className="font-bold">年龄验证</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm mt-1">驗證你的年齡以存取特定內容</p>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (user.age_verified !== 1 && user.age_verified !== 2) {
                requireAuthAndEmailVerification(() => {
                  handleAgeVerificationOpen();
                });
              }
            }}
          >
            {user.age_verified === 1 ? (
              <span className="text-sm">已验证</span>
            ) : user.age_verified === 2 ? (
              <span className="text-sm">审核中</span>
            ) : (
              <span className="text-sm text-blue-600 ">去验证</span>
            )}
            <ChevronRight className="h-4 w-4 " />
          </div>
        </div>
      </div>

      {/* 年龄验证对话框 */}
      <Dialog open={ageVerificationOpen} onOpenChange={setAgeVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>年齡認證</DialogTitle>
            <DialogDescription>
              因應當地政府法規，需要您上傳具有年齡資訊身分證明文件以進行進階年齡認證。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-slate-50 rounded-md flex flex-col items-center justify-center">
              {!verificationImageUrl ? (
                <>
                  <div className="mb-2 p-6">
                    <div
                      className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer"
                      onClick={handleFileSelect}
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                      ) : (
                        <PlusIcon className="h-8 w-8" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    上傳證件照片
                  </p>
                </>
              ) : (
                <div className="relative w-full">
                  <div className="w-full h-40 relative rounded-md overflow-hidden">
                    <Image
                      src={verificationImageUrl}
                      alt="身份证明"
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full p-2 h-8 w-8"
                    onClick={() => setVerificationImageUrl(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">要求:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>請上傳真實有效、清晰的證件</li>
                  <li>支持JPG、JPEG、PNG格式，大小不超過2M</li>
                  <li>
                    「年齡驗證所提供的個人證件僅用於確認是否為成年，驗證完畢後將於60天內銷毀證件照片。」
                  </li>
                </ul>
              </div>
            </div>

            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={handleAgeVerificationSubmit}
              disabled={!verificationImageUrl || isVerifying}
            >
              {isVerifying ? "驗證中..." : "提交"}
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </DialogContent>
      </Dialog>

      {/* 成人内容 */}
      {user.age_verified === 1 && (
        <div className="py-3 border-b">
          <Label className="font-bold">成人內容</Label>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm mt-1">
              開啟後，可以自由選擇是否瀏覽成人文章與看板，並根據設定顯示相應的內容。
            </p>
            <Switch
              checked={nsfwVisible === "yes"}
              onCheckedChange={(checked) => {
                requireAuthAndEmailVerification(() => {
                  handleToggle("nsfwVisible", checked);
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
