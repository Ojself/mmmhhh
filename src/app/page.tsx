import { getPhotosCached } from '@/photo/cache';
import SiteGrid from '@/components/SiteGrid';
import { generateOgImageMetaForPhotos } from '@/photo';
import PhotoGrid from '@/photo/PhotoGrid';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { MAX_PHOTOS_TO_SHOW_OG } from '@/image-response';
import { pathForGrid } from '@/site/paths';
import { Metadata } from 'next';
import {
  PaginationParams,
  getPaginationForSearchParams,
} from '@/site/pagination';
import PhotoGridSidebar from '@/photo/PhotoGridSidebar';
import { getPhotoSidebarDataCached } from '@/photo/data';

export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached({ limit: MAX_PHOTOS_TO_SHOW_OG });
  return generateOgImageMetaForPhotos(photos);
}

export default async function GridPage({ searchParams }: PaginationParams) {
  const { limit } = getPaginationForSearchParams(searchParams);

  const [
    photos,
    queens,
    /* @ts-ignore */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    count,
  ] = await Promise.all([
    getPhotosCached({ limit }),
    ...getPhotoSidebarDataCached(),
  ]);
  

  
  return (
    photos.length > 0
      ? <SiteGrid
        contentMain={<PhotoGrid {...{ photos }} />}
        contentSide={<div className="sticky top-4 space-y-4 mt-[-4px]">
          <PhotoGridSidebar {...{
            queens,
          }} />
        </div>}
        sideHiddenOnMobile
      />
      : <PhotosEmptyState />
  );
}
