import FormWithConfirm from '@/components/FormWithConfirm';
import SiteGrid from '@/components/SiteGrid';
import { deletePhotoQueenGloballyAction } from '@/photo/actions';
import AdminGrid from '@/admin/AdminGrid';
import { Fragment } from 'react';
import DeleteButton from '@/admin/DeleteButton';
import { photoQuantityText } from '@/photo';
import { getUniqueQueensHiddenCached } from '@/photo/cache';
import PhotoQueen from '@/queen/PhotoQueen';
import EditButton from '@/admin/EditButton';
import { pathForAdminQueenEdit } from '@/site/paths';
import { clsx } from 'clsx/lite';
import FavsQueen from '@/queen/FavsQueen';
import { formatQueen, isQueenFavs, sortQueensObject } from '@/queen';

export default async function AdminQUEENSPage() {
  const QUEENS = await getUniqueQueensHiddenCached();

  return (
    <SiteGrid
      contentMain={
        <div className="space-y-6">
          <div className="space-y-4">
            <AdminGrid>
              {sortQueensObject(QUEENS).map(({ queen, count }) =>
                <Fragment key={queen}>
                  <div className="pr-2 -translate-y-0.5">
                    {isQueenFavs(queen)
                      ? <FavsQueen />
                      : <PhotoQueen {...{ queen }} />}
                  </div>
                  <div className="text-dim uppercase">
                    {photoQuantityText(count, false)}
                  </div>
                  <div className={clsx(
                    'flex flex-nowrap',
                    'gap-2 sm:gap-3 items-center',
                  )}>
                    <EditButton href={pathForAdminQueenEdit(queen)} />
                    <FormWithConfirm
                      action={deletePhotoQueenGloballyAction}
                      confirmText={
                        // eslint-disable-next-line max-len
                        `Are you sure you want to remove "${formatQueen(queen)}" from ${photoQuantityText(count, false).toLowerCase()}?`}
                    >
                      <input type="hidden" name="queen" value={queen} />
                      <DeleteButton />
                    </FormWithConfirm>
                  </div>
                </Fragment>)}
            </AdminGrid>
          </div>
        </div>}
    />
  );
}
