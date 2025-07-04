export const getFallbackImage = (images: (string | null | undefined)[]) => {
  return images.find(img => !!img) || '/logo-square.jpg';
};

export const getSeparator = () => ' - ';

/**
 * 去除字符串中的HTML标签
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};
