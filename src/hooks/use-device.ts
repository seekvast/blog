import { useState, useEffect } from 'react';

// 定义断点，与 Tailwind 保持一致
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useDevice(): DeviceInfo {
  // 初始状态设置为服务器端的默认值
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: true, // 默认为移动端，确保首次渲染是移动优先
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    // 更新设备信息
    function updateDeviceInfo() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDeviceInfo({
        isMobile: width < breakpoints.md,  // < 768px
        isTablet: width >= breakpoints.md && width < breakpoints.lg,  // >= 768px && < 1024px
        isDesktop: width >= breakpoints.lg, // >= 1024px
        width,
        height,
      });
    }

    // 初始化
    updateDeviceInfo();

    // 添加 resize 事件监听
    window.addEventListener('resize', updateDeviceInfo);

    // 清理事件监听
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

// 导出断点常量，方便其他地方使用
export const BREAKPOINTS = breakpoints;
