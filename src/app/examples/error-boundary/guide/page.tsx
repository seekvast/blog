import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ErrorBoundaryGuidePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">错误边界使用指南</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>什么是错误边界？</CardTitle>
            <CardDescription>
              错误边界是一种 React 组件，它可以捕获子组件树中的 JavaScript
              错误，记录这些错误，并显示备用 UI。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              错误边界的工作方式类似于 JavaScript 的 catch
              语句，但它们是针对组件的。
              只有类组件可以成为错误边界，因为它们需要使用 componentDidCatch
              生命周期方法。
            </p>
            <p>
              在 Next.js 中，除了自定义错误边界组件外，还可以使用内置的
              error.tsx 和 global-error.tsx 文件来处理路由级别和全局错误。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>错误边界的使用场景</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>包装整个应用或页面，提供全局错误处理</li>
              <li>包装独立的功能区域，防止一个组件的错误影响整个页面</li>
              <li>包装第三方组件，防止它们的错误影响你的应用</li>
              <li>包装数据可视化或复杂交互组件，提供优雅的降级体验</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>错误边界的限制</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">错误边界无法捕获以下类型的错误：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>事件处理器中的错误</li>
              <li>
                异步代码中的错误（如 setTimeout 或 requestAnimationFrame 回调）
              </li>
              <li>服务端渲染中的错误（需要使用 Next.js 的 error.tsx）</li>
              <li>错误边界自身抛出的错误</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>在 Next.js 中使用错误边界</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-2">1. 自定义错误边界组件</h3>
            <pre className="bg-muted p-4 rounded-md mb-4 text-sm overflow-auto">
              {`// components/error/error-boundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('组件错误:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>出错了</div>;
    }
    
    return this.props.children;
  }
}`}
            </pre>

            <h3 className="font-medium mb-2">2. 使用错误边界</h3>
            <pre className="bg-muted p-4 rounded-md mb-4 text-sm overflow-auto">
              {`// 在组件中使用
import { ErrorBoundary } from '@/components/error/error-boundary';

export function MyComponent() {
  return (
    <ErrorBoundary fallback={<div>组件加载失败</div>}>
      <SomeComponentThatMightError />
    </ErrorBoundary>
  );
}`}
            </pre>

            <h3 className="font-medium mb-2">3. 使用 Next.js 的路由错误处理</h3>
            <pre className="bg-muted p-4 rounded-md mb-4 text-sm overflow-auto">
              {`// app/some-route/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}`}
            </pre>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-4">
          <Link
            href="/examples/error-boundary"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            查看错误边界示例
          </Link>
        </div>
      </div>
    </div>
  );
}
