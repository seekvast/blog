import { useTranslation } from "react-i18next";

export const formatCompactNumber = (value: number, locale?: string): string => {
  const numberFormat = new Intl.NumberFormat(locale || "zh-Hans-CN", {
    notation: "compact",
    compactDisplay: "short",
  });
  
  return numberFormat.format(value);
};


export const useCompactNumberFormat = () => {
  const { i18n } = useTranslation();
  
  return (value: number): string => {
    return formatCompactNumber(value, i18n.language);
  };
};
