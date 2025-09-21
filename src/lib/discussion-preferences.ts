import Cookies from "js-cookie";
import { SortBy, DisplayMode } from "@/types/display-preferences";

export const DISCUSSION_PREFERENCES_COOKIE_KEY = "discussion_preferences";

type PagePreferences = {
  sort?: SortBy;
  display?: DisplayMode;
};

type AllPreferences = Record<string, PagePreferences>;

// Reads the entire preference object from the cookie
export function getDiscussionPreferencesFromCookie(): AllPreferences {
  const cookie = Cookies.get(DISCUSSION_PREFERENCES_COOKIE_KEY);
  if (!cookie) return {};
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return {};
  }
}

// Writes a specific page's preference to the cookie
export function syncDiscussionPreferencesToCookie(
  pageId: string,
  prefs: Partial<PagePreferences>
) {
  if (!pageId) return;

  const currentPrefs = getDiscussionPreferencesFromCookie();
  const newPagePrefs = { ...currentPrefs[pageId], ...prefs };

  const newAllPrefs = {
    ...currentPrefs,
    [pageId]: newPagePrefs,
  };

  Cookies.set(DISCUSSION_PREFERENCES_COOKIE_KEY, JSON.stringify(newAllPrefs), {
    expires: 365,
  });
}

// These validators remain the same
export function getValidSortBy(sort?: string | null): SortBy {
  if (sort === "hot" || sort === "newest" || sort === "last") {
    return sort;
  }
  return "hot";
}

export function getValidDisplayMode(display?: string | null): DisplayMode {
  if (display === "grid" || display === "list") {
    return display;
  }
  return "list";
}
