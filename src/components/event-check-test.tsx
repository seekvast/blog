"use client";

import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, MousePointer, AlertCircle, CheckCircle } from "lucide-react";

export function EventCheckTest() {
  const [clickCount, setClickCount] = useState(0);
  const [dropdownClickCount, setDropdownClickCount] = useState(0);
  const [menuItemLogs, setMenuItemLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 基础点击测试
  const handleBasicClick = () => {
    const count = clickCount + 1;
    setClickCount(count);
    console.log(`🖱️ 基础按钮点击 #${count}`);
    addTestResult(`✅ 基础按钮点击 #${count} - 事件正常触发`);
  };

  // Dropdown 触发器点击测试
  const handleDropdownTriggerClick = () => {
    const count = dropdownClickCount + 1;
    setDropdownClickCount(count);
    console.log(`🎯 Dropdown 触发器点击 #${count}`);
    addTestResult(`✅ Dropdown 触发器点击 #${count} - 事件触发`);
  };

  // Dropdown 菜单项点击测试
  const handleMenuItemClick = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `${timestamp} - ${action}`;
    setMenuItemLogs(prev => [log, ...prev.slice(0, 4)]); // 保留最近5条
    console.log(`📋 菜单项点击: ${action}`);
    addTestResult(`✅ 菜单项点击 - ${action}`);
  };

  // 测试结果管理
  const addTestResult = (result: string) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // 保留最近10条
  };

  // 事件监听器测试
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleClick = (e: Event) => {
      console.log('🔍 事件监听器捕获到点击事件:', e);
      addTestResult('✅ 事件监听器 - 成功捕获点击');
    };

    button.addEventListener('click', handleClick);
    return () => {
      button.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div style={{
      padding: "30px",
      border: "3px solid red",
      margin: "20px 0",
      backgroundColor: "#fff5f5"
    }}>
      <h3>🔬 事件检查测试 - 诊断 DropdownMenu 点击问题</h3>

      {/* 基础点击测试 */}
      <div style={{ marginBottom: "25px", padding: "20px", border: "2px solid #007bff", borderRadius: "8px" }}>
        <h4 style={{ color: "#007bff", marginBottom: "15px" }}>🖱️ 基础点击测试</h4>
        <p style={{ marginBottom: "10px", color: "#666" }}>
          测试基本的 onClick 事件是否正常工作
        </p>

        <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "15px" }}>
          <button
            ref={buttonRef}
            onClick={handleBasicClick}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            基础按钮 (点击我)
          </button>

          <Button
            onClick={handleBasicClick}
            variant="outline"
          >
            Shadcn Button
          </Button>
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "12px", backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "4px" }}>
          点击次数: {clickCount} | 事件监听器: 已安装
        </div>
      </div>

      {/* DropdownMenu 基础测试 */}
      <div style={{ marginBottom: "25px", padding: "20px", border: "2px solid #28a745", borderRadius: "8px" }}>
        <h4 style={{ color: "#28a745", marginBottom: "15px" }}>🎯 DropdownMenu 基础测试</h4>
        <p style={{ marginBottom: "10px", color: "#666" }}>
          测试 DropdownMenu 的事件绑定是否正常
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* 测试1: 简单的 DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={handleDropdownTriggerClick}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  width: "100%",
                  textAlign: "left"
                }}
              >
                🎯 Dropdown 触发器 (点击我 - 应该弹出菜单)
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleMenuItemClick('菜单项 1 点击')}>
                菜单项 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('菜单项 2 点击')}>
                菜单项 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('菜单项 3 点击')}>
                菜单项 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 测试2: 使用 Button 作为触发器 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={handleDropdownTriggerClick}
                variant="outline"
                style={{ width: "100%", justifyContent: "flex-start" }}
              >
                🎯 Button 触发器 (点击我 - 应该弹出菜单)
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleMenuItemClick('Button 菜单项 1')}>
                Button 菜单项 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick('Button 菜单项 2')}>
                Button 菜单项 2
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "12px", backgroundColor: "#f8fff8", padding: "10px", borderRadius: "4px" }}>
          触发器点击次数: {dropdownClickCount}
        </div>
      </div>

      {/* 事件日志 */}
      <div style={{ marginBottom: "25px", padding: "20px", border: "2px solid #ffc107", borderRadius: "8px" }}>
        <h4 style={{ color: "#856404", marginBottom: "15px" }}>📋 事件日志</h4>
        <p style={{ marginBottom: "10px", color: "#666" }}>
          记录所有被触发的事件
        </p>

        {menuItemLogs.length > 0 ? (
          <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", borderRadius: "4px", padding: "10px" }}>
            {menuItemLogs.map((log, index) => (
              <div key={index} style={{ fontFamily: "monospace", fontSize: "11px", marginBottom: "3px" }}>
                {log}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#999", fontStyle: "italic" }}>
            暂无事件日志...
          </div>
        )}
      </div>

      {/* 测试结果 */}
      <div style={{ padding: "20px", border: "2px solid #6c757d", borderRadius: "8px", backgroundColor: "#f8f9fa" }}>
        <h4 style={{ color: "#495057", marginBottom: "15px" }}>🧪 测试结果</h4>
        <p style={{ marginBottom: "15px", color: "#666" }}>
          实时诊断事件触发状态
        </p>

        {testResults.length > 0 ? (
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  marginBottom: "4px",
                  padding: "4px",
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                  borderRadius: "2px",
                  borderLeft: result.startsWith('✅') ? "3px solid #28a745" : "3px solid #dc3545"
                }}
              >
                {result}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#999", fontStyle: "italic" }}>
            暂无测试结果...
          </div>
        )}
      </div>

      {/* 诊断说明 */}
      <div style={{
        padding: "15px",
        backgroundColor: "#e8f5e9",
        border: "1px solid #4ade80",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#155724"
      }}>
        <h4 style={{ marginBottom: "10px", color: "#0f5132" }}>🔍 诊断指南</h4>
        <ul style={{ margin: "0", paddingLeft: "20px" }}>
          <li><strong>基础按钮测试</strong>：验证 onClick 事件基本功能</li>
          <li><strong>Dropdown 触发器测试</strong>：检查 DropdownMenuTrigger 事件绑定</li>
          <li><strong>菜单项点击测试</strong>：验证 DropdownMenuItem 事件触发</li>
          <li><strong>事件日志</strong>：显示实际被触发的事件</li>
          <li><strong>测试结果</strong>：实时显示诊断信息</li>
        </ul>

        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#d4edda", borderRadius: "4px" }}>
          <strong>预期结果：</strong>
          <ul style={{ margin: "5px 0", paddingLeft: "15px" }}>
            <li>如果 <strong>基础按钮</strong> 能正常计数 → onClick 事件工作正常</li>
            <li>如果 <strong>Dropdown 触发器</strong> 能计数但菜单不弹出 → DropdownMenu 渲染问题</li>
            <li>如果 <strong>菜单项</strong> 能记录日志 → DropdownMenuItem 事件工作正常</li>
            <li>如果只有 Dropdown 相关测试无反应 → Radix UI 配置问题</li>
          </ul>
        </div>
      </div>
    </div>
  );
}