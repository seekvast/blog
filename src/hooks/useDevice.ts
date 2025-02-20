import { useState, useEffect } from 'react';

// 定义断点
const breakpoints = {
  mobile: 640,    // sm
  tablet: 768,    // md
  desktop: 1024,  // lg
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
        isMobile: width < breakpoints.mobile,
        isTablet: width >= breakpoints.mobile && width < breakpoints.desktop,
        isDesktop: width >= breakpoints.desktop,
        width,
        height,
      });
    }

    // 初始化
    updateDeviceInfo();

    // 添加 resize 事件监听
    window.addEventListener('resize', updateDeviceInfo);

    // 清理函数
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

// 导出断点常量，方便其他地方使用
export const BREAKPOINTS = breakpoints;
