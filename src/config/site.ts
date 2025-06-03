export type SiteConfig = {
  name: string;
  url: string;
  defaultLocale: string;
};

const siteConfig: SiteConfig = {
  name: "Kater",
  url: "https://kater.example.com",
  defaultLocale: "zh-TW",
};

export const getSiteConfig = () => siteConfig;
