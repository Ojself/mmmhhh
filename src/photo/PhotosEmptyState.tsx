import InfoBlock from '@/components/InfoBlock';
import SiteGrid from '@/components/SiteGrid';
import { PATH_ADMIN_CONFIGURATION, PATH_ADMIN_PHOTOS } from '@/site/paths';
import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import { HiOutlinePhotograph } from 'react-icons/hi';

export default function PhotosEmptyState() {
  return (
    <SiteGrid
      contentMain={
        <InfoBlock
          className="min-h-[20rem] sm:min-h-[30rem] px-8"
          padding="loose"
        >
          <HiOutlinePhotograph
            className="text-medium"
            size={24}
          />
          <div className={clsx(
            'font-bold text-2xl',
            'text-gray-700 dark:text-gray-200',
          )}>
          </div>
          { <div className="max-w-md text-center space-y-6">
            <div className="space-y-2">
              <div>
                  Add your first photo:
              </div>
              <Link
                href={PATH_ADMIN_PHOTOS}
                className="button primary"
              >
                <span>Admin Dashboard</span>
                <FaArrowRight size={10} />
              </Link>
            </div>
            
          </div>}
        </InfoBlock>}
    />
  );
};
