import { useState, useEffect } from "react";
import type { Mentionable, MentionableItem } from "@/lib/mentions/types";

interface UseMentionableOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useMentionable<T extends MentionableItem>(
  mentionable: Mentionable<T>,
  query: string,
  options: UseMentionableOptions = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      if (!options.enabled) return;

      try {
        setIsLoading(true);
        setError(null);
        const results = await mentionable.search(query);

        if (isMounted) {
          setItems(results);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch items");

        if (isMounted) {
          setError(error);
          options.onError?.(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, [query, mentionable, options.enabled, options.onError]);

  return {
    items,
    isLoading,
    error,
    isEmpty: !isLoading && items.length === 0,
  };
}
