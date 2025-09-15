"use client";

import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";

export function DropdownDebug() {
  const [dropdownState, setDropdownState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [triggerClicks, setTriggerClicks] = useState(0);
  const [itemClicks, setItemClicks] = useState(0);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isPortalWorking, setIsPortalWorking] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    setDebugLogs(prev => [log, ...prev.slice(0, 9)]);
  };

  const handleTriggerClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const clickCount = triggerClicks + 1;
    setTriggerClicks(clickCount);
    setDropdownState('opening');
    addLog(`🎯 Trigger 点击 #${clickCount} - DropdownMenu 应该开始打开`);

    // 模拟 DropdownMenu 打开后的状态变化
    setTimeout(() => {
      setDropdownState('open');
      setIsPortalWorking(true);
      addLog(`📂 DropdownMenu 状态: open`);
    }, 100);
  };

  const handleItemClick = (action: string) => {
    const clickCount = itemClicks + 1;
    setItemClicks(clickCount);
    addLog(`📋 Menu Item 点击 #${clickCount} - ${action}`);

    setDropdownState('closing');
    setTimeout(() => {
      setDropdownState('closed');
      addLog(`📂 DropdownMenu 状态: closed`);
    }, 200);
  };

  // 检查 Portal 是否正常工作
  useEffect(() => {
    if (dropdownState === 'open') {
      // 检查 portal 内容是否被渲染到 DOM 中
      setTimeout(() => {
        const portalElements = document.querySelectorAll('[data-radix-popper-content]');
        const portalWorking = portalElements.length > 0;
        setIsPortalWorking(portalWorking);
        addLog(`🚪 Portal 检测: ${portalWorking ? '✅ 正常' : '❌ 失败'}`);

        if (portalWorking) {
          const rect = portalElements[0].getBoundingClientRect();
          setMenuPosition({ top: rect.top, left: rect.left });
          addLog(`📍 菜单位置: top=${rect.top}, left=${rect.left}`);
        }
      }, 300);
    }
  }, [dropdownState]);

  // 测试不同的触发器配置
  const testConfigurations = [
    {
      name: "基础配置",
      trigger: (
        <button
          ref={triggerRef}
          onClick={handleTriggerClick}
          style={{
            padding: "12px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          <Globe size={16} style={{ marginRight: "8px" }} />
          基础触发器
        </button>
      )
    },
    {
      name: "Button 组件配置",
      trigger: (
        <Button
          ref={triggerRef}
          onClick={handleTriggerClick}
          variant="outline"
          style={{ width: "100%", justifyContent: "flex-start" }}
        >
          <Globe size={16} style={{ marginRight: "8px" }} />
          Button 触发器
        </Button>
      )
    },
    {
      name: "无 asChild 配置",
      trigger: (
        <DropdownMenuTrigger>
          <button
            onClick={handleTriggerClick}
            style={{
              padding: "12px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              width: "100%"
            }}
          >
            <Globe size={16} style={{ marginRight: "8px" }} />
            无 asChild 触发器
          </button>
        </DropdownMenuTrigger>
      )
    }
  ];

  return (
    <div style={{
      padding: "30px",
      border: "3px solid #6c757d",
      margin: "20px 0",
      backgroundColor: "#f8f9fa"
    }}>
      <h3>🔬 DropdownMenu 深度调试</h3>

      {/* 状态指示器 */}
      <div style={{
        marginBottom: "25px",
        padding: "15px",
        backgroundColor: "#e9ecef",
        borderRadius: "8px",
        border: "1px solid #dee2e6"
      }}>
        <h4 style={{ marginBottom: "15px", color: "#495057" }}>📊 当前状态</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #dee2e6" }}>
            <strong>DropdownMenu 状态：</strong>
            <div style={{
              color: dropdownState === 'closed' ? '#dc3545' :
                     dropdownState === 'open' ? '#28a745' : '#ffc107',
              fontWeight: "bold",
              marginTop: "5px"
            }}>
              {dropdownState.toUpperCase()}
            </div>
          </div>

          <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #dee2e6" }}>
            <strong>Portal 状态：</strong>
            <div style={{
              color: isPortalWorking ? '#28a745' : '#dc3545',
              fontWeight: "bold",
              marginTop: "5px"
            }}>
              {isPortalWorking ? '✅ 工作' : '❌ 失败'}
            </div>
          </div>

          <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #dee2e6" }}>
            <strong>触发器点击：</strong>
            <div style={{ fontWeight: "bold", marginTop: "5px", color: "#007bff" }}>
              {triggerClicks} 次
            </div>
          </div>

          <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #dee2e6" }}>
            <strong>菜单项点击：</strong>
            <div style={{ fontWeight: "bold", marginTop: "5px", color: "#28a745" }}>
              {itemClicks} 次
            </div>
          </div>
        </div>

        {menuPosition.top > 0 && (
          <div style={{
            padding: "8px 12px",
            backgroundColor: "#d1ecf1",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#0c5460",
            marginTop: "10px"
          }}>
            <strong>📍 菜单位置：</strong> top: {Math.round(menuPosition.top)}px, left: {Math.round(menuPosition.left)}px
          </div>
        )}
      </div>

      {/* 配置测试 */}
      <div style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "15px", color: "#495057" }}>⚙️ 配置测试</h4>

        {testConfigurations.map((config, index) => (
          <div key={index} style={{ marginBottom: "25px" }}>
            <h5 style={{ marginBottom: "10px", color: "#6c757d" }}>{config.name}</h5>
            <DropdownMenu>
              {config.trigger}
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleItemClick(`${config.name} - 选项 1`)}>
                  {config.name} 选项 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleItemClick(`${config.name} - 选项 2`)}>
                  {config.name} 选项 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleItemClick(`${config.name} - 选项 3`)}>
                  {config.name} 选项 3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* 调试日志 */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px", color: "#495057" }}>📝 调试日志</h4>
        <div style={{
          backgroundColor: "#212529",
          color: "#fff",
          padding: "15px",
          borderRadius: "8px",
          fontFamily: "'Monaco', 'Consolas', monospace",
          fontSize: "12px",
          maxHeight: "300px",
          overflowY: "auto"
        }}>
          {debugLogs.length > 0 ? (
            debugLogs.map((log, index) => (
              <div key={index} style={{ marginBottom: "4px", borderBottom: "1px solid #495057", paddingBottom: "4px" }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: "#adb5bd", fontStyle: "italic" }}>
              等待事件触发...
            </div>
          )}
        </div>
      </div>

      {/* 诊断指南 */}
      <div style={{
        padding: "20px",
        backgroundColor: "#fff3cd",
        border: "2px solid #ffeaa7",
        borderRadius: "12px"
      }}>
        <h4 style={{ marginBottom: "15px", color: "#856404" }}>🔍 诊断指南</h4>

        <div style={{ marginBottom: "15px" }}>
          <h5 style={{ color: "#0f5132", marginBottom: "8px" }}>📋 预期结果分析：</h5>
          <ul style={{ margin: "0", paddingLeft: "20px" }}>
            <li>如果 <strong>基础配置</strong> 工作但其他不工作 → asChild 或 Button 组件问题</li>
            <li>如果 <strong>Portal 状态</strong> 显示失败 → Radix UI Portal 配置问题</li>
            <li>如果 <strong>菜单位位置</strong> 显示异常 → CSS 定位或 z-index 问题</li>
            <li>如果 <strong>触发器点击</strong> 有计数但菜单不开 → DropdownMenu 内部逻辑问题</li>
          </ul>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h5 style={{ color: "#0f5132", marginBottom: "8px" }}>🚨 常见问题及解决方案：</h5>
          <div style={{ backgroundColor: "white", padding: "12px", borderRadius: "8px", marginBottom: "10px" }}>
            <strong>问题 1: DropdownMenu 不弹出</strong>
            <ul style={{ margin: "8px 0", paddingLeft: "15px", fontSize: "13px" }}>
              <li>检查 z-index 是否被遮挡</li>
              <li>验证 Portal 是否正常渲染</li>
              <li>检查 CSS overflow 或 position 设置</li>
            </ul>
          </div>

          <div style={{ backgroundColor: "white", padding: "12px", borderRadius: "8px" }}>
            <strong>问题 2: 菜单项点击无反应</strong>
            <ul style={{ margin: "8px 0", paddingLeft: "15px", fontSize: "13px" }}>
              <li>检查 onClick 事件是否正确绑定</li>
              <li>验证事件冒泡是否被阻止</li>
              <li>检查是否有其他事件监听器干扰</li>
            </ul>
          </div>

          <div style={{ backgroundColor: "white", padding: "12px", borderRadius: "8px" }}>
            <strong>问题 3: Portal 渲染异常</strong>
            <ul style={{ margin: "8px 0", paddingLeft: "15px", fontSize: "13px" }}>
              <li>检查 Radix UI 版本兼容性</li>
              <li>验证文档结构是否正确</li>
              <li>检查是否有样式冲突</li>
            </ul>
          </div>
        </div>

        <div style={{
          padding: "10px 15px",
          backgroundColor: "#d4edda",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#155724",
          fontWeight: "500"
        }}>
          <Zap style={{ display: "inline-block", marginRight: "8px" }} />
          <strong>重要提示：</strong> 这个调试组件提供了详细的状态监控和日志输出，可以帮助精确定位 DropdownMenu 的具体问题所在。
        </div>
      </div>
    </div>
  );
}