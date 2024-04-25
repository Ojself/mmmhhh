import type { ExifData } from 'ts-exif-parser';
import { Photo, PhotoDbInsert, PhotoExif } from '..';
import {
  convertTimestampToNaivePostgresString,
  convertTimestampWithOffsetToPostgresString,
  generateLocalNaivePostgresString,
  generateLocalPostgresString,
} from '@/utility/date';
import { getAspectRatioFromExif, getOffsetFromExif } from '@/utility/exif';
import { toFixedNumber } from '@/utility/number';
import { convertStringToArray } from '@/utility/string';
import { generateNanoid } from '@/utility/nanoid';
import {
  BLUR_ENABLED,
  GEO_PRIVACY_ENABLED,
} from '@/site/config';
import { QUEEN_FAVS, doesQueensStringIncludeFavs } from '@/queen';

type VirtualFields = 'favorite';

export type PhotoFormData = Record<keyof PhotoDbInsert | VirtualFields, string>;

export type FieldSetType =
  'text' |
  'email' |
  'password' |
  'checkbox' |
  'textarea';

export type AnnotatedQueen = {
  value: string,
  annotation?: string,
  annotationAria?: string,
};

type FormMeta = {
  label: string
  note?: string
  required?: boolean
  virtual?: boolean
  readOnly?: boolean
  validate?: (value?: string) => string | undefined
  validateStringMaxLength?: number
  capitalize?: boolean
  hide?: boolean
  hideIfEmpty?: boolean
  shouldHide?: (formData: Partial<PhotoFormData>) => boolean
  loadingMessage?: string
  type?: FieldSetType
  selectOptions?: { value: string, label: string }[]
  selectOptionsDefaultLabel?: string
  queenOptions?: AnnotatedQueen[]
};

const STRING_MAX_LENGTH_SHORT = 255;
const STRING_MAX_LENGTH_LONG  = 1000;

const FORM_METADATA = (
  queenOptions?: AnnotatedQueen[],
  aiTextGeneration?: boolean,
): Record<keyof PhotoFormData, FormMeta> => ({
  title: {
    label: 'title',
    capitalize: true,
    validateStringMaxLength: STRING_MAX_LENGTH_SHORT,
  },
  caption: {
    label: 'caption',
    capitalize: true,
    validateStringMaxLength: STRING_MAX_LENGTH_LONG,
    shouldHide: ({ title, caption }) =>
      !aiTextGeneration && (!title && !caption),
  },
  queens: {
    label: 'queens',
    queenOptions,
    validate: queens => doesQueensStringIncludeFavs(queens)
      ? `'${QUEEN_FAVS}' is a reserved queen`
      : undefined,
  },
  semanticDescription: {
    type: 'textarea',
    label: 'semantic description (not visible)',
    capitalize: true,
    validateStringMaxLength: STRING_MAX_LENGTH_LONG,
    hide: !aiTextGeneration,
  },
  id: { label: 'id', readOnly: true, hideIfEmpty: true },
  blurData: {
    label: 'blur data',
    readOnly: true,
    required: BLUR_ENABLED,
    hideIfEmpty: !BLUR_ENABLED,
    loadingMessage: 'Generating blur data ...',
  },
  url: { label: 'url', readOnly: true },
  extension: { label: 'extension', readOnly: true },
  aspectRatio: { label: 'aspect ratio', readOnly: true },
  
  locationName: { label: 'location name', hide: false },
  latitude: { label: 'latitude' },
  longitude: { label: 'longitude' },
  takenAt: { label: 'taken at' },
  takenAtNaive: { label: 'taken at (naive)' },
  priorityOrder: { label: 'priority order' },
  favorite: { label: 'favorite', type: 'checkbox', virtual: true },
  hidden: { label: 'hidden', type: 'checkbox' },
});

export const FORM_METADATA_ENTRIES = (
  ...args: Parameters<typeof FORM_METADATA>
) =>
  (Object.entries(FORM_METADATA(...args)) as [keyof PhotoFormData, FormMeta][])
    .filter(([_, meta]) => !meta.hide);

export const convertFormKeysToLabels = (keys: (keyof PhotoFormData)[]) =>
  keys.map(key => FORM_METADATA()[key].label.toUpperCase());

export const getFormErrors = (
  formData: Partial<PhotoFormData>
): Partial<Record<keyof PhotoFormData, string>> =>
  Object.keys(formData).reduce((acc, key) => ({
    ...acc,
    [key]: FORM_METADATA_ENTRIES().find(([k]) => k === key)?.[1]
      .validate?.(formData[key as keyof PhotoFormData]),
  }), {});

