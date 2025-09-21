import { cookies } from "next/headers";
import { DISCUSSION_PREFERENCES_COOKIE_KEY } from "./discussion-preferences";
import { SortBy, DisplayMode } from "@/types/display-preferences";

type PagePreferences = {
  sort?: SortBy;
  display?: DisplayMode;
};

type AllPreferences = Record<string, PagePreferences>;

export function getDiscussionPreferences(): AllPreferences {
  const cookieStore = cookies();
  const cookie = cookieStore.get(DISCUSSION_PREFERENCES_COOKIE_KEY);

  if (!cookie?.value) {
    return {};
  }

  try {
    const value = JSON.parse(cookie.value);
    return value;
  } catch (error) {
    console.error("Failed to parse discussion preferences cookie:", error);
    return {};
  }
}
