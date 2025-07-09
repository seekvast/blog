# 操作日志渲染器

这个模块提供了操作日志的渲染功能，类似于通知渲染器的实现。它可以根据操作日志的数据自动生成可读的描述文本。

## 功能特性

- 🎯 **智能渲染**: 根据操作类型和占位符数据自动生成描述
- 🌐 **国际化支持**: 支持多语言翻译
- 🎨 **类型安全**: 完整的 TypeScript 类型定义
- 🔧 **易于扩展**: 模块化设计，易于添加新的操作类型
- 📱 **响应式设计**: 适配不同屏幕尺寸

## 组件结构

```
src/
├── types/
│   └── operation-log.ts          # 操作日志类型定义
├── hooks/
│   └── use-operation-log-renderer.ts  # 操作日志渲染器Hook
├── components/
│   └── operation-log/
│       ├── operation-log-item.tsx     # 单个操作日志项目
│       ├── operation-log-list.tsx     # 操作日志列表
│       ├── operation-log-example.tsx  # 使用示例
│       └── README.md                  # 说明文档
└── i18n/
    └── locales/
        └── zh-Hans-CN.json            # 中文翻译文件
```

## 使用方法

### 1. 基本使用

```tsx
import { useOperationLogRenderer } from "@/hooks/use-operation-log-renderer";
import { OperationLog } from "@/types/operation-log";

function MyComponent() {
  const { renderDescription } = useOperationLogRenderer();

  const operationLog: OperationLog = {
    // ... 操作日志数据
  };

  const description = renderDescription(operationLog);

  return <div>{description}</div>;
}
```

### 2. 使用列表组件

```tsx
import { OperationLogList } from "@/components/operation-log/operation-log-list";

function OperationLogPage() {
  const [data, setData] = useState<Pagination<OperationLog>>();

  return (
    <OperationLogList
      data={data}
      onPageChange={(page) => {
        // 处理分页
      }}
      onFilterChange={(filters) => {
        // 处理过滤
      }}
      loading={false}
    />
  );
}
```

### 3. 使用单个项目组件

```tsx
import { OperationLogItem } from "@/components/operation-log/operation-log-item";

function LogItem({ operationLog }: { operationLog: OperationLog }) {
  return (
    <OperationLogItem
      operationLog={operationLog}
      showDetails={true} // 是否显示详细信息
    />
  );
}
```

## 支持的操作类型

翻译键格式为 `{category}.{action}`，严格按照后端模板定义：

### 删除帖子/回帖操作

- `discussion.delete`: `[操作者] 已刪除 [用戶A] 所發表的 [帖子標題]`
- `post.delete`: `[操作者] 已刪除 [用戶A] 在 [帖子標題]`

### 用户管理操作

- `user.approve`: `[操作者] [批准/拒絕]了 [用戶B]`
- `user.mute`: `[操作者] 禁言 [用戶] [天數] 天`
- `user.role`: `[操作者] 將 [用戶] 的身份組從[管理員/成員]變更為 [管理員/成員]`
- `user.kick`: `[操作者] 踢出 [用戶]`
- `user.ban`: `[操作者] 封鎖 [用戶]`
- `user.unban`: `[操作者] 撤銷封鎖 [用戶]`
- `user.unmute`: `[操作者] 撤銷禁言 [用戶]`

### 子版管理操作

- `board_child.create`: `[操作者] 新增 [子版]`
- `board_child.delete`: `[操作者] 刪除 [子版]`
- `board_child.update_default`: `[操作者] 將 [子版] 設定為默認子版`
- `board_child.unset_default`: `[操作者] 將 [子版] 設定為非默認子版`
- `board_child.update_hidden`: `[操作者] 將 [子版] 設定為隱藏子版`
- `board_child.unhide`: `[操作者] 將 [子版] 設定為取消隱藏`
- `board_child.update_moderator_only`: `[操作者] 將 [子版] 設定為管理人員才可發表`
- `board_child.unset_moderator_only`: `[操作者] 將 [子版] 設定為所有人可發表`

### 看板管理操作

- `board.create`: `[操作者] 建立了看板 [名稱]`
- `board.delete`: `[操作者] 刪除了看板 [名稱]`
- `board.request_delete`: `[操作者] 請求刪除看板 [名稱]`
- `board.cancel_delete`: `[操作者] 取消刪除看板 [名稱]`
- `board.restore`: `[操作者] 恢復了看板 [名稱]`

