import type { User } from "@/types/common";
import type { Mentionable, MentionableItem } from "./types";
import { api } from "@/lib/api";

const MAX_RESULTS = 5;

export function createUserMention(): Mentionable<User> {
  return {
    search: async (query: string) => {
      const { items } = await api.users.list({
        search: query,
        limit: MAX_RESULTS,
      });
      return items;
    },

    format: (user: User) => `@"${user.username}"#${user.id} `,

    matches: (user: User, query: string) =>
      user.username.toLowerCase().includes(query.toLowerCase()),
  };
}
