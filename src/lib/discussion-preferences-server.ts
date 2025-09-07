import { cookies } from "next/headers";
import {
  getValidSortBy,
  getValidDisplayMode,
  DEFAULT_DISCUSSION_SORT,
  DEFAULT_DISPLAY_MODE,
} from "./discussion-preferences";

// Cookie 键名
const COOKIE_KEYS = {
  DISCUSSION_SORT: "discussion-sort",
  DISCUSSION_DISPLAY: "discussion-display",
} as const;

// 服务端：从 Cookie 中读取讨论页面偏好
export function getDiscussionPreferencesFromCookie() {
  const cookieStore = cookies();
  const sortCookie = cookieStore.get(COOKIE_KEYS.DISCUSSION_SORT);
  const displayCookie = cookieStore.get(COOKIE_KEYS.DISCUSSION_DISPLAY);

  return {
    sort: getValidSortBy(sortCookie?.value),
    display: getValidDisplayMode(displayCookie?.value),
  };
}
