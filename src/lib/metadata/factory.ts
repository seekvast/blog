import { Metadata } from "next";
import { getSiteConfig } from "@/config/site";
import { getFallbackImage, getSeparator } from "./utils";

export type MetadataParams = {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
};

export const createMetadata = (params: MetadataParams = {}): Metadata => {
  const siteConfig = getSiteConfig();
  const locale = params.locale || siteConfig.defaultLocale;

  const separator = getSeparator();
  const defaultTitle = siteConfig.name;
  const defaultDescription = "Kater";
  const defaultImage = "/logo.svg";

  const title = params.title
    ? `${params.title}${separator}${defaultTitle}`
    : defaultTitle;

  return {
    title,
    description: params.description || defaultDescription,
    openGraph: {
      title,
      description: params.description || defaultDescription,
      type: params.type || "website",
      locale,
      siteName: siteConfig.name,
      images: [
        {
          url: getFallbackImage([params.image, defaultImage]),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: params.description || defaultDescription,
      images: [getFallbackImage([params.image, defaultImage])],
    },
  };
};
