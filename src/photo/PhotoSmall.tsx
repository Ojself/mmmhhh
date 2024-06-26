import { Photo, altTextForPhoto } from '.';
import ImageSmall from '@/components/ImageSmall';
import Link from 'next/link';
import { clsx } from 'clsx/lite';
import { pathForPhoto } from '@/site/paths';
import { Camera } from '@/camera';

export default function PhotoSmall({
  photo,
  queen,
  camera,
  selected,
}: {
  photo: Photo
  queen?: string
  camera?: Camera
  selected?: boolean
}) {
  return (
    <Link
      href={pathForPhoto(photo, queen, camera)}
      className={clsx(
        'group',
        'flex relative w-full h-full',
        'active:brightness-75',
        selected && 'brightness-50',
      )}
    >
      <ImageSmall
        src={photo.url}
        aspectRatio={photo.aspectRatio}
        blurData={photo.blurData}
        className="w-full"
        alt={altTextForPhoto(photo)}
      />
    </Link>
  );
};
