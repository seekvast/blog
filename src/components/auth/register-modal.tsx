import { useState, useRef } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const stepOneSchema = z.object({
  email: z.string().email("請輸入有效的郵箱地址"),
  password: z
    .string()
    .min(8, "密碼至少需要8個字符")
    .max(100, "密碼最多100個字符")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "密碼必須包含大小寫字母和數字"
    ),
});

const MIN_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();

const stepTwoSchema = z.object({
  username: z
    .string()
    .min(3, "賬號至少需要3個字符")
    .max(16, "賬號最多32個字符")
    .regex(/^[a-zA-Z0-9]+$/, "賬號只能包含英文和數字"),
  nickname: z
    .string()
    .min(3, "暱稱至少需要3個字符")
    .max(16, "暱稱最多32個字符"),
  gender: z.enum(["0", "1", "2", "3"], {
    required_error: "請選擇性別",
  }),
  birthday: z.object({
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
  }),
});

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    if (isValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
    // 清除第二步的错误
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

    try {
      setIsSubmitting(true);
      const birthday = step2Data.birthday.year && step2Data.birthday.month && step2Data.birthday.day
        ? `${step2Data.birthday.year}-${parseInt(step2Data.birthday.month)}-${parseInt(step2Data.birthday.day)}`
        : undefined;
        
      const data = await api.users.signUp({ 
        ...step1Data, 
        ...step2Data,
        gender: step2Data.gender ? parseInt(step2Data.gender) : undefined,
        birthday 
      });
      console.log(data, '..................data');
      toast({
        title: "註冊成功",
        description: "請前往登錄",
      });
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw] w-full">
        <DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-neutral-500">第{step}步，共2步</p>
            <DialogTitle>建立一個帳號</DialogTitle>
          </div>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
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
                    className="h-12"
                    autoComplete="new-email"
                  />
                  {errors.email && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-neutral-500">
                    密碼
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={step1Data.password}
                    onChange={handleStep1Change}
                    placeholder="請輸入密碼"
                    className="h-12"
                    autoComplete="new-password"
                  />
                  <p className="text-sm text-neutral-500">
                    包含至少8個字元，只能輸入英文、數字、特殊符號
                  </p>
                  {errors.password && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="h-[100px] bg-muted rounded-md">
                    {/* reCAPTCHA placeholder */}
                  </div>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="w-full h-12"
                  >
                    下一步
                  </Button>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-neutral-500">
                    已有帳戶？
                    <Button variant="link" className="px-1 h-auto" onClick={() => {
                      onOpenChange(false);
                      // TODO: 打开登录模态框
                    }}>
                      登入
                    </Button>
                  </p>
                  <p className="text-xs text-neutral-500">
                    註冊登入即代表同意Kater
                    <Link href="/terms" className="text-primary hover:underline mx-1">
                      《服務條款》
                    </Link>
                    <Link href="/privacy" className="text-primary hover:underline">
                      《隱私權政策》
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm text-neutral-500">
                    使用者帳號
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={step2Data.username}
                    onChange={handleStep2Change}
                    placeholder="請輸入3-32位英文、數字帳號"
                    className="h-12"
                    autoComplete="new-username"
                  />
                  {errors.username && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm text-neutral-500">
                    暱稱
                  </Label>
                  <Input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={step2Data.nickname}
                    onChange={handleStep2Change}
                    placeholder="請輸入3-32位暱稱"
                    className="h-12"
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
                      <SelectTrigger className="h-12">
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
                        className="h-12"
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
                        className="h-12"
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
                        className="h-12"
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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    上一步
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "註冊中..." : "完成"}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-neutral-500">
                    註冊登入即代表同意Kater
                    <Link href="/terms" className="text-primary hover:underline mx-1">
                      《服務條款》
                    </Link>
                    <Link href="/privacy" className="text-primary hover:underline">
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
  );
}
