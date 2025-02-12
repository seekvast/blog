import React from "react";
import { useState, useEffect } from "react";
import { Board } from "@/types";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { AttachmentType } from "@/constants/attachment-type";
import { uploadFile } from "@/lib/utils/upload";
import { Category } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, "看板名称不能为空"),
  slug: z
    .string()
    .min(7)
    .max(25)
    .regex(/^[a-zA-Z0-9]+$/, "只能输入英文和数字"),
  desc: z.string().max(500, "看板描述不能超过500字"),
  badge_visible: z.array(z.number()),
  is_nsfw: z.number(),
  visibility: z.number(),
  poll_role: z.array(z.number()),
  approval_mode: z.number(),
  question: z.string().optional(),
  answer: z.string().optional(),
  category_id: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BoardProps {
  board: Board;
  onSuccess?: () => void;
}

export function BaseSettings({ board, onSuccess }: BoardProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [boardImage, setBoardImage] = React.useState<string | null>(
    board.avatar || null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: board.name,
      slug: board.slug,
      desc: board.desc || "",
      badge_visible: board.badge_visible || [],
      is_nsfw: board.is_nsfw || 0,
      visibility: board.visibility || 0,
      poll_role: board.poll_role || [],
      approval_mode: board.approval_mode || 0,
      question: board.question || "",
      answer: board.answer || "",
      category_id: board.category_id || 0,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.common.categories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "错误",
          description: "获取看板类型失败",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const data = await uploadFile(file, AttachmentType.BOARD_AVATAR);
      setBoardImage(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "图片上传失败，请重试",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await api.boards.update({
        ...data,
        id: board.id,
        avatar: boardImage,
      });

      toast({
        title: "保存成功",
        description: "看板设置已更新",
      });

      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating board:", error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "更新看板设置失败，请重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 看板头像 */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div
                onClick={handleImageClick}
                className={`w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative cursor-pointer group ${
                  isUploading && "pointer-events-none"
                }`}
              >
                {boardImage ? (
                  <>
                    <Image
                      src={boardImage}
                      alt="Board image"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-2xl mb-1">+</div>
                      <div className="text-white text-xs">点击更换</div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-gray-400 text-2xl mb-1">+</div>
                    <div className="text-gray-400 text-xs">点击更换</div>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-white"></div>
                    <div className="text-white text-xs mt-2">上传中...</div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <Label>看板头像</Label>
                <p className="text-sm text-gray-500 mt-1">
                  照片上传格式要求：JPG、JPEG、GIF或PNG、大小2MB以内。
                </p>
              </div>
            </div>
          </div>

          {/* 看板名称 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>看板名称</FormLabel>
                <FormControl>
                  <Input
                    placeholder="最长15个中文字或相同长度英文字符"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 看板网址 */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>看板网址</FormLabel>
                <FormControl>
                  <Input
                    placeholder="可輸入英文大小寫+數字，长度7~25个字符"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 看板说明 */}
          <FormField
            control={form.control}
            name="desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>看板说明</FormLabel>
                <FormControl>
                  <Textarea placeholder="只能输入文字，最长500字" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 管理人员徽章 */}
          <div className="space-y-4">
            <FormLabel>管理人员徽章展示</FormLabel>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="badge_visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value.includes(1)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, 1]
                              : field.value.filter((v) => v !== 1);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">管理</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="badge_visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value.includes(2)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, 2]
                              : field.value.filter((v) => v !== 2);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">管理员</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* 看板类型 */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>看板类型</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择看板类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 讨论类型 */}
          <FormField
            control={form.control}
            name="is_nsfw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>讨论类型</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择讨论类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">非成人</SelectItem>
                    <SelectItem value="1">成人</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 看板加入方式 */}
          <FormField
            control={form.control}
            name="approval_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>看板加入方式</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={String(field.value)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="free" />
                      <Label htmlFor="free">无需审核可直接加入</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="manual" />
                      <Label htmlFor="manual">输入问题由管理员审核</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="auto" />
                      <Label htmlFor="auto">输入问题系统自动审核</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 条件性显示问题和答案输入框 */}
          {form.watch("approval_mode") > 0 && (
            <>
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>问题</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入问题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("approval_mode") === 1 && (
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>答案</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入答案" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          {/* 看板访问权限 */}
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>看板被搜寻</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择访问权限" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">公开</SelectItem>
                    <SelectItem value="1">私密</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 投票权限 */}
          <div>
            <FormLabel>投票权限</FormLabel>
            <FormDescription>(选择允许哪些角色进行投票)</FormDescription>
            <FormField
              control={form.control}
              name="poll_role"
              render={({ field }) => (
                <FormItem>
                  <div className="mt-2">
                    <FormControl>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value.includes(3)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, 3]
                                : field.value.filter((v: number) => v !== 3);
                              field.onChange(newValue);
                            }}
                          />
                          <Label>普通用户</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value.includes(1)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, 1]
                                : field.value.filter((v: number) => v !== 1);
                              field.onChange(newValue);
                            }}
                          />
                          <Label>创建者</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value.includes(2)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, 2]
                                : field.value.filter((v: number) => v !== 2);
                              field.onChange(newValue);
                            }}
                          />
                          <Label>管理员</Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
