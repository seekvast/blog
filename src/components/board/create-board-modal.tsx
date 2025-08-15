import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardSchema, BoardFormSchema } from "@/validations/board";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus } from "lucide-react";
import { api } from "@/lib/api";
import { Turnstile } from "@marsidev/react-turnstile";

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

export function CreateBoardModal({
  open,
  onOpenChange,
}: CreateBoardModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [attachmentId, setAttachmentId] = useState<number | undefined>(
    undefined
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const form = useForm<BoardFormSchema>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: "",
      slug: "",
      desc: "",
      visibility: 0,
      category_id: null,
      is_nsfw: 0,
      question: "",
      answer: "",
      badge_visible: [],
      poll_role: [],
      approval_mode: 0,
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.common.categories(),
    staleTime: 1 * 60 * 1000,
  });

  const handleImageUpload = async (file: File) => {
    try {
      // 检查文件大小
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast({
          title: "上传失败",
          description: "图片大小超过2MB限制，请选择更小的图片",
          variant: "destructive",
        });
        return null;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("attachment_type", "board_avatars");

      const data = await api.upload.image(formData);

      const imageUrl = `${data.host}${data.file_path}`;
      setAvatar(imageUrl);
      setAttachmentId(data.id);
      return imageUrl;
    } catch (error) {
      toast({
        title: "上传失败",
        description:
          error instanceof Error
            ? error.message
            : "图片上传失败，请重试。可能的原因：文件格式不支持或网络问题",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (data: BoardFormSchema) => {
    if (!user?.token) {
      toast({
        variant: "destructive",
        title: "未登录",
        description: "请先登录后再创建看板",
      });
      return;
    }

    if (!turnstileToken) {
      toast({
        variant: "destructive",
        title: "验证未完成",
        description: "请先完成人机验证",
      });
      return;
    }

    try {
      setLoading(true);

      // 先在服务端验证 Turnstile token
      const verifyRes = await api.auth.verifyTurnstile(turnstileToken);
      if (!verifyRes?.success) {
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "人机验证失败，请重试",
        });
        return;
      }

      const formData = {
        ...data,
        attachment_id: attachmentId,
        avatar,
      };

      await api.boards.create(formData);
      queryClient.invalidateQueries({ queryKey: ["boards"] });

      // 重置表单数据和状态
      form.reset({
        name: "",
        slug: "",
        desc: "",
        visibility: 0,
        category_id: null,
        is_nsfw: 0,
        question: "",
        answer: "",
        badge_visible: [],
        poll_role: [],
        approval_mode: 0,
      });
      setAvatar(undefined);
      setAttachmentId(undefined);
      setTurnstileToken(null);

      router.push(`/b/${data.slug}`);
      toast({
        title: "成功",
        description: "看板创建成功",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "失败",
        description: error?.message || "看板创建失败，请重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">建立看板</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            <div className="space-y-2">
              <Label>看板头像</Label>
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  id="boardImage"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
                <label
                  htmlFor="boardImage"
                  className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Board avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-neutral-400" />
                  )}
                </label>
              </div>
              <div className="text-sm text-neutral-500">
                照片上传规格要求：格式为JPG、JPEG、GIF或者PNG，大小2MB以内。
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>看板名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="最长15个中文字或相同长度英文字"
                      maxLength={15}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>看板网址</FormLabel>
                  <FormControl>
                    <Input placeholder="7-25个英文字母或数字" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>看板简介</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入看板简介（最多500个字符）"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>看板被搜索</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择公开范围" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>看板类型</FormLabel>
                    <Select
                      value={
                        field.value === null || field.value === 0
                          ? ""
                          : String(field.value)
                      }
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择看板类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem disabled value="1">
                            加载中...
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {user && user.age_verified === 1 && (
                <FormField
                  control={form.control}
                  name="is_nsfw"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>讨论类型</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择讨论类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">一般讨论</SelectItem>
                          <SelectItem value="1">成人内容</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
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
                  options={{ theme: "auto", size: "flexible" }}
                  className="flex justify-center items-center"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading || !turnstileToken}
              >
                {loading ? "创建中..." : "建立看板"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="text-center text-sm text-neutral-500">
          建立看板的同时，代表您已同意《
          <a href="#" className="text-blue-600 hover:underline">
            内容政策
          </a>
          》
        </div>
      </DialogContent>
    </Dialog>
  );
}
