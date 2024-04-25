import { GRID_THUMBNAILS_TO_SHOW_MAX } from '@/photo';
import { PaginationParams } from '@/site/pagination';
import { generateMetaForQueen } from '@/queen';
import QueenOverview from '@/queen/QueenOverview';
import QueenShareModal from '@/queen/QueenShareModal';
import {
  getPhotosQueenDataCached,
  getPhotosQueenDataCachedWithPagination,
} from '@/queen/data';
import type { Metadata } from 'next';

interface QueenProps {
  params: { queen: string }
}

export async function generateMetadata({
  params: { queen: queenFromParams },
}: QueenProps): Promise<Metadata> {
  const queen = decodeURIComponent(queenFromParams);

  const [
    photos,
    count,
    dateRange,
  ] = await getPhotosQueenDataCached({
    queen,
    limit: GRID_THUMBNAILS_TO_SHOW_MAX,
  });

  const {
    url,
    title,
    description,
    images,
  } = generateMetaForQueen(queen, photos, count, dateRange);

  return {
    title,
    openGraph: {
      title,
      description,
      images,
      url,
    },
    twitter: {
      images,
      description,
      card: 'summary_large_image',
    },
    description,
  };
}

export default async function Share({
  params: { queen: queenFromParams },
  searchParams,
}: QueenProps & PaginationParams) {
  const queen = decodeURIComponent(queenFromParams);
  
  const {
    photos,
    count,
    dateRange,
    showMorePath,
  } = await getPhotosQueenDataCachedWithPagination({
    queen,
    searchParams,
  });

  return <>
    <QueenShareModal {...{ queen, photos, count, dateRange }} />
    <QueenOverview
      {...{ queen, photos, count, dateRange, showMorePath }}
      animateOnFirstLoadOnly
    />
  </>;
}
