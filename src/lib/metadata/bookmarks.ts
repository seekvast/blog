import { createMetadata } from './factory';

export const getBookmarksMetadata = (locale?: string) => {
  return createMetadata({
    title: "书签",
    locale,
  });
};
