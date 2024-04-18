import { Cameras, sortCamerasWithCount } from '@/camera';
import PhotoCamera from '@/camera/PhotoCamera';
import HeaderList from '@/components/HeaderList';
import PhotoTag from '@/tag/PhotoTag';
import { FaTag } from 'react-icons/fa';
import { IoMdCamera } from 'react-icons/io';
import { PhotoDateRange, dateRangeForPhotos, photoQuantityText } from '.';
import { TAG_FAVS, Tags } from '@/tag';
import FavsTag from '../tag/FavsTag';

export default function PhotoGridSidebar({
  tags,
  cameras,
  photosCount,
  photosDateRange,
}: {
  tags: Tags
  cameras: Cameras
  photosCount: number
  photosDateRange?: PhotoDateRange
}) {
  const { start, end } = dateRangeForPhotos(undefined, photosDateRange);

  return (
    <>
      {tags.length > 0 && <HeaderList
        title='Tags'
        icon={<FaTag size={12} className="text-icon" />}
        items={tags.map(({ tag, count }) => tag === TAG_FAVS
          ? <FavsTag
            key={TAG_FAVS}
            countOnHover={count}
            type="icon-last"
            contrast="low"
            badged
          />
          : <PhotoTag
            key={tag}
            tag={tag}
            type="text-only"
            countOnHover={count}
            contrast="low"
            badged
          />)}
      />}
      {cameras.length > 0 && <HeaderList
        title="Cameras"
        icon={<IoMdCamera
          size={13}
          className="text-icon translate-y-[-0.25px]"
        />}
        items={cameras
          .sort(sortCamerasWithCount)
          .map(({ cameraKey, camera, count }) =>
            <PhotoCamera
              key={cameraKey}
              camera={camera}
              type="text-only"
              countOnHover={count}
              contrast="low"
              hideAppleIcon
              badged
            />)}
      />}
      {photosCount > 0 && start
        ? <HeaderList
          title={photoQuantityText(photosCount, false)}
          items={start === end
            ? [start]
            : [`${end} –`, start]}
        />
        : <HeaderList
          items={[photoQuantityText(photosCount, false)]}
        />}
    </>
  );
}
