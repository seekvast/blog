# Next.js 论坛系统

## 项目概述

这是一个基于 Next.js 构建的现代化论坛系统，支持用户讨论、回复、投票等功能。

## 路由结构

### 用户页面路由

用户页面使用路径参数 `[username]` 而不是查询参数：

- **旧格式**: `/u/123?hashid=456` (使用查询参数)
- **新格式**: `/u/username` (使用路径参数)

#### 路由文件结构

```
src/app/(user)/u/[username]/
├── layout.tsx          # 用户页面布局
├── page.tsx            # 用户主页
├── middleware.ts       # 元数据生成
└── components/
    ├── user-posts.tsx  # 用户文章列表
    ├── user-replies.tsx # 用户回复列表
    └── user-sidebar.tsx # 用户侧边栏
```

#### 参数获取方式

在组件中获取路径参数：

```typescript
import { useParams } from "next/navigation";

export function UserPosts() {
  const params = useParams();
  const username = params?.username as string; // 从路径参数中获取 [username]

  // 使用 username 进行 API 调用
  const { data } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.users.get({ username: username }),
    enabled: !!username,
  });
}
```

#### API 调用

所有用户相关的 API 调用现在使用 `username` 参数：

```typescript
// 获取用户信息
api.users.get({ username: username });

// 获取用户文章
api.users.getPosts({ username: username, page: 1, per_page: 10 });

// 获取用户回复
api.users.getPosts({ username: username, page: 1, per_page: 10 });
```

#### 链接生成

所有用户链接现在使用简洁的格式：

```typescript
// 用户主页链接
href={`/u/${user.username}`}

// 用户设置页面链接
href={`/u/${user.username}/settings`}
```

## 主要功能

- 用户认证和授权
- 论坛讨论和回复
- 投票系统
- 用户个人资料
- 设置管理
- 多语言支持

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **认证**: NextAuth.js

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 路由参数更改说明

### 从 [id] 到 [username] 的迁移

项目已从使用路径参数 `[id]` 迁移到 `[username]`，主要更改包括：

1. **目录重命名**: `src/app/(user)/u/[id]/` → `src/app/(user)/u/[username]/`
2. **参数获取**: `params?.id` → `params?.username`
3. **API 调用**: 使用 `username` 参数而不是 `hashid`
4. **链接生成**: 移除查询参数，直接使用路径参数

### 影响范围

- ✅ 用户页面路由 (`/u/[username]`)
- ✅ 用户设置页面 (`/u/[username]/settings`)
- ✅ 所有用户链接生成
- ✅ API 调用参数
- ✅ 元数据生成

### 优势

- URL 更语义化和用户友好
- 符合 RESTful 设计原则
- 减少 URL 复杂度
- 提高 SEO 友好性

# 论坛系统 - Reply 按钮定位功能

## 功能概述

本项目实现了类似 Flarum 论坛系统的 Reply 按钮定位功能。当用户点击 Reply 按钮时，页面会精确滚动到 Reply 占位符区域，并且与 CommentEditor 完美对齐。同时，在编辑评论时会显示实时预览效果。

## 实现方案

### Flarum 方案分析

Flarum 论坛系统采用以下方案：

1. **目标元素**：Reply 占位符（最后一个元素）
2. **定位方式**：底部对齐 Composer
3. **计算公式**：`itemBottom - windowHeight + composerHeight`
4. **优势**：精确对齐，用户体验好

### 核心实现

#### 1. 动态计算 Composer 高度

```typescript
const getComposerHeight = React.useCallback(() => {
  if (commentEditorRef.current) {
    return commentEditorRef.current.offsetHeight;
  }
  // 如果没有编辑器元素，使用预估高度
  return 400;
}, []);
```

#### 2. 封装的滚动方法

```typescript
// 滚动到 Reply 占位符的方法，按照 Flarum 方案实现
const scrollToReplyPlaceholder = React.useCallback(() => {
  setTimeout(() => {
    // 按照 Flarum 方案：滚动到 Reply 占位符，然后精确对齐
    if (replyPlaceholderRef.current) {
      const placeholder = replyPlaceholderRef.current;
      const placeholderRect = placeholder.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 计算 Composer 高度
      const composerHeight = getComposerHeight();

      // Flarum 公式：itemBottom - windowHeight + composerHeight
      const targetScrollTop =
        window.pageYOffset +
        placeholderRect.bottom -
        windowHeight +
        composerHeight;

      window.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, 300);
}, [getComposerHeight]);
```

#### 3. 应用场景

- **主内容区域 CommentButton**：点击后调用 `scrollToReplyPlaceholder()`
- **侧边栏 CommentButton**：点击后调用 `scrollToReplyPlaceholder()`
- **Reply 占位符本身**：点击后调用 `scrollToReplyPlaceholder()`

## 技术特点

### 1. 精确对齐

- 使用 `getBoundingClientRect()` 获取精确位置
- 动态计算 Composer 高度
- 考虑窗口高度和滚动位置

### 2. 平滑滚动

- 使用 `behavior: "smooth"` 实现平滑滚动
- 300ms 延迟确保 DOM 更新完成

### 3. 响应式设计

- 适配不同屏幕尺寸
- 考虑移动端导航栏高度

### 4. 实时预览

- 预览内容完全替换整个"说点什么吧"区域
- 保持与 CommentList 组件一致的预览样式
- 显示用户头像、用户名和回复对象信息
- 预览与占位符状态切换
- 整体布局结构保持一致

## 文件结构

```
src/app/(main)/d/[slug]/discussion-detail.tsx
├── replyPlaceholderRef          # Reply 占位符引用
├── commentEditorRef             # CommentEditor 引用
├── getComposerHeight()          # 动态计算 Composer 高度
├── scrollToReplyPlaceholder()   # 封装的滚动方法
├── Preview 组件                 # 评论内容预览
├── Avatar 组件                  # 用户头像显示
└── onClick 处理逻辑             # 三个位置统一调用滚动方法

src/components/post/comment-list.tsx
├── 移除预览功能                # 预览功能移至 Reply 占位符
└── 简化组件接口                # 移除预览相关属性
```

## 使用说明

1. **点击 Reply 按钮**：页面会平滑滚动到 Reply 占位符
2. **编辑评论时**：整个"说点什么吧"区域会被预览内容完全替换
3. **预览功能**：显示用户头像、用户名、回复对象和评论内容预览
4. **CommentEditor 弹出**：位置与 Reply 占位符完美对齐
5. **用户体验**：类似 Flarum 的精确定位效果

## 优势对比

| 方案     | Flarum 方案                                  | 传统方案                    |
| -------- | -------------------------------------------- | --------------------------- |
| 目标元素 | Reply 占位符                                 | "说点什么吧..."区域         |
| 定位方式 | 底部对齐 Composer                            | 居中显示 + 高度偏移         |
| 计算方式 | `itemBottom - windowHeight + composerHeight` | `scrollIntoView + scrollBy` |
| 优势     | 精确对齐，用户体验好                         | 实现简单，兼容性好          |

## 技术栈

- **React 18**：组件化开发
- **TypeScript**：类型安全
- **Tailwind CSS**：样式设计
- **Next.js 14**：服务端渲染

## 开发说明

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
