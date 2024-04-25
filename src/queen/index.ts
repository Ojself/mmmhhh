import {
  Photo,
  PhotoDateRange,
  descriptionForPhotoSet,
  photoQuantityText,
} from '@/photo';
import {
  absolutePathForQueen,
  absolutePathForQueenImage,
  getPathComponents,
} from '@/site/paths';
import { capitalizeWords, convertStringToArray } from '@/utility/string';

export const QUEEN_FAVS = 'favs';

export type Queens = {
  queen: string
  count: number
}[]

export const formatQueen = (queen?: string) =>
  capitalizeWords(queen?.replaceAll('-', ' '));

export const doesQueensStringIncludeFavs = (queens?: string) =>
  convertStringToArray(queens)?.some(queen => isQueenFavs(queen));

export const titleForQueen = (
  queen: string,
  photos:Photo[],
  explicitCount?: number,
) => [
  formatQueen(queen),
  photoQuantityText(explicitCount ?? photos.length),
].join(' ');

export const sortQueens = (
  queens: string[],
  queenToHide?: string,
) => queens
  .filter(queen => queen !== queenToHide)
  .sort((a, b) => isQueenFavs(a) ? -1 : a.localeCompare(b));

export const sortQueensObject = (
  queens: Queens,
  queenToHide?: string,
) => queens
  .filter(({ queen }) => queen!== queenToHide)
  .sort(({ queen: a }, { queen: b }) => isQueenFavs(a) ? -1 : a.localeCompare(b));

export const sortQueensWithoutFavs = (queens: string[]) =>
  sortQueens(queens, QUEEN_FAVS);

export const sortQueensObjectWithoutFavs = (queens: Queens) =>
  sortQueensObject(queens, QUEEN_FAVS);

export const descriptionForqueenedPhotos = (
  photos: Photo[],
  dateBased?: boolean,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRange,
) =>
  descriptionForPhotoSet(
    photos,
    'queened',
    dateBased,
    explicitCount,
    explicitDateRange,
  );

export const generateMetaForQueen = (
  queen: string,
  photos: Photo[],
  explicitCount?: number,
  explicitDateRange?: PhotoDateRange,
) => ({
  url: absolutePathForQueen(queen),
  title: titleForQueen(queen, photos, explicitCount),
  description:
    descriptionForqueenedPhotos(photos, true, explicitCount, explicitDateRange),
  images: absolutePathForQueenImage(queen),
});

export const isQueenFavs = (queen: string) => queen.toLowerCase() === QUEEN_FAVS;

export const isPhotoFav = ({ queens }: Photo) => queens.some(isQueenFavs);

export const isPathFavs = (pathname?: string) =>
  getPathComponents(pathname).queen === QUEEN_FAVS;
