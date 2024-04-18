import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import IconGrid from '@/site/IconGrid';
import { PATH_ADMIN_PHOTOS, PATH_GRID } from '@/site/paths';
import { BiLockAlt } from 'react-icons/bi';

export type SwitcherSelection = | 'grid' | 'sets' | 'admin';

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {
  

  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        <SwitcherItem
          icon={<IconGrid />}
          href={PATH_GRID}
          active={currentSelection === 'grid'}
          noPadding
        />
        {showAdmin &&
          <SwitcherItem
            icon={<BiLockAlt size={16} className="translate-y-[-0.5px]" />}
            href={PATH_ADMIN_PHOTOS}
            active={currentSelection === 'admin'}
          />}
      </Switcher>
    </div>
  );
}
