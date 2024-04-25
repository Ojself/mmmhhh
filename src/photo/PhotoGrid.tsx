import { Photo } from '.';
import PhotoSmall from './PhotoSmall';
import { clsx } from 'clsx/lite';
import AnimateItems from '@/components/AnimateItems';
import { Camera } from '@/camera';
import MorePhotos from '@/photo/MorePhotos';
import { GRID_ASPECT_RATIO, HIGH_DENSITY_GRID } from '@/site/config';

export default function PhotoGrid({
  photos,
  selectedPhoto,
  queen,
  camera,
  fast,
  animate = true,
  animateOnFirstLoadOnly,
  squeengerOnFirstLoadOnly = true,
  showMorePath,
  additionalTile,
  small,
}: {
  photos: Photo[]
  selectedPhoto?: Photo
  queen?: string
  camera?: Camera
  fast?: boolean
  animate?: boolean
  animateOnFirstLoadOnly?: boolean
  squeengerOnFirstLoadOnly?: boolean
  showMorePath?: string
  additionalTile?: JSX.Element
  small?: boolean
}) {
  return (
    <div className="space-y-4">
      <AnimateItems
        className={clsx(
          'grid gap-0.5 sm:gap-1',
          small
            ? 'grid-cols-3 xs:grid-cols-6'
            : HIGH_DENSITY_GRID
              ? 'grid-cols-2 xs:grid-cols-4 lg:grid-cols-5'
              : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4',
          'items-center',
        )}
        type={animate === false ? 'none' : undefined}
        duration={fast ? 0.3 : undefined}
        squeengerDelay={0.075}
        distanceOffset={40}
        animateOnFirstLoadOnly={animateOnFirstLoadOnly}
        squeengerOnFirstLoadOnly={squeengerOnFirstLoadOnly}
        items={photos.map(photo =>
          <div
            key={photo.id}
            className={GRID_ASPECT_RATIO !== 0
              ? 'aspect-square overflow-hidden'
              : undefined}
            style={{
              ...GRID_ASPECT_RATIO !== 0 && {
                aspectRatio: GRID_ASPECT_RATIO,
              },
            }}
          >
            <PhotoSmall {...{
              photo,
              queen,
              camera,
              selected: photo.id === selectedPhoto?.id,
            }} />
          </div>).concat(additionalTile ?? [])}
      />
      {showMorePath &&
        <MorePhotos path={showMorePath} />}
    </div>
  );
};
