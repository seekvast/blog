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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus } from "lucide-react";
import { http } from "@/lib/request";

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
}

export function CreateBoardModal({ open, onOpenChange }: CreateBoardModalProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BoardFormData>({
    name: "",
    slug: "",
    desc: "",
    visibility: 0,
    category_id: 1, // 默认综合分类
    is_nsfw: 0,
  });

  const handleInputChange = (field: keyof BoardFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小（2MB限制）
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: "请上传2MB以内的图片",
      });
      return;
    }

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "文件格式不支持",
        description: "请上传JPG、JPEG、PNG或GIF格式的图片",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await http.post('/api/upload', formData);
      if (response.data.code === 0) {
        setFormData(prev => ({
          ...prev,
          attachment_id: response.data.data.id,
          avatar: response.data.data.url
        }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "图片上传失败，请重试",
      });
    }
  };

  const handleSubmit = async () => {
    if (!session?.accessToken) {
      toast({
        variant: "destructive",
        title: "未登录",
        description: "请先登录后再创建看板",
      });
      return;
    }

    // 表单验证
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "请输入看板名称",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        variant: "destructive",
        title: "请输入看板网址",
      });
      return;
    }

    try {
      setLoading(true);
      await http.post('/api/board', formData);
      
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

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>看板頭像</Label>
            <div className="relative">
              <input
                type="file"
                className="hidden"
                id="boardImage"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="boardImage"
                className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
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

          <div className="space-y-2">
            <Label>看板名稱</Label>
            <Input 
              placeholder="最長15個中文字或相同長度英文字" 
              maxLength={15}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>看板網址</Label>
            <Input 
              placeholder="https://kater.me/community/xxx" 
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>看板簡介</Label>
            <Textarea 
              placeholder="請輸入看板簡介"
              className="resize-none"
              rows={4}
              value={formData.desc}
              onChange={(e) => handleInputChange('desc', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>看板被搜尋</Label>
            <Select 
              value={String(formData.visibility)}
              onValueChange={(value) => handleInputChange('visibility', Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇公開範圍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">公開</SelectItem>
                <SelectItem value="1">私密</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>看板類型</Label>
              <Select
                value={String(formData.category_id)}
                onValueChange={(value) => handleInputChange('category_id', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇看板類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">綜合</SelectItem>
                  <SelectItem value="2">科技</SelectItem>
                  <SelectItem value="3">生活</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>討論類型</Label>
              <Select
                value={String(formData.is_nsfw)}
                onValueChange={(value) => handleInputChange('is_nsfw', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇討論類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">一般討論</SelectItem>
                  <SelectItem value="1">成人内容</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "创建中..." : "建立看板"}
        </Button>

        <div className="text-center text-sm text-neutral-500">
          建立看板的同時，代表您已同意《
          <a href="#" className="text-blue-600 hover:underline">內容政策</a>
          》
        </div>
      </DialogContent>
    </Dialog>
  );
}
