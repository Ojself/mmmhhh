import PhotoOGTile from '@/photo/PhotoOGTile';
import { absolutePathForPhoto, pathForPhoto } from '@/site/paths';
import { Photo } from '.';
import ShareModal from '@/components/ShareModal';
import { Camera } from '@/camera';

export default function PhotoShareModal({
  photo,
  queen,
  camera,
}: {
  photo: Photo
  queen?: string
  camera?: Camera
}) {
  return (
    <ShareModal
      title="Share Photo"
      pathShare={absolutePathForPhoto(photo, queen, camera)}
      pathClose={pathForPhoto(photo, queen, camera)}
    >
      <PhotoOGTile photo={photo} />
    </ShareModal>
  );
};
