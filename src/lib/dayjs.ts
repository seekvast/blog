import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";

import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import "dayjs/locale/en";
import i18n from "@/i18n";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

dayjs.locale("zh-tw");

dayjs.updateLocale("zh-cn", {
  weekdays: [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ],
});

const mapLanguage = (i18nLang: string): string => {
  if (i18nLang.startsWith("zh-Hans") || i18nLang === "zh") {
    return "zh-cn";
  } else if (i18nLang.startsWith("zh-Hant") || i18nLang === "zh-TW") {
    return "zh-tw";
  } else if (i18nLang.startsWith("en")) {
    return "en";
  }
  return "zh-tw";
};

i18n.on("languageChanged", (lng) => {
  const dayjsLocale = mapLanguage(lng);
  dayjs.locale(dayjsLocale);
});

export const formatDate = (
  date: string | Date | number,
  format: string = "YYYY-MM-DD HH:mm:ss"
) => {
  return dayjs(date).format(format);
};

export const fromNow = (date: string | Date | number) => {
  return dayjs(date).fromNow();
};

export default dayjs;
