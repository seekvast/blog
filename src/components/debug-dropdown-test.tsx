"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DebugDropdownTest() {
  return (
    <div style={{
      padding: "40px",
      border: "2px solid blue",
      margin: "20px 0",
      position: "relative",
      zIndex: 1
    }}>
      <h3>Debug DropdownMenu Test</h3>

      {/* 测试1: 最高 z-index */}
      <div style={{ marginBottom: "30px" }}>
        <h4>测试1: 高 z-index</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                zIndex: 9999,
                position: "relative"
              }}
            >
              高优先级按钮
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            style={{
              zIndex: 10000,
              position: "fixed" // 强制使用 fixed 定位
            }}
            className="bg-white border border-gray-300 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => alert('Debug 选项 1')}
              style={{ zIndex: 10001 }}
            >
              Debug 选项 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => alert('Debug 选项 2')}
              style={{ zIndex: 10001 }}
            >
              Debug 选项 2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 测试2: 简单点击测试 */}
      <div style={{ marginBottom: "30px" }}>
        <h4>测试2: 简单点击</h4>
        <button
          onClick={() => alert('普通按钮点击正常')}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4444ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          普通按钮
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#44ff44",
                color: "black",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Dropdown 按钮
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => alert('Dropdown 选项 1')}>
              Dropdown 选项 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Dropdown 选项 2')}>
              Dropdown 选项 2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 测试3: 检查事件冒泡 */}
      <div>
        <h4>测试3: 事件检查</h4>
        <div
          onClick={() => console.log('外层 div 被点击')}
          style={{
            padding: "20px",
            border: "2px dashed orange",
            margin: "10px 0"
          }}
        >
          <p>外层 div (点击这里应该看到日志)</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Dropdown trigger 点击');
                }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ff44ff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                事件测试按钮
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                console.log('Dropdown 菜单项被点击');
                alert('菜单项点击成功');
              }}>
                测试菜单项
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f0f0" }}>
        <h4>调试说明：</h4>
        <ul>
          <li>如果 "高优先级按钮" 不能弹出菜单 → z-index 问题</li>
          <li>如果 "普通按钮" 能点击但 "Dropdown 按钮" 不能 → DropdownMenu 组件问题</li>
          <li>如果外层 div 点击日志能出现，但 Dropdown 按钮无反应 → 事件冒泡问题</li>
          <li>检查浏览器控制台的 JavaScript 错误</li>
        </ul>
      </div>
    </div>
  );
}