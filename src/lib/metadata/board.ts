import { createMetadata } from './factory';
import { getFallbackImage } from './utils';

import { Board } from '@/types/board';

export const getBoardMetadata = (board: Board, locale?: string) => {
  return createMetadata({
    title: board.name,
    description: board.desc,
    image: getFallbackImage([board.avatar]),
    locale,
  });
};
