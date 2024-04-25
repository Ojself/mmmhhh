import { Photo, PhotoDateRange } from '@/photo';
import { absolutePathForQueenImage, pathForQueen } from '@/site/paths';
import OGTile from '@/components/OGTile';
import { descriptionForqueenedPhotos, titleForQueen } from '.';

export type OGLoadingState = 'unloaded' | 'loading' | 'loaded' | 'failed';

export default function QueenOGTile({
  queen,
  photos,
  loadingState: loadingStateExternal,
  riseOnHover,
  onLoad,
  onFail,
  retryTime,
  count,
  dateRange,
}: {
  queen: string
  photos: Photo[]
  loadingState?: OGLoadingState
  onLoad?: () => void
  onFail?: () => void
  riseOnHover?: boolean
  retryTime?: number
  count?: number
  dateRange?: PhotoDateRange
}) {
  return (
    <OGTile {...{
      title: titleForQueen(queen, photos, count),
      description: descriptionForqueenedPhotos(photos, true, count, dateRange),
      path: pathForQueen(queen),
      pathImageAbsolute: absolutePathForQueenImage(queen),
      loadingState: loadingStateExternal,
      onLoad,
      onFail,
      riseOnHover,
      retryTime,
    }}/>
  );
};
