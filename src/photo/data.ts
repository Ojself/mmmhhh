import {
  getPhotosCountCached,
  getUniqueQueensCached,
} from '@/photo/cache';
import { QUEEN_FAVS } from '@/queen';

export const getPhotoSidebarDataCached = () => [
  getPhotosCountCached(),
  getUniqueQueensCached().then(queens =>
    queens.filter(({ queen }) => queen === QUEEN_FAVS).concat(
      queens.filter(({ queen }) => queen !== QUEEN_FAVS))),
  [],
] as const;
