import AdminNav from '@/admin/AdminNav';
import {
  getPhotosCountIncludingHiddenCached,
  getUniqueQueensCached,
} from '@/photo/cache';
import { getStorageUploadUrlsNoStore } from '@/services/storage/cache';
import {
  PATH_ADMIN_PHOTOS,
  PATH_ADMIN_QUEENS,
  PATH_ADMIN_UPLOADS,
} from '@/site/paths';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [
    countPhotos,
    countUploads,
    countQueens,
  ] = await Promise.all([
    getPhotosCountIncludingHiddenCached(),
    getStorageUploadUrlsNoStore()
      .then(urls => urls.length)
      .catch(e => {
        console.error(`Error getting blob upload urls: ${e}`);
        return 0;
      }),
    getUniqueQueensCached().then(queens => queens.length),
  ]);

  const navItemPhotos = {
    label: 'Photos',
    href: PATH_ADMIN_PHOTOS,
    count: countPhotos,
  };

  const navItemUploads = {
    label: 'Uploads',
    href: PATH_ADMIN_UPLOADS,
    count: countUploads,
  };

  const navItemQueens = {
    label: 'Queens',
    href: PATH_ADMIN_QUEENS,
    count: countQueens,
  };

  const navItems = [navItemPhotos];

  if (countUploads > 0) { navItems.push(navItemUploads); }
  if (countQueens > 0) { navItems.push(navItemQueens); }

  return (
    <div className="mt-4 space-y-5">
      <AdminNav items={navItems} />
      {children}
    </div>
  );
}
