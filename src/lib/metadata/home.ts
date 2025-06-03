import { createMetadata } from './factory';

export const getHomeMetadata = (locale?: string) => {
  return createMetadata({
    locale,
  });
};
