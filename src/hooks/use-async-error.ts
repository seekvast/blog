"use client";

import * as React from "react";

export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback(async <T>(
    promise: Promise<T>
  ): Promise<T> => {
    try {
      return await promise;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, []);

  return {
    error,
    handleError,
    clearError: () => setError(null),
  };
} 