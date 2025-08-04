// 设计系统常量
export const DESIGN_TOKENS = {
  // 间距系统
  spacing: {
    section: "py-4",
    sectionBorder: "border-b",
    titleMargin: "mb-4",
    contentGap: "gap-4",
    itemSpacing: "space-y-4",
    scrollMargin: "[scroll-margin-top:80px]",
  },

  // 字体系统
  typography: {
    sectionTitle: "text-xl font-semibold",
    itemTitle: "text-base font-medium",
    description: "text-sm text-muted-foreground mt-1",
    label: "text-base font-medium",
  },

  // 交互系统
  interaction: {
    button:
      "w-full cursor-pointer text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
    buttonPadding: "py-3",
    roundedButton: "p-2 rounded-lg",
    icon: "h-4 w-4 text-muted-foreground flex-shrink-0",
  },

  // 布局系统
  layout: {
    flexBetween: "flex items-center justify-between",
    flexBetweenGap: "flex items-center justify-between gap-4",
    flexStart: "flex items-center gap-2",
    flex1: "flex-1",
  },

  // 颜色语义
  colors: {
    muted: "text-muted-foreground",
    mutedBg: "bg-muted",
  },
} as const;

// 组合样式生成器
export const combineClasses = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};
