import {
  getPhotosCountCached,
  getUniqueCamerasCached,
  getUniqueTagsCached,
} from '@/photo/cache';
import { TAG_FAVS } from '@/tag';

export const getPhotoSidebarDataCached = () => [
  getPhotosCountCached(),
  getUniqueTagsCached().then(tags =>
    tags.filter(({ tag }) => tag === TAG_FAVS).concat(
      tags.filter(({ tag }) => tag !== TAG_FAVS))),
  getUniqueCamerasCached(),
  [],
] as const;
