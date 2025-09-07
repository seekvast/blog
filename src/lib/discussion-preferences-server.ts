import { cookies } from "next/headers";
import {
  getValidSortBy,
  getValidDisplayMode,
  COOKIE_KEYS, 
} from "./discussion-preferences";

export function getDiscussionPreferences() {
  const cookieStore = cookies();

  const sortCookie = cookieStore.get(COOKIE_KEYS.DISCUSSION_SORT);
  const displayCookie = cookieStore.get(COOKIE_KEYS.DISCUSSION_DISPLAY);

  return {
    sort: getValidSortBy(sortCookie?.value),
    display: getValidDisplayMode(displayCookie?.value),
  };
}