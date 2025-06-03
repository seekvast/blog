import { createMetadata } from './factory';

export const getFollowingMetadata = (locale?: string) => {
  return createMetadata({
    title: "关注",
    locale,
  });
};
