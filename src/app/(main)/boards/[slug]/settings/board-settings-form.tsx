"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/lib/utils/upload";

const formSchema = z.object({
  name: z.string().min(1, "看板名称不能为空"),
  slug: z
    .string()
    .min(7)
    .max(25)
    .regex(/^[a-zA-Z0-9]+$/, "只能输入英文和数字"),
  desc: z.string().max(500, "看板描述不能超过500字"),
  visibility: z.number().min(0).max(1),
  badge_visible: z.array(z.number()),
  is_nsfw: z.number().min(0).max(1),
  poll_role: z.array(z.number()),
  approval_mode: z.number().min(0).max(2),
  question: z.string().optional(),
  answer: z.string().optional(),
});

interface BoardSettingsFormProps {
  board: {
    id?: number;
    name: string;
    slug: string;
    desc?: string;
    visibility: number;
    badge_visible: number[];
    is_nsfw: number;
    poll_role: number[];
    approval_mode: number;
    question?: string;
    answer?: string;
    avatar?: string;
  };
}

export function BoardSettingsForm({ board }: BoardSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [boardImage, setBoardImage] = React.useState<string | null>(
    board.avatar || null
  );
  const [attachmentId, setAttachmentId] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const imageUrl = await uploadFile(file, "board_avatars");
        setBoardImage(imageUrl);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
        // 清空文件输入框，这样用户可以重新上传同一个文件
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: board.name,
      slug: board.slug,
      desc: board.desc || "",
      visibility: board.visibility,
      badge_visible: board.badge_visible || [],
      is_nsfw: board.is_nsfw,
      poll_role: board.poll_role || [],
      approval_mode: board.approval_mode,
      question: board.question || "",
      answer: board.answer || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        ...(board.id && { id: board.id }),
        ...(boardImage && { avatar: boardImage }),
      };

      const response = await fetch("/api/board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.code === 0) {
        console.log("保存成功");
      } else {
        throw new Error(data.message || "保存失败");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部用户信息 */}
      <div className="flex pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex items-start gap-4">
            <div 
              onClick={handleImageClick}
              className={`w-24 h-24 rounded-full bg-gray-100 overflow-hidden relative cursor-pointer group ${isUploading && 'pointer-events-none'}`}
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
              <h2 className="text-xl font-semibold">{board.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{board.desc}</p>
            </div>
          </div>
        </div>
      </div>
      {/* 主内容区域 */}
      <div className="flex">
        {/* 左侧导航菜单 */}
        <div className="w-32 bg-white border-r">
          <nav className="space-y-1 py-4">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-blue-600 bg-blue-50 border-l-2 border-blue-600"
            >
              一般设置
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              子版设置
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              规则设置
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              成员审核
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              成员管理
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              检举内容
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              审核记录
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              封锁名单
            </a>
          </nav>
        </div>
        {/* 表单内容 */}
        <div className="space-y-6 py-4 pl-8 flex-1">
          <div className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* 看板头像 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={handleImageClick}
                      className={`w-24 h-24 rounded-full bg-gray-100 overflow-hidden relative cursor-pointer group ${isUploading && 'pointer-events-none'}`}
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
                        <Textarea
                          placeholder="只能输入文字，最长500字"
                          {...field}
                        />
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
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
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
                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>答案</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="请输入答案"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                <FormField
                  control={form.control}
                  name="poll_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>谁可以发起投票</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange([Number(value)])
                        }
                        defaultValue={String(field.value[0] || 0)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择投票权限" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">普通用户</SelectItem>
                          <SelectItem value="1">创建者</SelectItem>
                          <SelectItem value="2">管理员</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 提示信息 */}
                {/* <div className="space-y-2 text-sm text-gray-500">
                  <p>需删除或添加看板</p>
                  <p>
                    你有15天时间操作，过期时间可以编辑看板加入权限
                  </p>
                </div> */}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存更改"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
