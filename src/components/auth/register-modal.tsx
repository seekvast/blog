import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useAuthModal } from "./auth-modal-store";
import { useRegistrationStore } from "@/store/registration-store";
import { signIn } from "next-auth/react";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

const stepOneSchema = z.object({
  email: z.string().email("請輸入有效的郵箱地址"),
  password: z
    .string()
    .min(8, "密碼至少需要8個字符")
    .max(100, "密碼最多100個字符")
    .regex(
      /^[0-9a-zA-Z!@#$%^&*\-_]{8,100}$/,
      "密碼至少8個字符，可输入大小寫字母、數字和特殊字符"
    ),
});

const MIN_YEAR = 1;
const CURRENT_YEAR = new Date().getFullYear();

const stepTwoSchema = z.object({
  username: z
    .string()
    .min(2, "賬號至少需要2個字符")
    .max(16, "賬號最多16個字符")
    .regex(/^[a-zA-Z0-9_]+$/, "賬號只能包含英文、數字和下劃線"),
  nickname: z
    .string()
    .min(2, "暱稱至少需要2個字符")
    .max(16, "暱稱最多16個字符")
    .regex(/^[a-zA-Z0-9_]+$/, "暱稱只能包含英文、數字和下劃線"),
  gender: z.enum(["0", "1", "2", "3"], {
    required_error: "請選擇性別",
  }),
  birthday: z
    .object({
      year: z
        .string()
        .regex(/^\d{4}$/, "請輸入有效的年份")
        .refine(
          (val) => {
            const year = parseInt(val);
            return year >= MIN_YEAR && year <= CURRENT_YEAR;
          },
          { message: `年份必須在 ${MIN_YEAR} 到 ${CURRENT_YEAR} 之間` }
        ),
      month: z.string().regex(/^(0?[1-9]|1[0-2])$/, "請輸入有效的月份"),
      day: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])$/, "請輸入有效的日期"),
    })
    .refine(
      (birthday) => {
        const birthDate = new Date(
          parseInt(birthday.year),
          parseInt(birthday.month) - 1,
          parseInt(birthday.day)
        );
        const today = new Date();
        const minAgeDate = new Date(
          today.getFullYear() - 13,
          today.getMonth(),
          today.getDate()
        );
        return birthDate <= minAgeDate;
      },
      { message: "用戶年齡不能小于13歲" }
    )
    .refine(
      (birthday) => {
        const birthDate = new Date(
          parseInt(birthday.year),
          parseInt(birthday.month) - 1,
          parseInt(birthday.day)
        );
        const today = new Date();
        const maxAgeDate = new Date(
          today.getFullYear() - 130,
          today.getMonth(),
          today.getDate()
        );
        return birthDate >= maxAgeDate;
      },
      { message: "用戶年齡不能大于130歲" }
    ),
});

