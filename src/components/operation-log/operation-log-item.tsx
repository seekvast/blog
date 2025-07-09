"use client";

import { OperationLog } from "@/types/operation-log";
import { useOperationLogRenderer } from "@/hooks/use-operation-log-renderer";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { OPERATION_CATEGORY_MAPPING } from "@/constants/operation-log";
import {
  Trash2,
  UserX,
  VolumeX,
  Users,
  PlusCircle,
  FileText,
  Activity,
  LogOut,
  UserCheck,
  UserMinus,
} from "lucide-react";

interface OperationLogItemProps {
  operationLog: OperationLog;
  showDetails?: boolean;
}

const iconMap = {
  trash: Trash2,
  "user-x": UserX,
  "volume-x": VolumeX,
  users: Users,
  "plus-circle": PlusCircle,
  "file-text": FileText,
  activity: Activity,
  "log-out": LogOut,
  "user-check": UserCheck,
  "user-minus": UserMinus,
};

export function OperationLogItem({
  operationLog,
  showDetails = true,
}: OperationLogItemProps) {
  const {
    renderDescription,
    renderSimpleDescription,
    getOperationIcon,
    getOperationType,
  } = useOperationLogRenderer();

  const iconName = getOperationIcon(operationLog);
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Activity;
  const operationType = getOperationType(operationLog);

  const description = showDetails
    ? renderDescription(operationLog)
    : renderSimpleDescription(operationLog);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "discussion":
      case "post":
        return "bg-red-100 text-red-800";
      case "user":
        return "bg-orange-100 text-orange-800";
      case "board":
        return "bg-green-100 text-green-800";
      case "board_child":
        return "bg-purple-100 text-purple-800";
      case "board_rule":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    return OPERATION_CATEGORY_MAPPING[type as keyof typeof OPERATION_CATEGORY_MAPPING] || "其他操作";
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
              <IconComponent className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {operationLog.operator_user?.nickname || "系统"}
                </span>
                <Badge className={getTypeColor(operationType)}>
                  {getTypeLabel(operationType)}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(operationLog.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </div>
            </div>
          </div>
          {operationLog.operator_user?.avatar_url && (
            <Avatar className="w-8 h-8">
              <img
                src={operationLog.operator_user.avatar_url}
                alt={operationLog.operator_user.nickname}
              />
            </Avatar>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed">{description}</p>
        {showDetails && operationLog.ext?.reason && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
            <strong>原因：</strong>
            {operationLog.ext.reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
