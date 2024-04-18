import AnimateItems from '@/components/AnimateItems';
import { Photo, PhotoDateRange } from '.';
import PhotoLarge from './PhotoLarge';
import SiteGrid from '@/components/SiteGrid';
import PhotoGrid from './PhotoGrid';
import { clsx } from 'clsx/lite';
import PhotoLinks from './PhotoLinks';
import TagHeader from '@/tag/TagHeader';
import { Camera } from '@/camera';
import CameraHeader from '@/camera/CameraHeader';

export default function PhotoDetailPage({
  photo,
  photos,
  photosGrid,
  tag,
  camera,
  count,
  dateRange,
}: {
  photo: Photo
  photos: Photo[]
  photosGrid?: Photo[]
  tag?: string
  camera?: Camera
  count?: number
  dateRange?: PhotoDateRange
}) {
  return (
    <div>
      {tag &&
        <SiteGrid
          className="mt-4 mb-8"
          contentMain={
            <TagHeader
              key={tag}
              tag={tag}
              photos={photos}
              selectedPhoto={photo}
              dateRange={dateRange}
            />}
        />}
      {camera &&
        <SiteGrid
          className="mt-4 mb-8"
          contentMain={
            <CameraHeader
              camera={camera}
              photos={photos}
              selectedPhoto={photo}
              count={count}
              dateRange={dateRange}
            />}
        />}
      <AnimateItems
        className="md:mb-8"
        animateFromAppState
        items={[
          <PhotoLarge
            key={photo.id}
            photo={photo}
            primaryTag={tag}
            priority
            prefetchShare
            showCamera={!camera}
            shouldShareTag={tag !== undefined}
            shouldShareCamera={camera !== undefined}
            shouldScrollOnShare={false}
          />,
        ]}
      />
      <SiteGrid
        sideFirstOnMobile
        contentMain={<PhotoGrid
          photos={photosGrid ?? photos}
          selectedPhoto={photo}
          tag={tag}
          animateOnFirstLoadOnly
        />}
        contentSide={<AnimateItems
          animateOnFirstLoadOnly
          type="bottom"
          items={[
            <div
              key="PhotoLinks"
              className={clsx(
                'grid grid-cols-2',
                'gap-0.5 sm:gap-1',
                'md:flex md:gap-4',
                'user-select-none',
              )}
            >
              <PhotoLinks {...{
                photo,
                photos,
                tag,
                camera,
              }} />
            </div>,
          ]}
        />}
      />
    </div>
  );
}
