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

const stepOneSchema = z.object({
  email: z.string().email("請輸入有效的郵箱地址"),
  password: z
    .string()
    .min(6, "密碼至少需要6個字符")
    .max(32, "密碼最多32個字符")
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
  gender: z.enum(["male", "female", "other"], {
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
    const isValid = await validateStep2();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      const data = await api.users.signUp({ ...step1Data, ...step2Data });
      console.log(data, '..................data');
      toast({
        title: "註冊成功",
        description: "請前往郵箱驗證後登錄",
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
          <DialogTitle>
            {step === 1 ? "創建新賬號" : "完善個人信息"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-neutral-500">
                    郵箱
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
                  <Label
                    htmlFor="password"
                    className="text-sm text-neutral-500"
                  >
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
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm text-neutral-500"
                  >
                    使用者賬號
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={step2Data.username}
                    onChange={handleStep2Change}
                    placeholder="請輸入3-32位英文、數字賬號"
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
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
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

                <div className="flex gap-4">
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
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
