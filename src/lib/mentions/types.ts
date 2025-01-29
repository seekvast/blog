export interface MentionableItem {
  id: string | number;
  name: string;
  avatar?: string;
  description?: string;
}

export interface Mentionable<T extends MentionableItem> {
  search: (query: string) => Promise<T[]>;
  format: (item: T) => string;
  matches: (item: T, query: string) => boolean;
}
