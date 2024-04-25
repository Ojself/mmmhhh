import AdminChildPage from '@/components/AdminChildPage';
import { redirect } from 'next/navigation';
import { getPhotosCached, getPhotosQueenCountCached } from '@/photo/cache';
import QueenForm from '@/queen/QueenForm';
import { PATH_ADMIN, PATH_ADMIN_QUEENS, pathForQueen } from '@/site/paths';
import PhotoQueen from '@/queen/PhotoQueen';
import { photoLabelForCount } from '@/photo';
import PhotoLightbox from '@/photo/PhotoLightbox';
import FavsQueen from '@/queen/FavsQueen';
import { isQueenFavs } from '@/queen';
import { clsx } from 'clsx/lite';

const MAX_PHOTO_TO_SHOW = 6;

interface Props {
  params: { queen: string }
}

export default async function PhotoPageEdit({
  params: { queen: queenFromParams } }: Props
) {
  const queen = decodeURIComponent(queenFromParams);
  
  const [
    count,
    photos,
  ] = await Promise.all([
    getPhotosQueenCountCached(queen),
    getPhotosCached({ queen, limit: MAX_PHOTO_TO_SHOW }),
  ]);

  if (count === 0) { redirect(PATH_ADMIN); }

  return (
    <AdminChildPage
      backPath={PATH_ADMIN_QUEENS}
      backLabel="Queens"
      breadcrumb={<div className={clsx(
        'flex items-center gap-2',
        // Fix nested EntityLink-in-Badge quirk for QUEENS
        '[&>*>*:first-child]:items-center',
      )}>
        {isQueenFavs(queen)
          ? <FavsQueen />
          : <PhotoQueen {...{ queen }} />}
        <div className="text-dim uppercase">
          <span>{count}</span>
          <span className="hidden xs:inline-block">
            &nbsp;
            {photoLabelForCount(count)}
          </span>
        </div>
      </div>}
    >
      <QueenForm {...{ queen, photos }}>
        <PhotoLightbox
          {...{ count, photos }}
          maxPhotosToShow={MAX_PHOTO_TO_SHOW}
          moreLink={pathForQueen(queen)}
        />
      </QueenForm>
    </AdminChildPage>
  );
};
