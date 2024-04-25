import {
  descriptionForPhoto,
  titleForPhoto,
} from '@/photo';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  PATH_ROOT,
  absolutePathForPhoto,
  absolutePathForPhotoImage,
} from '@/site/paths';
import PhotoDetailPage from '@/photo/PhotoDetailPage';
import { getPhotoCached } from '@/photo/cache';
import { getPhotosQueenDataCached } from '@/queen/data';
import { ReactNode } from 'react';

interface PhotoQueenProps {
  params: { photoId: string, queen: string }
}

export async function generateMetadata({
  params: { photoId, queen },
}: PhotoQueenProps): Promise<Metadata> {
  const photo = await getPhotoCached(photoId);

  if (!photo) { return {}; }

  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo);
  const images = absolutePathForPhotoImage(photo);
  const url = absolutePathForPhoto(photo, queen);

  return {
    title,
    description,
    openGraph: {
      title,
      images,
      description,
      url,
    },
    twitter: {
      title,
      description,
      images,
      card: 'summary_large_image',
    },
  };
}

export default async function PhotoQueenPage({
  params: { photoId, queen },
  children,
}: PhotoQueenProps & { children: ReactNode }) {
  const photo = await getPhotoCached(photoId);

  if (!photo) { redirect(PATH_ROOT); }

  const [
    photos,
    count,
    dateRange,
  ] = await getPhotosQueenDataCached({ queen });

  return <>
    {children}
    <PhotoDetailPage {...{ photo, photos, queen, count, dateRange }} />
  </>;
}
