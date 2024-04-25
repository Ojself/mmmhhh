import { absolutePathForQueen, pathForQueen } from '@/site/paths';
import { Photo, PhotoDateRange } from '../photo';
import ShareModal from '@/components/ShareModal';
import QueenOGTile from './QueenOGTile';

export default function QueenShareModal({
  queen,
  photos,
  count,
  dateRange,
}: {
  queen: string
  photos: Photo[]
  count?: number
  dateRange?: PhotoDateRange
}) {
  return (
    <ShareModal
      title="Share Photos"
      pathShare={absolutePathForQueen(queen)}
      pathClose={pathForQueen(queen)}
    >
      <QueenOGTile {...{ queen, photos, count, dateRange }} />
    </ShareModal>
  );
};
