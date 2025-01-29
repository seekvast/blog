interface CaretCoordinates {
  top: number;
  left: number;
}

export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): CaretCoordinates {
  const { scrollLeft, scrollTop } = element;
  // 创建一个临时的 div 来复制 textarea 的样式
  const div = document.createElement("div");
  const styles = window.getComputedStyle(element);

  // 复制所有影响文本布局的样式
  const styleProperties = [
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "letter-spacing",
    "line-height",
    "text-transform",
    "word-spacing",
    "padding-left",
    "padding-top",
    "border-left",
    "border-top",
    "width",
  ];

  styleProperties.forEach((prop) => {
    div.style[prop as any] = styles.getPropertyValue(prop);
  });

  // 设置基本样式
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "0";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";

  // 获取到光标位置的文本
  const text = element.value.substring(0, position);

  // 创建文本节点
  div.textContent = text;

  // 创建一个 span 来标记光标位置
  const span = document.createElement("span");
  span.textContent = "|";
  div.appendChild(span);

  // 将 div 添加到文档中以获取位置
  document.body.appendChild(div);

  // 获取 span 的位置
  const coordinates = span.getBoundingClientRect();

  // 清理
  document.body.removeChild(div);

  // 返回相对于 textarea 的坐标
  return {
    top: coordinates.top - element.getBoundingClientRect().top + scrollTop,
    left: coordinates.left - element.getBoundingClientRect().left + scrollLeft,
  };
}
