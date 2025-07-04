import { createMetadata } from './factory';
import { getFallbackImage, stripHtml } from './utils';

type Post = {
  title: string;
  content: string;
  cover_image?: string;
};

type Board = {
  name: string;
  avatar?: string;
};

export const getPostMetadata = (post: Post, board?: Board, locale?: string) => {
  const image = getFallbackImage([
    post.cover_image,
    board?.avatar,
    '/logo-square.jpg'
  ]);

  return createMetadata({
    title: post.title,
    description: stripHtml(post.content).substring(0, 300),
    image: image,
    type: 'article',
    locale,
  });
};
