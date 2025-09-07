import { getSiteConfig } from '@/config/site';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteConfig = getSiteConfig();

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
    },
  ];
}
