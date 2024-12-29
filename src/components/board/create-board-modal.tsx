import { useState } from "react";
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

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardModal({ open, onOpenChange }: CreateBoardModalProps) {
  const [boardImage, setBoardImage] = useState<string>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">建立看板</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>看板頭像</Label>
            <div 
              className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors"
              onClick={() => {
                // TODO: Implement image upload
              }}
            >
              <ImagePlus className="w-8 h-8 text-neutral-400" />
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
            />
          </div>

          <div className="space-y-2">
            <Label>看板網址</Label>
            <Input placeholder="https://kater.me/community/xxx" />
          </div>

          <div className="space-y-2">
            <Label>看板簡介</Label>
            <Textarea 
              placeholder="請輸入看板簡介"
              className="resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>看板被搜尋</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="選擇公開範圍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">公開</SelectItem>
                <SelectItem value="private">私密</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>看板類型</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選擇看板類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">綜合</SelectItem>
                  <SelectItem value="tech">科技</SelectItem>
                  <SelectItem value="life">生活</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>討論類型</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選擇討論類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">一般討論</SelectItem>
                  <SelectItem value="qa">問答</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
          建立看板
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
