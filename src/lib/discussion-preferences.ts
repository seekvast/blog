import { SortBy, DisplayMode } from "@/types/display-preferences";

// 默认偏好设置
export const DEFAULT_DISCUSSION_SORT: SortBy = "hot";
export const DEFAULT_DISPLAY_MODE: DisplayMode = "list";

// Cookie 键名
export const COOKIE_KEYS = {
  DISCUSSION_SORT: "discussion-sort",
  DISCUSSION_DISPLAY: "discussion-display",
} as const;


// 验证排序参数
export function getValidSortBy(sort?: string): SortBy {
  const validSorts: SortBy[] = ["hot", "newest", "last"];
  return validSorts.includes(sort as SortBy)
    ? (sort as SortBy)
    : DEFAULT_DISCUSSION_SORT;
}

// 验证显示模式参数
export function getValidDisplayMode(display?: string): DisplayMode {
  const validModes: DisplayMode[] = ["list", "grid"];
  return validModes.includes(display as DisplayMode)
    ? (display as DisplayMode)
    : DEFAULT_DISPLAY_MODE;
}

// 客户端：设置 Cookie
export function setDiscussionPreferenceCookie(
  name: string,
  value: string,
  days: number = 365
) {
  if (typeof window === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

// 客户端：同步偏好到 Cookie
export function syncDiscussionPreferencesToCookie(preferences: {
  sort?: SortBy;
  display?: DisplayMode;
}) {
  if (preferences.sort) {
    setDiscussionPreferenceCookie(
      COOKIE_KEYS.DISCUSSION_SORT,
      preferences.sort
    );
  }
  if (preferences.display) {
    setDiscussionPreferenceCookie(
      COOKIE_KEYS.DISCUSSION_DISPLAY,
      preferences.display
    );
  }
}

// 客户端：从 Cookie 中读取偏好
export function getDiscussionPreferencesFromClientCookie() {
  if (typeof window === "undefined") {
    return {
      sort: DEFAULT_DISCUSSION_SORT,
      display: DEFAULT_DISPLAY_MODE,
    };
  }

  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    sort: getValidSortBy(cookies[COOKIE_KEYS.DISCUSSION_SORT]),
    display: getValidDisplayMode(cookies[COOKIE_KEYS.DISCUSSION_DISPLAY]),
  };
}
