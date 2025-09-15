import { useTranslation } from "react-i18next";

import { fallbackLng } from "@/i18n/settings"; 

export const formatCompactNumber = (value: number, locale?: string): string => {
  try {
    const numberFormat = new Intl.NumberFormat(locale || fallbackLng, {
      notation: "compact",
      compactDisplay: "short",
    });
    return numberFormat.format(value);
  } catch (error) {
    if (error instanceof RangeError) {
      if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(1) + 'M';
      }
      if (value >= 1_000) {
        return (value / 1_000).toFixed(1) + 'K';
      }
      return value.toString();
    }
    throw error;
  }
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};


export const useCompactNumberFormat = () => {
  const { i18n } = useTranslation();
  
  return (value: number): string => {
    return formatCompactNumber(value, i18n.language);
  };
};
