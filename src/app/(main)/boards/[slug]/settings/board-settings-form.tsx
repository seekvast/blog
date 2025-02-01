"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  boardName: z.string().min(1, "看板名称不能为空"),
  boardDesc: z.string().max(500, "看板描述不能超过500字"),
  boardType: z.string(),
  discussionType: z.string(),
  joinMethod: z.string(),
  accessMethod: z.string(),
  voteMethod: z.string(),
  inviteCode: z.string().optional(),
  password: z.string().optional(),
});

interface BoardSettingsFormProps {
  board: any; // TODO: 添加正确的类型
}

export function BoardSettingsForm({ board }: BoardSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [boardImage, setBoardImage] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: board.name,
      boardDesc: board.description || "",
      boardType: board.type === 1 ? "private" : "public",
      discussionType: board.discussion_type === 1 ? "private" : "public",
      joinMethod: board.join_method || "free",
      accessMethod: board.visibility === 1 ? "private" : "public",
      voteMethod: board.vote_enabled ? "public" : "private",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBoardImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // TODO: 实现更新看板的API调用
      console.log(values);
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
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            {board.avatar && (
              <Image
                src={board.avatar}
                alt={board.name}
                width={64}
                height={64}
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{board.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{board.description}</p>
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
                    <div className="w-24 h-24 border rounded-lg overflow-hidden relative">
                      {boardImage ? (
                        <Image
                          src={boardImage}
                          alt="Board image"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">无图片</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>看板头像</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        网页上传格式要求：PNG、JPEG、GIF等常见png、小小2MB以内。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 看板名称 */}
                <FormField
                  control={form.control}
                  name="boardName"
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

                {/* 看板说明 */}
                <FormField
                  control={form.control}
                  name="boardDesc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>看板说明</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="只能输入文字，最长500字（约小小篇）"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 看板类型 */}
                <FormField
                  control={form.control}
                  name="boardType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>看板类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择看板类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">公开看板</SelectItem>
                          <SelectItem value="private">私密看板</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 讨论类型 */}
                <FormField
                  control={form.control}
                  name="discussionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>讨论类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择讨论类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">公开讨论</SelectItem>
                          <SelectItem value="private">私密讨论</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 看板加入方式 */}
                <FormField
                  control={form.control}
                  name="joinMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>看板加入方式</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id="free" />
                            <Label htmlFor="free">无需审核可直接加入</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="invite" id="invite" />
                            <Label htmlFor="invite">
                              输入邀请码由管理员审核
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="password" id="password" />
                            <Label htmlFor="password">
                              输入密码系统自动审核
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 条件性显示邀请码/密码输入框 */}
                {form.watch("joinMethod") === "invite" && (
                  <FormField
                    control={form.control}
                    name="inviteCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邀请码</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入邀请码" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("joinMethod") === "password" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请输入密码"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* 看板访问权限 */}
                <FormField
                  control={form.control}
                  name="accessMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>看板访问权限</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择访问权限" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">选择公开可见</SelectItem>
                          <SelectItem value="private">选择私密可见</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 是否可以发起投票 */}
                <FormField
                  control={form.control}
                  name="voteMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>是否可以发起投票</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择投票权限" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">选择投票权限</SelectItem>
                          <SelectItem value="private">禁止投票权限</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 提示信息 */}
                <div className="space-y-2 text-sm text-gray-500">
                  <p>加入私钥5000人显示：触发批量审核，你需删除或添加看板</p>
                  <p>
                    加入私钥3000人显示：触发批量审核，你有15天时间操作，过期时间可以编辑看板加入权限
                  </p>
                </div>

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