interface RegisterModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const { isRegisterOpen, closeRegister, openLogin } = useAuthModal();
  const { t } = useTranslation();
  const { setNewlyRegistered } = useRegistrationStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 表单错误状态
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    nickname?: string;
    gender?: string;
    birthday?: string;
  }>({});

  // 第一步表单数据
  const [step1Data, setStep1Data] = useState({
    email: "",
    password: "",
  });

  // 第二步表单数据
  const [step2Data, setStep2Data] = useState({
    username: "",
    nickname: "",
    gender: "",
    birthday: {
      year: "",
      month: "",
      day: "",
    },
  });

  const handleStep1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStep1Data({
      ...step1Data,
      [name]: value,
    });
    // 清除对应字段的错误
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleStep2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStep2Data({
      ...step2Data,
      [name]: value,
    });
    // 清除对应字段的错误
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleGenderChange = (value: string) => {
    setStep2Data({
      ...step2Data,
      gender: value,
    });
    // 清除性别错误
    setErrors((prev) => ({ ...prev, gender: undefined }));
  };

  const yearInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);

  const handleBirthdayChange = (
    field: "year" | "month" | "day",
    value: string,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    const newValue = value.replace(/\D/g, "");
    let finalValue = newValue;
    let shouldFocus = false;

    switch (field) {
      case "year":
        finalValue = newValue.slice(0, 4);
        const yearValue = parseInt(finalValue);
        if (yearValue < MIN_YEAR && finalValue.length === 4) {
          finalValue = MIN_YEAR.toString();
        } else if (yearValue > CURRENT_YEAR) {
          finalValue = CURRENT_YEAR.toString();
        }
        if (finalValue.length === 4) {
          shouldFocus = true;
        }
        break;
      case "month":
        if (newValue !== "" && parseInt(newValue) > 12) {
          finalValue = "12";
        } else if (newValue.length === 2 && parseInt(newValue) === 0) {
          finalValue = "01";
        } else {
          finalValue = newValue.slice(0, 2);
        }
        if (finalValue.length === 2) {
          shouldFocus = true;
        }
        break;
      case "day":
        const maxDays = new Date(
          parseInt(
            step2Data.birthday.year || new Date().getFullYear().toString()
          ),
          parseInt(step2Data.birthday.month || "1"),
          0
        ).getDate();

        if (newValue !== "" && parseInt(newValue) > maxDays) {
          finalValue = maxDays.toString();
        } else if (newValue.length === 2 && parseInt(newValue) === 0) {
          finalValue = "01";
        } else {
          finalValue = newValue.slice(0, 2);
        }
        break;
    }

    setStep2Data({
      ...step2Data,
      birthday: {
        ...step2Data.birthday,
        [field]: finalValue,
      },
    });

    // 清除生日错误
    setErrors((prev) => ({ ...prev, birthday: undefined }));

    // 自动跳转到下一个输入框
    if (shouldFocus && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const validateStep1 = async () => {
    try {
      await stepOneSchema.parseAsync(step1Data);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateStep2 = async () => {
    try {
      await stepTwoSchema.parseAsync(step2Data);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep1();
    if (!turnstileToken) {
      toast({
        description: "請完成人機驗證",
        variant: "destructive",
      });
      return;
    }

    if (isValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    const result = stepTwoSchema.safeParse(step2Data);
    if (!result.success) {
      const errors = result.error.errors;
      const newErrors: Record<string, string> = {};
      errors.forEach((error) => {
        const field = error.path[0];
        newErrors[field.toString()] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    if (!turnstileToken) {
      toast({
        description: "請完成人機驗證",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const birthday =
        step2Data.birthday.year &&
        step2Data.birthday.month &&
        step2Data.birthday.day
          ? `${step2Data.birthday.year}-${parseInt(
              step2Data.birthday.month
            )}-${parseInt(step2Data.birthday.day)}`
          : undefined;

      const data = await api.users.signUp({
        ...step1Data,
        ...step2Data,
        gender: step2Data.gender ? parseInt(step2Data.gender) : undefined,
        birthday,
        turnstile_token: turnstileToken,
      });

      if (data.token) {
        await signIn("credentials", {
          email: data.email,
          password: step1Data.password,
          auth_token: data.token,
          redirect: false,
        });
      }
      // 设置新注册用户状态，触发兴趣选择
      setNewlyRegistered(true);

      toast({
        title: "註冊成功",
        description: "已自動登錄",
      });
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        closeRegister();
      }
      setStep(1);
      // 重置表单
      setStep1Data({ email: "", password: "" });
      setStep2Data({
        username: "",
        nickname: "",
        gender: "",
        birthday: { year: "", month: "", day: "" },
      });
      setErrors({});
    } catch (error) {
      toast({
        variant: "destructive",
        title: "註冊失敗",
        description: error instanceof Error ? error.message : "發生未知錯誤",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open !== undefined ? open : isRegisterOpen}
        onOpenChange={(value) => {
          if (onOpenChange) {
            onOpenChange(value);
          } else {
            if (!value) closeRegister();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] rounded-lg p-6">
          <DialogHeader className="mb-4">
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">第{step}步，共2步</p>
              <DialogTitle className="text-3xl font-medium">
                建立一個帳號
              </DialogTitle>
              <p className="text-sm text-neutral-500">
                已有帳號？
                <span
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    if (onOpenChange) {
                      onOpenChange(false);
                    } else {
                      closeRegister();
                    }
                    openLogin();
                  }}
                >
                  去登入
                </span>
              </p>
            </div>
          </DialogHeader>

          {step === 1 ? (
            <div className="space-y-5">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-neutral-500">
                      電子郵件
                    </Label>
                    <Input
                      type="text"
                      id="email"
                      name="email"
                      value={step1Data.email}
                      onChange={handleStep1Change}
                      placeholder="請輸入電子郵箱"
                      className="h-12 text-base"
                      autoComplete="new-email"
                    />
                    {errors.email && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm text-neutral-500"
                    >
                      密碼
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={step1Data.password}
                        onChange={handleStep1Change}
                        placeholder="請輸入密碼"
                        className="h-12 text-base pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password ? (
                      <p className="text-sm text-red-500 text-xs">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-5">
                    {/* Cloudflare Turnstile 验证 */}
                    <div className="flex justify-center w-full">
                      <div className="cf-turnstile flex justify-center">
                        <Turnstile
                          siteKey={TURNSTILE_SITE_KEY}
                          onSuccess={(token) => {
                            console.log("Turnstile success:", token);
                            setTurnstileToken(token);
                          }}
                          onError={() => {
                            console.log("Turnstile error");
                            setTurnstileToken(null);
                          }}
                          onExpire={() => {
                            console.log("Turnstile expired");
                            setTurnstileToken(null);
                          }}
                          options={{
                            theme: "auto",
                            size: "normal",
                          }}
                          className="flex justify-center items-center"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full h-12 text-base"
                    >
                      下一步
                    </Button>
                  </div>

                  <div className="text-center space-y-4 pt-2">
                    <p className="text-xs text-neutral-500">
                      註冊登入即代表同意Kater
                      <Link
                        href="/terms"
                        className="text-primary hover:underline mx-1"
                      >
                        《服務條款》
                      </Link>
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        《隱私權政策》
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-5">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm text-neutral-500"
                    >
                      使用者帳號
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      value={step2Data.username}
                      onChange={handleStep2Change}
                      placeholder="可輸入2-16位英文、數字,下劃線"
                      className="h-12 text-base"
                      autoComplete="new-username"
                    />
                    {errors.username && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="nickname"
                      className="text-sm text-neutral-500"
                    >
                      暱稱
                    </Label>
                    <Input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={step2Data.nickname}
                      onChange={handleStep2Change}
                      placeholder="可輸入1-16位英文、數字、下劃線"
                      className="h-12 text-base"
                      autoComplete="new-nickname"
                    />
                    {errors.nickname && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.nickname}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-neutral-500">性別</Label>
                      <Select
                        value={step2Data.gender}
                        onValueChange={handleGenderChange}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="請選擇性別" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">男</SelectItem>
                          <SelectItem value="2">女</SelectItem>
                          <SelectItem value="0">其他</SelectItem>
                          <SelectItem value="3">不願透露</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.gender}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-neutral-500">生日</Label>
                      <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-2">
                        <Input
                          type="text"
                          placeholder="年"
                          className="h-12 text-base"
                          value={step2Data.birthday.year}
                          onChange={(e) => {
                            handleBirthdayChange(
                              "year",
                              e.target.value,
                              monthInputRef
                            );
                          }}
                          autoComplete="new-birthday-year"
                          ref={yearInputRef}
                        />
                        <Input
                          type="text"
                          placeholder="月"
                          className="h-12 text-base"
                          value={step2Data.birthday.month}
                          onChange={(e) => {
                            handleBirthdayChange(
                              "month",
                              e.target.value,
                              dayInputRef
                            );
                          }}
                          autoComplete="new-birthday-month"
                          ref={monthInputRef}
                        />
                        <Input
                          type="text"
                          placeholder="日"
                          className="h-12 text-base"
                          value={step2Data.birthday.day}
                          onChange={(e) => {
                            handleBirthdayChange("day", e.target.value);
                          }}
                          autoComplete="new-birthday-day"
                          ref={dayInputRef}
                        />
                      </div>
                      {errors.birthday && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.birthday}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cloudflare Turnstile 验证 */}
                  <div className="flex justify-center my-4 w-full">
                    <div className="cf-turnstile flex justify-center">
                      <Turnstile
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                          setTurnstileToken(token);
                        }}
                        onError={() => {
                          setTurnstileToken(null);
                        }}
                        onExpire={() => {
                          setTurnstileToken(null);
                        }}
                        options={{
                          theme: "auto",
                          size: "normal",
                        }}
                        className="flex justify-center items-center"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 h-12 text-base"
                    >
                      上一步
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 h-12 text-base"
                      disabled={isSubmitting || !turnstileToken}
                    >
                      {isSubmitting ? "註冊中..." : "完成"}
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-neutral-500">
                      註冊登入即代表同意Kater
                      <Link
                        href="/terms"
                        className="text-primary hover:underline mx-1"
                      >
                        《服務條款》
                      </Link>
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        《隱私權政策》
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
