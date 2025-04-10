# Next-Kater 论坛系统技术文档

## 1. 核心技术栈

- **前端框架**: Next.js 14 (React)
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS
- **数据管理**: React Query (数据获取和缓存)
- **状态管理**: Zustand
- **国际化**: i18next
- **认证系统**: next-auth

## 2. UI组件库

- **底层组件**: Radix UI (无样式组件)
- **组件库**: shadcn/ui (基于Radix UI)
- **图标**: lucide-react

## 3. 功能组件

- **编辑器**: react-markdown, rehype系列
- **表单处理**: react-hook-form, zod
- **拖拽功能**: @dnd-kit系列
- **日期处理**: date-fns
- **文件上传**: react-dropzone

## 4. 目录结构

- `/app` - Next.js 14的App Router目录
- `/components` - 组件目录
- `/hooks` - 自定义Hooks
- `/store` - Zustand状态管理
- `/types` - TypeScript类型定义
- `/validations` - 表单验证
- `/i18n` - 国际化配置
- `/lib` - 工具函数库
- `/providers` - React Context providers

## 5. 公共组件

- **UI基础组件**: `/components/ui`
- **布局组件**: `/components/layout`
- **编辑器组件**: `/components/editor`
- **通知组件**: `/components/notification`
- **搜索组件**: `/components/search`
- **认证组件**: `/components/auth`
- **错误处理**: `/components/error`
- **Markdown渲染**: `/components/markdown`

## 6. API架构

### 6.1 API模块结构 (/lib/api/)

1. **index.ts**
   - API入口文件
   - 环境感知（服务端/客户端）
   - 统一导出

2. **factory.ts**
   - API工厂函数
   - 实体类型定义
   - API接口定义

3. **http.ts**
   - HTTP请求方法封装
   - 错误处理逻辑
   - 缓存支持

4. **cache.ts**
   - 请求缓存机制
   - TTL支持
   - 缓存CRUD

5. **error-middleware.ts & server-error-middleware.ts**
   - 客户端/服务端错误处理
   - 错误格式化
   - 国际化支持

6. **interceptor.ts**
   - 请求/响应拦截器
   - 认证token处理
   - 数据转换

7. **fetch.ts**
   - fetch API封装
   - 请求参数处理
   - 超时和重试机制

8. **client.ts & server.ts**
   - 环境特定API实例
   - 环境适配处理

9. **config.ts**
   - API配置管理
   - 环境变量

10. **types.ts**
    - API类型定义
    - 请求/响应类型

11. **error-utils.ts**
    - 错误处理工具
    - 类型转换

### 6.2 API特性

1. **统一性**
   - 客户端/服务端一致API
   - 统一的接口定义
   - 统一的使用方式

2. **错误处理**
   - 环境感知的错误处理
   - 统一的错误格式
   - 错误国际化

3. **缓存机制**
   - 请求缓存
   - 可配置TTL
   - 缓存管理

4. **类型安全**
   - TypeScript类型定义
   - 请求/响应类型检查

5. **可扩展性**
   - 工厂模式
   - 拦截器机制
   - 配置管理

## 7. 特色功能

- 深色/浅色主题切换
- 多语言支持
- Markdown编辑/预览
- 完整认证系统
- 文件上传
- 通知系统
- 拖拽排序
- 响应式设计
