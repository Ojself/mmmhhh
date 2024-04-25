import { Photo, PhotoDateRange } from '@/photo';
import PhotoQueen from './PhotoQueen';
import { descriptionForqueenedPhotos, isQueenFavs } from '.';
import { pathForQueenShare } from '@/site/paths';
import PhotoSetHeader from '@/photo/PhotoSetHeader';
import FavsQueen from './FavsQueen';

export default function QueenHeader({
  queen,
  photos,
  selectedPhoto,
  count,
  dateRange,
}: {
  queen: string
  photos: Photo[]
  selectedPhoto?: Photo
  count?: number
  dateRange?: PhotoDateRange
}) {
  return (
    <PhotoSetHeader
      entity={isQueenFavs(queen) 
        ? <FavsQueen />
        : <PhotoQueen queen={queen} contrast="high" />}
      entityVerb="queened"
      entityDescription={descriptionForqueenedPhotos(photos, undefined, count)}
      photos={photos}
      selectedPhoto={selectedPhoto}
      sharePath={pathForQueenShare(queen)}
      count={count}
      dateRange={dateRange}
    />
  );
}
