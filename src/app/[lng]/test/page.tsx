// src/app/[lng]/test/page.tsx
"use client";

// 我们用最原始的 LanguageSwitcher，不用 dynamic wrapper
import { LanguageSwitcher } from "@/components/language-switcher";
import { LanguageSwitcherFixed } from "@/components/language-switcher-fixed";
import { SimpleLanguageSwitcher } from "@/components/simple-language-switcher";
import { MinimalDropdownTest } from "@/components/minimal-dropdown-test";
import { StandaloneLanguageSwitcher } from "@/components/standalone-language-switcher";
import { DebugDropdownTest } from "@/components/debug-dropdown-test";
import { NativeSelectTest } from "@/components/native-select-test";
import { SsrSafeSelectTest } from "@/components/ssr-safe-select-test";
import { EventCheckTest } from "@/components/event-check-test";
import { SsrDetectorFixed } from "@/components/ssr-detector-fixed";
import { SsrFixedDropdownSimple } from "@/components/ssr-fixed-dropdown-simple";
// import { DropdownDebug } from "@/components/debug-dropdown-test";
import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    console.log("TestPage and its children have mounted on the client.");
  }, []);

  return (
    <div style={{ padding: "50px", backgroundColor: "white", color: "black" }}>
      <h1>语言切换器测试页面</h1>
      <p>
        如果你能在这个页面上看到下面的语言切换器，并且能点击它弹出菜单、切换语言，
        那么就证明 LanguageSwitcher 组件和 useLanguageSwitcher Hook 本身是
        **完全正确的**。
      </p>
      <p>
        这也同时证明，你遇到的所有问题，都源于它被嵌入的那个复杂的父组件
        (`LeftSidebar`)。
      </p>
      <hr style={{ margin: "20px 0" }} />

      <p>原始 LanguageSwitcher 测试（依赖 I18nProvider，已恢复）：</p>
      <LanguageSwitcher />

      <hr style={{ margin: "20px 0" }} />

      <p>修复版 LanguageSwitcher 测试（避免冲突）：</p>
      <LanguageSwitcherFixed />

      <hr style={{ margin: "20px 0" }} />

      <p>独立 LanguageSwitcher 测试（不依赖 I18nProvider）：</p>
      <StandaloneLanguageSwitcher />

      <hr style={{ margin: "20px 0" }} />

      <p>简化的 DropdownMenu 测试：</p>
      <SimpleLanguageSwitcher />

      <hr style={{ margin: "20px 0" }} />

      <p>最简化的 DropdownMenu 测试：</p>
      <MinimalDropdownTest />

      <hr style={{ margin: "20px 0" }} />

      <p>高级调试测试：</p>
      <DebugDropdownTest />

      <hr style={{ margin: "20px 0" }} />

      <p>原生 Select 测试（不依赖 DropdownMenu）：</p>
      <NativeSelectTest />

      <hr style={{ margin: "20px 0" }} />

      <p>SSR-Safe Select 测试（完全避免 SSR 问题）：</p>
      <SsrSafeSelectTest />

      <hr style={{ margin: "20px 0" }} />

      <p>SSR/CSR 检测器（诊断水合问题）：</p>
      <SsrDetectorFixed />

      <hr style={{ margin: "20px 0" }} />

      <p>事件检查测试（专门诊断点击问题）：</p>
      <EventCheckTest />

      <hr style={{ margin: "20px 0" }} />

      <p>DropdownMenu 深度调试（Portal 和状态检查）：</p>
      <hr style={{ margin: "20px 0" }} />

      <p>SSR-Fixed Dropdown Menu（解决 SSR 水合问题）：</p>
      <SsrFixedDropdownSimple />

      <hr style={{ margin: "20px 0" }} />

      <p>如果最简化版本能正常弹出菜单，那么问题在于：</p>
      <ul>
        <li>LanguageSwitcher 组件的复杂性</li>
        <li>useLanguageSwitcher hook 的水合问题</li>
        <li>Button 组件的事件处理问题</li>
        <li>样式冲突</li>
      </ul>

      <p>如果连最简化版本都不能工作，那么问题在于：</p>
      <ul>
        <li>DropdownMenu 组件本身的配置问题</li>
        <li>Radix UI 的安装或版本问题</li>
        <li>CSS 样式冲突</li>
        <li>JavaScript 运行时错误</li>
        <li>i18next 翻译文件加载问题（已修复）</li>
      </ul>
    </div>
  );
}
