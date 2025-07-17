/**
 * 检测用户是否在台北时区
 * @returns 是否为台北时区
 */
export function isTaipeiTimezone(): boolean {
  if (typeof window === "undefined") {
    return false; // 服务端渲染时默认为 false
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone === "Asia/Taipei";
  } catch (error) {
    console.warn("无法检测时区:", error);
    return false;
  }
}

/**
 * 获取用户当前时区
 * @returns 时区字符串
 */
export function getUserTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn("无法获取时区:", error);
    return "UTC";
  }
}
