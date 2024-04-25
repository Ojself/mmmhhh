import { Photo, PhotoDateRange } from '@/photo';
import SiteGrid from '@/components/SiteGrid';
import AnimateItems from '@/components/AnimateItems';
import PhotoGrid from '@/photo/PhotoGrid';
import QueenHeader from './QueenHeader';

export default function QueenOverview({
  queen,
  photos,
  count,
  dateRange,
  showMorePath,
  animateOnFirstLoadOnly,
}: {
  queen: string,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  showMorePath?: string,
  animateOnFirstLoadOnly?: boolean,
}) {
  return (
    <SiteGrid
      contentMain={<div className="space-y-8 mt-4">
        <AnimateItems
          type="bottom"
          items={[
            <QueenHeader
              key="QueenHeader"
              {...{ queen, photos, count, dateRange }}
            />,
          ]}
          animateOnFirstLoadOnly
        />
        <PhotoGrid
          {...{ photos, queen, showMorePath, animateOnFirstLoadOnly }}
        />
      </div>}
    />
  );
}
