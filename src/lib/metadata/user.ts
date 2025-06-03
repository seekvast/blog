import { createMetadata } from './factory';
import { getFallbackImage } from './utils';

type User = {
  username: string;
  avatar_url?: string;
  bio?: string;
  latest_post?: {
    title: string;
    content: string;
  };
  latest_comment?: {
    content: string;
  };
};

export const getUserMetadata = (user: User, locale?: string) => {
  const description = user.latest_post?.title || 
                      user.latest_comment?.content || 
                      user.bio || 
                      `${user.username}的个人主页`;

  return createMetadata({
    title: user.username,
    description: description.substring(0, 160),
    image: getFallbackImage([user.avatar_url]),
    type: 'profile',
    locale,
  });
};
