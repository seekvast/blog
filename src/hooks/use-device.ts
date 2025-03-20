import { useState, useEffect } from 'react';

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
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    updateDeviceInfo();

    window.addEventListener('resize', updateDeviceInfo);

    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

export const BREAKPOINTS = breakpoints;
