export interface OperationLog {
  id: number;
  operator_id: number;
  user_id: number;
  target_id: number;
  target_entity: string;
  operator: string;
  user_hashid: string;
  category: string;
  action: string;
  ip_address: string;
  data: OperationLogData;
  desc: string;
  ext: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  operator_user?: {
    hashid: string;
    nickname: string;
    username: string;
    avatar_url?: string;
  };
  user?: {
    hashid: string;
    nickname: string;
    avatar_url?: string;
  };
}

export interface OperationLogParams {
  board_id?: number;
  category?: string;
  action?: string;
  operator_id?: number;
  user_id?: number;
  page?: number;
  limit?: number;
}

// 操作日志占位符类型
export interface OperationLogData {
  operator_name: string; // 操作者名称
  username: string; // 用户名称
  title: string; // 标题
  old_value: string; // 旧角色/旧数据
  new_value: string; // 新角色/新数据
  name: string; // 名称/看板名称
  days: number; // 天数/受限天数/禁言天数
  reason: string; // 原因
  [key: string]: any; // 其他可能的占位符
}
