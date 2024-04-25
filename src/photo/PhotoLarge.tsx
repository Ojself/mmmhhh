import {
  Photo,
  altTextForPhoto,
  shouldShowExifDataForPhoto,
  titleForPhoto,
} from '.';
import SiteGrid from '@/components/SiteGrid';
import ImageLarge from '@/components/ImageLarge';
import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { pathForPhoto} from '@/site/paths';
import PhotoQueens from '@/queen/PhotoQueens';
import PhotoCamera from '../camera/PhotoCamera';
import { cameraFromPhoto } from '@/camera';
import { sortQueens } from '@/queen';
import AdminPhotoMenu from '@/admin/AdminPhotoMenu';
import { Suspense } from 'react';
import DivDebugBaselineGrid from '@/components/DivDebugBaselineGrid';

export default function PhotoLarge({
  photo,
  primaryQueen,
  priority,
}: {
  photo: Photo
  primaryQueen?: string
  priority?: boolean
  
}) {
  const queens = sortQueens(photo.queens, primaryQueen);

  const camera = cameraFromPhoto();

  const showCameraContent = false;
  const showQueensContent = queens.length > 0;
  const showExifContent = shouldShowExifDataForPhoto(photo);

  return (
    <SiteGrid
      contentMain={
        <ImageLarge
          className="w-full"
          alt={altTextForPhoto(photo)}
          href={pathForPhoto(photo, primaryQueen)}
          src={photo.url}
          aspectRatio={photo.aspectRatio}
          blurData={photo.blurData}
          priority={priority}
        />}
      contentSide={
        <DivDebugBaselineGrid className={clsx(
          'relative',
          'sticky top-4 self-start -translate-y-1',
          'grid grid-cols-2 md:grid-cols-1',
          'gap-x-0.5 sm:gap-x-1 gap-y-baseline',
          'pb-6',
        )}>
          {/* Meta */}
          <div className="pr-2 md:pr-0">
            <div className="md:relative flex gap-2 items-start">
              <div className="flex-grow">
                <Link
                  href={pathForPhoto(photo)}
                  className="font-bold uppercase"
                >
                  {titleForPhoto(photo)}
                </Link>
              </div>
              <Suspense>
                <div className="absolute right-0 translate-y-[-4px] z-10">
                  <AdminPhotoMenu photo={photo} />
                </div>
              </Suspense>
            </div>
            <div className="space-y-baseline">
              {photo.caption &&
                <div className="uppercase">
                  {photo.caption}
                </div>}
              {(showCameraContent || showQueensContent) &&
                <div>
                  {showCameraContent &&
                    <PhotoCamera
                      camera={camera}
                      contrast="medium"
                    />}
                  {showQueensContent &&
                    <PhotoQueens queens={queens} contrast="medium" />}
                </div>}
            </div>
          </div>
          {/* EXIF Data */}
          <div className="space-y-baseline">
            {showExifContent &&
              <>
                <ul className="text-medium">
                  <li>
                    {photo.focalLengthFormatted}
                    {photo.focalLengthIn35MmFormatFormatted &&
                      <>
                        {' '}
                        <span
                          title="35mm equivalent"
                          className="text-extra-dim"
                        >
                          {photo.focalLengthIn35MmFormatFormatted}
                        </span>
                      </>}
                  </li>
                </ul>
              </>}
            <div className={clsx(
              'flex gap-x-1.5 gap-y-baseline',
              'md:flex-col md:justify-normal',
            )}>
              <div className={clsx(
                'text-medium uppercase pr-1',
              )}>
                {photo.takenAtNaiveFormatted}
              </div>
            </div>
          </div>
        </DivDebugBaselineGrid>}
    />
  );
};
