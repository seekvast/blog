export type DisplayMode = "list" | "grid";
export type SortBy = "hot" | "newest" | "last";

export interface DisplayPreferences {
  displayMode: DisplayMode;
  sortBy: SortBy;
}
