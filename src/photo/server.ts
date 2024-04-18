import {
  getExtensionFromStorageUrl,
  getIdFromStorageUrl,
} from '@/services/storage';
import { convertExifToFormData } from '@/photo/form';

import { ExifData, ExifParserFactory } from 'ts-exif-parser';
import { PhotoFormData } from './form';

export const extractExifDataFromBlobPath = async (
  blobPath: string,
  includeInitialPhotoFields?: boolean,
): Promise<{
  blobId?: string
  photoFormExif?: Partial<PhotoFormData>
}> => {
  const url = decodeURIComponent(blobPath);

  const blobId = getIdFromStorageUrl(url);

  const extension = getExtensionFromStorageUrl(url);

  const fileBytes = blobPath
    ? await fetch(url)
      .then(res => res.arrayBuffer())
    : undefined;

  let exifData: ExifData | undefined;

  if (fileBytes) {
    const parser = ExifParserFactory.create(Buffer.from(fileBytes));

    // Data for form
    parser.enableBinaryFields(false);
    exifData = parser.parse();

  }

  return {
    blobId,
    ...exifData && {
      photoFormExif: {
        ...includeInitialPhotoFields && {
          hidden: 'false',
          favorite: 'false',
          extension,
          url,
        },
        ...convertExifToFormData(exifData),
      },
    },
  };
};
