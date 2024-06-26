import { SHOW_EXIF_DATA } from '@/site/config';
import { ABSOLUTE_PATH_FOR_HOME_IMAGE } from '@/site/paths';
import { formatDateFromPostgresString } from '@/utility/date';
import camelcaseKeys from 'camelcase-keys';
import type { Metadata } from 'next';

export const GRID_THUMBNAILS_TO_SHOW_MAX = 12;

export const ACCEPTED_PHOTO_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
];

export const MAX_PHOTO_UPLOAD_SIZE_IN_BYTES = 50_000_000;

// Core EXIF data
export interface PhotoExif {
  aspectRatio: number
  latitude?: number
  longitude?: number
  queens?: string[]
  takenAt?: string
  takenAtNaive?: string
}

// Raw db insert
export interface PhotoDbInsert extends PhotoExif {
  id: string
  url: string
  extension: string
  blurData?: string
  title?: string
  caption?: string
  semanticDescription?: string
  locationName?: string
  priorityOrder?: number
  hidden?: boolean
  takenAt: string
  takenAtNaive: string
}

// Raw db response
export interface PhotoDb extends Omit<PhotoDbInsert, 'takenAt' | 'queens'> {
  updatedAt: Date
  createdAt: Date
  takenAt: Date
  queens: string[]
}

// Parsed db response
export interface Photo extends PhotoDb {
  focalLengthFormatted?: string
  focalLengthIn35MmFormatFormatted?: string
  fNumberFormatted?: string
  isoFormatted?: string
  takenAtNaiveFormatted: string
}

export const parsePhotoFromDb = (photoDbRaw: PhotoDb): Photo => {
  const photoDb = camelcaseKeys(
    photoDbRaw as unknown as Record<string, unknown>
  ) as unknown as PhotoDb;
  return {
    ...photoDb,
    queens: photoDb.queens ?? [],
    takenAtNaiveFormatted:
      formatDateFromPostgresString(photoDb.takenAtNaive),
  };
};

export const parseCachedPhotoDates = (photo: Photo) => ({
  ...photo,
  takenAt: new Date(photo.takenAt),
  updatedAt: new Date(photo.updatedAt),
  createdAt: new Date(photo.createdAt),
} as Photo);

export const parseCachedPhotosDates = (photos: Photo[]) =>
  photos.map(parseCachedPhotoDates);

export const convertPhotoToPhotoDbInsert = (
  photo: Photo,
): PhotoDbInsert => ({
  ...photo,
  takenAt: photo.takenAt.toISOString(),
});

export const photoStatsAsString = (photo: Photo) => [
  photo.focalLengthFormatted,
  photo.fNumberFormatted,
  photo.isoFormatted,
].join(' ');

export const descriptionForPhoto = (photo: Photo) =>
  photo.takenAtNaiveFormatted?.toUpperCase();

export const getPreviousPhoto = (photo: Photo, photos: Photo[]) => {
  const index = photos.findIndex(p => p.id === photo.id);
  return index > 0
    ? photos[index - 1]
    : undefined;
};

export const getNextPhoto = (photo: Photo, photos: Photo[]) => {
  const index = photos.findIndex(p => p.id === photo.id);
  return index < photos.length - 1
    ? photos[index + 1]
    : undefined;
};

export const generateOgImageMetaForPhotos = (photos: Photo[]): Metadata => {
  if (photos.length > 0) {
    return {
      openGraph: {
        images: ABSOLUTE_PATH_FOR_HOME_IMAGE,
      },
      twitter: {
        card: 'summary_large_image',
        images: ABSOLUTE_PATH_FOR_HOME_IMAGE,
      },
    };
  } else {
    // If there are no photos, refrain from showing an OG image
    return {};
  }
};

const PHOTO_ID_FORWARDING_TABLE: Record<string, string> = JSON.parse(
  process.env.PHOTO_ID_FORWARDING_TABLE || '{}'
);

export const translatePhotoId = (id: string) =>
  PHOTO_ID_FORWARDING_TABLE[id] || id;

export const titleForPhoto = (photo: Photo) =>
  photo.title || 'Untitled';

export const altTextForPhoto = (photo: Photo) =>
  photo.semanticDescription || titleForPhoto(photo);

export const photoLabelForCount = (count: number) =>
  count === 1 ? 'Photo' : 'Photos';

export const photoQuantityText = (count: number, includeParentheses = true) =>
  includeParentheses
    ? `(${count} ${photoLabelForCount(count)})`
    : `${count} ${photoLabelForCount(count)}`;  

export const deleteConfirmationTextForPhoto = (photo: Photo) =>
  `Are you sure you want to delete "${titleForPhoto(photo)}?"`;

export type PhotoDateRange = { start: string, end: string };

export const descriptionForPhotoSet = (
  photos:Photo[],
  descriptor?: string,
  dateBased?: boolean,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRange,
) =>
  dateBased
    ? dateRangeForPhotos(photos, explicitDateRange).description.toUpperCase()
    : [
      explicitCount ?? photos.length,
      descriptor,
      photoLabelForCount(explicitCount ?? photos.length),
    ].join(' ');

const sortPhotosByDate = (
  photos: Photo[],
  order: 'ASC' | 'DESC' = 'DESC'
) =>
  [...photos].sort((a, b) => order === 'DESC'
    ? b.takenAt.getTime() - a.takenAt.getTime()
    : a.takenAt.getTime() - b.takenAt.getTime());

export const dateRangeForPhotos = (
  photos: Photo[] = [],
  explicitDateRange?: PhotoDateRange,
) => {
  let start = '';
  let end = '';
  let description = '';

  if (explicitDateRange || photos.length > 0) {
    const photosSorted = sortPhotosByDate(photos);
    start = formatDateFromPostgresString(
      explicitDateRange?.start ?? photosSorted[photos.length - 1].takenAtNaive,
      true,
    );
    end = formatDateFromPostgresString(
      explicitDateRange?.end ?? photosSorted[0].takenAtNaive,
      true
    );
    description = start === end
      ? start
      : `${start}–${end}`;
  }

  return { start, end, description };
};

const photoHasExifData = (photo: Photo) =>
  Boolean(photo.fNumberFormatted) ||
  Boolean(photo.isoFormatted);

export const shouldShowCameraDataForPhoto = () => false;

export const shouldShowExifDataForPhoto = (photo: Photo) =>
  SHOW_EXIF_DATA && photoHasExifData(photo);

export const getKeywordsForPhoto = (photo: Photo) =>
  (photo.caption ?? '').split(' ')
    .concat((photo.semanticDescription ?? '').split(' '))
    .filter(Boolean)
    .map(keyword => keyword.toLocaleLowerCase());
