import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 获取光标在文本区域中的坐标
export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const { offsetLeft, offsetTop, scrollLeft, scrollTop } = element;
  const div = document.createElement("div");
  const styles = getComputedStyle(element);
  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
  ];

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  properties.forEach((prop) => {
    const value = styles[prop as keyof CSSStyleDeclaration];
    if (value && typeof value === "string") {
      div.style.setProperty(prop, value);
    }
  });

  div.textContent = element.value.slice(0, position);
  document.body.appendChild(div);

  const span = document.createElement("span");
  span.textContent = element.value.slice(position) || ".";
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop - scrollTop,
    left: span.offsetLeft - scrollLeft,
  };

  document.body.removeChild(div);
  return coordinates;
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
