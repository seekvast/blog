'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在这里添加错误日志上报
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">出错了</h2>
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">错误信息:</p>
          <p className="mt-1 font-mono text-sm">{error.message}</p>
          {error.digest && (
            <p className="mt-1 font-mono text-sm">错误ID: {error.digest}</p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 text-left text-sm overflow-auto max-w-2xl max-h-48">
              {error.stack}
            </pre>
          )}
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={reset}
        >
          重试
        </button>
      </div>
    </div>
  );
}
