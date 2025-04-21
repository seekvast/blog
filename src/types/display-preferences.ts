export type DisplayMode = "list" | "grid";
export type SortBy = "hot" | "create" | "reply";

export interface DisplayPreferences {
  displayMode: DisplayMode;
  sortBy: SortBy;
}