### 规则管理操作

- `board_rule.create`: `[操作者] 新增了 [規則標題]`
- `board_rule.delete`: `[操作者] 刪除了 [規則標題]`
- `board_rule.update`: `[操作者] 對 [規則標題] 的標題或內容進行變更`

## 占位符变量

渲染器支持以下占位符变量：

- `{operator_name}`: 操作者名称
- `{username}`: 用户名称
- `{title}`: 标题
- `{old_value}`: 旧角色/旧数据
- `{new_value}`: 新角色/新数据
- `{name}`: 名称/看板名称
- `{days}`: 天数/受限天数/禁言天数
- `{reason}`: 原因

## 翻译文件格式

在 `src/i18n/locales/zh-Hans-CN.json` 中添加操作日志翻译，严格按照模板定义：

```json
{
  "operationLogs": {
    "discussion.delete": "[{operator_name}] 已刪除 [{username}] 所發表的 [{title}]",
    "post.delete": "[{operator_name}] 已刪除 [{username}] 在 [{title}]",
    "user.approve": "[{operator_name}] [{new_value}]了 [{username}]",
    "user.mute": "[{operator_name}] 禁言 [{username}] [{days}] 天",
    "user.role": "[{operator_name}] 將 [{username}] 的身份組從[{old_value}]變更為 [{new_value}]",
    "user.kick": "[{operator_name}] 踢出 [{username}]",
    "user.ban": "[{operator_name}] 封鎖 [{username}]",
    "user.unban": "[{operator_name}] 撤銷封鎖 [{username}]",
    "user.unmute": "[{operator_name}] 撤銷禁言 [{username}]",
    "board_child.create": "[{operator_name}] 新增 [{name}]",
    "board_child.delete": "[{operator_name}] 刪除 [{name}]",
    "board.create": "[{operator_name}] 建立了看板 [{name}]",
    "board.delete": "[{operator_name}] 刪除了看板 [{name}]",
    "board.request_delete": "[{operator_name}] 請求刪除看板 [{name}]",
    "board.cancel_delete": "[{operator_name}] 取消刪除看板 [{name}]",
    "board.restore": "[{operator_name}] 恢復了看板 [{name}]",
    "board_rule.create": "[{operator_name}] 新增了 [{title}]",
    "board_rule.delete": "[{operator_name}] 刪除了 [{title}]",
    "board_rule.update": "[{operator_name}] 對 [{title}] 的標題或內容進行變更",
    "board_child.update_default": "[{operator_name}] 將 [{name}] 設定為默認子版",
    "board_child.unset_default": "[{operator_name}] 將 [{name}] 設定為非默認子版",
    "board_child.update_hidden": "[{operator_name}] 將 [{name}] 設定為隱藏子版",
    "board_child.unhide": "[{operator_name}] 將 [{name}] 設定為取消隱藏",
    "board_child.update_moderator_only": "[{operator_name}] 將 [{name}] 設定為管理人員才可發表",
    "board_child.unset_moderator_only": "[{operator_name}] 將 [{name}] 設定為所有人可發表",
    "default_log": "[{operator_name}] 執行了操作：{action_code}。詳情：{details}"
  }
}
```

## API 集成

操作日志 API 已集成到 API 工厂中：

```tsx
import { createApi } from "@/lib/api/factory";

const api = createApi();

// 获取操作日志
const logs = await api.boards.operationLogs({
  board_id: 1,
  page: 1,
  limit: 10,
});
```

## 自定义扩展

### 添加新的操作类型

1. 在翻译文件中添加新的模板
2. 在 `useOperationLogRenderer` 中添加对应的处理逻辑
3. 更新类型定义（如需要）

### 自定义渲染逻辑

```tsx
const { renderDescription } = useOperationLogRenderer();

// 自定义渲染
const customRender = (log: OperationLog) => {
  const baseDescription = renderDescription(log);

  // 添加自定义逻辑
  if (log.action === "custom_action") {
    return `${baseDescription} (自定义处理)`;
  }

  return baseDescription;
};
```

## 注意事项

1. **数据格式**: 确保操作日志数据符合 `OperationLog` 接口定义
2. **翻译文件**: 添加新操作类型时记得更新翻译文件
3. **性能优化**: 大量数据时考虑虚拟滚动
4. **错误处理**: 处理翻译缺失的情况，使用默认模板

## 示例

完整的使用示例请参考 `operation-log-example.tsx` 文件。
