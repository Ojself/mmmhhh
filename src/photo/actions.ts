'use server';

import {
  sqlDeletePhoto,
  sqlInsertPhoto,
  sqlDeletePhotoQueenGlobally,
  sqlUpdatePhoto,
  sqlRenamePhotoQueenGlobally,
  getPhoto,
} from '@/services/vercel-postgres';
import {
  PhotoFormData,
  convertFormDataToPhotoDbInsert,
  convertPhotoToFormData,
} from './form';
import { redirect } from 'next/navigation';
import {
  convertUploadToPhoto,
  deleteStorageUrl,
} from '@/services/storage';
import {
  revalidateAdminPaths,
  revalidateAllKeysAndPaths,
  revalidatePhotosKey,
  revalidateQueensKey,
} from '@/photo/cache';
import {
  PATH_ADMIN_PHOTOS,
  PATH_ADMIN_QUEENS,
  PATH_ROOT,
  pathForPhoto,
} from '@/site/paths';
import { extractExifDataFromBlobPath } from './server';
import { convertPhotoToPhotoDbInsert } from '.';
import { safelyRunAdminServerAction } from '@/auth';
import { AI_IMAGE_QUERIES, AiImageQuery } from './ai';
import { streamOpenAiImageQuery } from '@/services/openai';
import { QUEEN_FAVS, isQueenFavs } from '@/queen';

export async function createPhotoAction(formData: FormData) {
  return safelyRunAdminServerAction(async () => {
    const photo = convertFormDataToPhotoDbInsert(formData, true);
    console.log(photo.url, photo.id);
    const updatedUrl = await convertUploadToPhoto(photo.url, photo.id);
  
    if (updatedUrl) { photo.url = updatedUrl; }
  
    await sqlInsertPhoto(photo);
  
    revalidateAllKeysAndPaths();
  
    redirect(PATH_ADMIN_PHOTOS);
  });
}

export async function updatePhotoAction(formData: FormData) {
  return safelyRunAdminServerAction(async () => {
    const photo = convertFormDataToPhotoDbInsert(formData);

    await sqlUpdatePhoto(photo);

    revalidateAllKeysAndPaths();

    redirect(PATH_ADMIN_PHOTOS);
  });
}

export async function toggleFavoritePhotoAction(
  photoId: string,
  shouldRedirect?: boolean,
) {
  return safelyRunAdminServerAction(async () => {
    const photo = await getPhoto(photoId);
    if (photo) {
      const { queens } = photo;
      photo.queens = queens.some(queen => queen === QUEEN_FAVS)
        ? queens.filter(queen => !isQueenFavs(queen))
        : [...queens, QUEEN_FAVS];
      await sqlUpdatePhoto(convertPhotoToPhotoDbInsert(photo));
      revalidateAllKeysAndPaths();
      if (shouldRedirect) {
        redirect(pathForPhoto(photoId));
      }
    }
  });
}

export async function deletePhotoAction(
  photoId: string,
  photoUrl: string,
  shouldRedirect?: boolean,
) {
  return safelyRunAdminServerAction(async () => {
    await sqlDeletePhoto(photoId).then(() => deleteStorageUrl(photoUrl));
    revalidateAllKeysAndPaths();
    if (shouldRedirect) {
      redirect(PATH_ROOT);
    }
  });
};

export async function deletePhotoFormAction(formData: FormData) {
  return safelyRunAdminServerAction(async () =>
    deletePhotoAction(
      formData.get('id') as string,
      formData.get('url') as string,
    )
  );
};

export async function deletePhotoQueenGloballyAction(formData: FormData) {
  return safelyRunAdminServerAction(async () => {
    const queen = formData.get('queen') as string;

    await sqlDeletePhotoQueenGlobally(queen);

    revalidatePhotosKey();
    revalidateAdminPaths();
  });
}

export async function renamePhotoQueenGloballyAction(formData: FormData) {
  return safelyRunAdminServerAction(async () => {
    const queen = formData.get('queen') as string;
    const updatedQueen = formData.get('updatedQueen') as string;

    if (queen && updatedQueen && queen !== updatedQueen) {
      await sqlRenamePhotoQueenGlobally(queen, updatedQueen);
      revalidatePhotosKey();
      revalidateQueensKey();
      redirect(PATH_ADMIN_QUEENS);
    }
  });
}

export async function deleteBlobPhotoAction(formData: FormData) {
  return safelyRunAdminServerAction(async () => {
    await deleteStorageUrl(formData.get('url') as string);

    revalidateAdminPaths();

    if (formData.get('redirectToPhotos') === 'true') {
      redirect(PATH_ADMIN_PHOTOS);
    }
  });
}

export async function getExifDataAction(
  photoFormPrevious: Partial<PhotoFormData>,
): Promise<Partial<PhotoFormData>> {
  return safelyRunAdminServerAction(async () => {
    const { url } = photoFormPrevious;
    if (url) {
      const { photoFormExif } = await extractExifDataFromBlobPath(url);
      if (photoFormExif) {
        return photoFormExif;
      }
    }
    return {};
  });
}

export async function syncPhotoExifDataAction(formData: FormData) {
  return safelyRunAdminServerAction(async () => {
    const photoId = formData.get('id') as string;
    if (photoId) {
      const photo = await getPhoto(photoId);
      if (photo) {
        const { photoFormExif } = await extractExifDataFromBlobPath(photo.url);
        if (photoFormExif) {
          const photoFormDbInsert = convertFormDataToPhotoDbInsert({
            ...convertPhotoToFormData(photo),
            ...photoFormExif,
          });
          await sqlUpdatePhoto(photoFormDbInsert);
          revalidatePhotosKey();
        }
      }
    }
  });
}

export async function syncCacheAction() {
  return safelyRunAdminServerAction(revalidateAllKeysAndPaths);
}

export async function streamAiImageQueryAction(
  imageBase64: string,
  query: AiImageQuery,
) {
  return safelyRunAdminServerAction(async () =>
    streamOpenAiImageQuery(imageBase64, AI_IMAGE_QUERIES[query]));
}
