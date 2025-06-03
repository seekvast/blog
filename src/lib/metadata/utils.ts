export const getFallbackImage = (images: (string | null | undefined)[]) => {
  return images.find(img => !!img) || '/logo-square.jpg';
};

export const getSeparator = () => ' - ';