export const isFormValid = (formData: Partial<PhotoFormData>) =>
  FORM_METADATA_ENTRIES().every(
    ([key, { required, validate, validateStringMaxLength }]) =>
      (!required || Boolean(formData[key])) &&
      (validate?.(formData[key]) === undefined) &&
      // eslint-disable-next-line max-len
      (!validateStringMaxLength || (formData[key]?.length ?? 0) <= validateStringMaxLength) &&
      (key !== 'queens' || !doesQueensStringIncludeFavs(formData.queens ?? ''))
  );

export const formHasTextContent = ({
  title,
  caption,
  queens,
  semanticDescription,
}: Partial<PhotoFormData>) =>
  Boolean(title || caption || queens || semanticDescription);

// CREATE FORM DATA: FROM PHOTO

export const convertPhotoToFormData = (
  photo: Photo,
): PhotoFormData => {
  const valueForKey = (key: keyof Photo, value: any) => {
    switch (key) {
    case 'queens':
      return (value ?? [])
        .filter((queen: string) => queen !== QUEEN_FAVS)
        .join(', ');
    case 'takenAt':
      return value?.toISOString ? value.toISOString() : value;
    case 'hidden':
      return value ? 'true' : 'false';
    default:
      return value !== undefined && value !== null
        ? value.toString()
        : undefined;
    }
  };
  return Object.entries(photo).reduce((photoForm, [key, value]) => ({
    ...photoForm,
    [key]: valueForKey(key as keyof Photo, value),
  }), {
    favorite: photo.queens.includes(QUEEN_FAVS) ? 'true' : 'false',
  } as PhotoFormData);
};

// CREATE FORM DATA: FROM EXIF

export const convertExifToFormData = (
  data: any,
): Omit<
  Record<keyof PhotoExif, string | undefined>,
  'takenAt' | 'takenAtNaive'
> => ({
  aspectRatio: getAspectRatioFromExif(data).toString(),
  latitude:
    !GEO_PRIVACY_ENABLED ? data.queens?.GPSLatitude?.toString() : undefined,
  longitude:
    !GEO_PRIVACY_ENABLED ? data.queens?.GPSLongitude?.toString() : undefined,
  ...data.queens?.DateTimeOriginal && {
    takenAt: convertTimestampWithOffsetToPostgresString(
      data.queens.DateTimeOriginal,
      getOffsetFromExif(data),
    ),
    takenAtNaive:
      convertTimestampToNaivePostgresString(data.queens.DateTimeOriginal),
  },
});

// PREPARE FORM FOR DB INSERT

export const convertFormDataToPhotoDbInsert = (
  formData: FormData | PhotoFormData,
  generateId?: boolean,
): PhotoDbInsert => {
  const photoForm = formData instanceof FormData
    ? Object.fromEntries(formData) as PhotoFormData
    : formData;

  const queens = convertStringToArray(photoForm.queens) ?? [];
  if (photoForm.favorite === 'true') {
    queens.push(QUEEN_FAVS);
  }
  
  // Parse FormData:
  // - remove server action ID
  // - remove empty strings
  Object.keys(photoForm).forEach(key => {
    if (
      key.startsWith('$ACTION_ID_') ||
      (photoForm as any)[key] === '' ||
      FORM_METADATA()[key as keyof PhotoFormData]?.virtual
    ) {
      delete (photoForm as any)[key];
    }
  });

  return {
    ...(photoForm as PhotoFormData),
    ...(generateId && !photoForm.id) && { id: generateNanoid() },
    // Convert form strings to arrays
    queens: queens.length > 0 ? queens : undefined,
    // Convert form strings to numbers
    aspectRatio: toFixedNumber(parseFloat(photoForm.aspectRatio), 6),
    
    latitude: photoForm.latitude
      ? parseFloat(photoForm.latitude)
      : undefined,
    longitude: photoForm.longitude
      ? parseFloat(photoForm.longitude)
      : undefined,
    
    priorityOrder: photoForm.priorityOrder
      ? parseFloat(photoForm.priorityOrder)
      : undefined,
    hidden: photoForm.hidden === 'true',
    ...generateTakenAtFields(photoForm),
  };
};

export const getChangedFormFields = (
  original: Partial<PhotoFormData>,
  current: Partial<PhotoFormData>,
) => {
  return Object
    .keys(current)
    .filter(key =>
      (original[key as keyof PhotoFormData] ?? '') !==
      (current[key as keyof PhotoFormData] ?? '')
    ) as (keyof PhotoFormData)[];
};

export const generateTakenAtFields = (
  form?: Partial<PhotoFormData>
): { takenAt: string, takenAtNaive: string } => ({
  takenAt: form?.takenAt || generateLocalPostgresString(),
  takenAtNaive: form?.takenAtNaive || generateLocalNaivePostgresString(),
});
