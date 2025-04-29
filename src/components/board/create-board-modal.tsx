import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
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
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardSchema, BoardFormSchema } from "@/validations/board";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BoardFormData {
  name: string;
  slug: string;
  desc: string;
  visibility: number;
  category_id: number;
  is_nsfw: number;
  attachment_id?: number;
  avatar?: string;
  question?: string;
  answer?: string;
}

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
  const [attachmentId, setAttachmentId] = useState<number | undefined>(undefined);

  const form = useForm<BoardFormSchema>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: "",
      slug: "",
      desc: "",
      visibility: 0,
      category_id: 1, // 默认综合分类
      is_nsfw: 0,
      question: "",
      answer: "",
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.common.categories(),
    staleTime: 1 * 60 * 1000,
  });

  const handleImageUpload = async (file: File) => {
    try {
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
          error instanceof Error ? error.message : "图片上传失败，请重试",
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

    try {
      setLoading(true);
      // 添加头像信息到表单数据
      const formData = {
        ...data,
        attachment_id: attachmentId,
        avatar,
      };
      
      await api.boards.create(formData);
      queryClient.invalidateQueries({ queryKey: ["boards"] });

      router.push(`/b/${data.slug}`);
      toast({
        title: "创建成功",
        description: "看板创建成功",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: error.message || "看板创建失败，请重试",
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>看板頭像</Label>
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  id="boardImage"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={(e) => handleImageUpload(e.target.files?.[0] as File)}
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
                照片上傳規格要求：格式為JPG、JPEG、GIF或者png，大小 2MB以內。
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>看板名稱</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="最長15個中文字或相同長度英文字"
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
                  <FormLabel>看板網址</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="7-25个英文字母或数字"
                      {...field}
                    />
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
                  <FormLabel>看板簡介</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="請輸入看板簡介（最多50个字符）"
                      className="resize-none"
                      rows={4}
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
                  <FormLabel>看板被搜尋</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇公開範圍" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">公開</SelectItem>
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
                    <FormLabel>看板類型</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇看板類型" />
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
                      <FormLabel>討論類型</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇討論類型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">一般討論</SelectItem>
                          <SelectItem value="1">成人内容</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "创建中..." : "建立看板"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-neutral-500">
          建立看板的同時，代表您已同意《
          <a href="#" className="text-blue-600 hover:underline">
            內容政策
          </a>
          》
        </div>
      </DialogContent>
    </Dialog>
  );
}
