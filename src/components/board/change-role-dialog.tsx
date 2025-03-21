import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  userId: string;
  currentRole: number;
  onSuccess?: () => void;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  boardId,
  userId,
  currentRole,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<number>(currentRole);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await api.boards.changeUserRole({
        board_id: boardId,
        user_hashid: userId,
        user_role: role,
      });

      toast({
        description: "身份组更新成功",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>变更身份组</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            按下变更按钮后，将更改该用户的身份组。
          </div>
          <RadioGroup
            value={role.toString()}
            onValueChange={(value) => setRole(parseInt(value))}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="0" id="role-0" />
              <div className="space-y-1">
                <Label htmlFor="role-0" className="font-medium">
                  成员
                </Label>
                <div className="text-sm text-muted-foreground">
                  只有聊天权限，没有看板管理权限。
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="2" id="role-2" />
              <div className="space-y-1">
                <Label htmlFor="role-2" className="font-medium">
                  管理员
                </Label>
                <div className="text-sm text-muted-foreground">
                  可以管理目前的看板，但不能删除、踢出其他管理人员或改看板。
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="1" id="role-1" />
              <div className="space-y-1">
                <Label htmlFor="role-1" className="font-medium">
                  创建者
                </Label>
                <div className="text-sm text-muted-foreground">
                  获得所有管理权限，转让创建者后，你的身份组会降为管理员。
                </div>
              </div>
            </div>
          </RadioGroup>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || role === currentRole}
          >
            变更
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
