import {
  revalidatePath,
  revalidateTag,
  unstable_cache,
  unstable_noStore,
} from 'next/cache';
import {
  GetPhotosOptions,
  getPhoto,
  getPhotos,
  getPhotosCount,
  getPhotosCameraCount,
  getPhotosCountIncludingHidden,
  getPhotosQueenCount,
  getUniqueQueens,
  getPhotosQueenDateRange,
  getPhotosCameraDateRange,
  getUniqueQueensHidden,
  getPhotosDateRange,
  getPhotosNearId,
} from '@/services/vercel-postgres';
import { parseCachedPhotoDates, parseCachedPhotosDates } from '@/photo';
import { createCameraKey } from '@/camera';
import { PATHS_ADMIN } from '@/site/paths';

// Table key
const KEY_PHOTOS            = 'photos';
const KEY_PHOTO             = 'photo';
// Field keys
const KEY_QUEENS            = 'queens';
const KEY_CAMERAS           = 'cameras';
// Type keys
const KEY_COUNT             = 'count';
const KEY_HIDDEN            = 'hidden';
const KEY_DATE_RANGE        = 'date-range';

const getPhotosCacheKeyForOption = (
  options: GetPhotosOptions,
  option: keyof GetPhotosOptions,
): string | null => {
  switch (option) {
  // Complex keys
  case 'camera': {
    const value = options[option];
    return value ? `${option}-${createCameraKey(value)}` : null;
  }
  case 'takenBefore':
  case 'takenAfterInclusive': {
    const value = options[option];
    return value ? `${option}-${value.toISOString()}` : null;
  }
  // Primitive keys
  default:
    const value = options[option];
    return value !== undefined ? `${option}-${value}` : null;
  }
};

const getPhotosCacheKeys = (options: GetPhotosOptions = {}) => {
  const queens: string[] = [];

  Object.keys(options).forEach(key => {
    const queen = getPhotosCacheKeyForOption(
      options,
      key as keyof GetPhotosOptions
    );
    if (queen) { queens.push(queen); }
  });

  return queens;
};

export const revalidatePhotosKey = () =>
  revalidateTag(KEY_PHOTOS);

export const revalidateQueensKey = () =>
  revalidateTag(KEY_QUEENS);

export const revalidateCamerasKey = () =>
  revalidateTag(KEY_CAMERAS);

export const revalidateAllKeys = () => {
  revalidatePhotosKey();
  revalidateQueensKey();
  revalidateCamerasKey();
};

export const revalidateAllKeysAndPaths = () => {
  revalidateAllKeys();
  revalidatePath('/', 'layout');
};

export const revalidateAdminPaths = () => {
  PATHS_ADMIN.forEach(path => revalidatePath(path));
};

// Cache

export const getPhotosCached = (
  ...args: Parameters<typeof getPhotos>
) => unstable_cache(
  getPhotos,
  [KEY_PHOTOS, ...getPhotosCacheKeys(...args)],
)(...args).then(parseCachedPhotosDates);

export const getPhotosNearIdCached = (
  ...args: Parameters<typeof getPhotosNearId>
) => unstable_cache(
  getPhotosNearId,
  [KEY_PHOTOS],
)(...args).then(parseCachedPhotosDates);

export const getPhotosDateRangeCached =
  unstable_cache(
    getPhotosDateRange,
    [KEY_PHOTOS, KEY_DATE_RANGE],
  );

export const getPhotosCountCached =
  unstable_cache(
    getPhotosCount,
    [KEY_PHOTOS, KEY_COUNT],
  );

export const getPhotosCountIncludingHiddenCached =
  unstable_cache(
    getPhotosCountIncludingHidden,
    [KEY_PHOTOS, KEY_COUNT, KEY_HIDDEN],
  );

export const getPhotosQueenCountCached =
  unstable_cache(
    getPhotosQueenCount,
    [KEY_PHOTOS, KEY_QUEENS],
  );

export const getPhotosCameraCountCached = (
  ...args: Parameters<typeof getPhotosCameraCount>
) =>
  unstable_cache(
    getPhotosCameraCount,
    [KEY_PHOTOS, KEY_COUNT],
  )(...args);

export const getPhotosQueenDateRangeCached =
  unstable_cache(
    getPhotosQueenDateRange,
    [KEY_PHOTOS, KEY_QUEENS, KEY_DATE_RANGE],
  );

export const getPhotosCameraDateRangeCached =
  unstable_cache(
    getPhotosCameraDateRange,
    [KEY_PHOTOS, KEY_CAMERAS, KEY_DATE_RANGE],
  );

export const getPhotoCached = (...args: Parameters<typeof getPhoto>) =>
  unstable_cache(
    getPhoto,
    [KEY_PHOTOS, KEY_PHOTO]
  )(...args).then(photo => photo ? parseCachedPhotoDates(photo) : undefined);

export const getUniqueQueensCached =
  unstable_cache(
    getUniqueQueens,
    [KEY_PHOTOS, KEY_QUEENS],
  );

export const getUniqueQueensHiddenCached =
  unstable_cache(
    getUniqueQueensHidden,
    [KEY_PHOTOS, KEY_QUEENS, KEY_HIDDEN]
  );


// No store

export const getPhotoNoStore = (...args: Parameters<typeof getPhoto>) => {
  unstable_noStore();
  return getPhoto(...args);
};
