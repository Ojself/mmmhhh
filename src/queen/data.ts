import {
  getPhotosCached,
  getPhotosQueenCountCached,
  getPhotosQueenDateRangeCached,
} from '@/photo/cache';
import {
  PaginationSearchParams,
  getPaginationForSearchParams,
} from '@/site/pagination';
import { pathForQueen } from '@/site/paths';

export const getPhotosQueenDataCached = ({
  queen,
  limit,
}: {
  queen: string,
  limit?: number,
}) =>
  Promise.all([
    getPhotosCached({ queen, limit }),
    getPhotosQueenCountCached(queen),
    getPhotosQueenDateRangeCached(queen),
  ]);

export const getPhotosQueenDataCachedWithPagination = async ({
  queen,
  limit: limitProp,
  searchParams,
}: {
  queen: string,
  limit?: number,
  searchParams?: PaginationSearchParams,
}) => {
  const { offset, limit } = getPaginationForSearchParams(searchParams);

  const [photos, count, dateRange] =
    await getPhotosQueenDataCached({
      queen,
      limit: limitProp ?? limit,
    });

  const showMorePath = count > photos.length
    ? pathForQueen(queen, offset + 1)
    : undefined;

  return {
    photos,
    count,
    dateRange,
    showMorePath,
  };
};
