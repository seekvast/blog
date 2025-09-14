import React from "react";

const SettingsSkeleton: React.FC = () => {
  return (
    <div className="px-4 lg:py-4 lg:px-0">
      <div className="flex gap-8 relative">
        {/* 左侧导航骨架 */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="fixed w-60 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 右侧内容骨架 */}
        <div className="flex-1 space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b pb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
