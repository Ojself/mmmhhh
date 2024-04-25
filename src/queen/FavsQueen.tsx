import { FaStar } from 'react-icons/fa';
import { QUEEN_FAVS } from '.';
import { pathForQueen } from '@/site/paths';
import { clsx } from 'clsx/lite';
import EntityLink, {
  EntityLinkExternalProps,
} from '@/components/primitives/EntityLink';

export default function FavsQueen({
  type,
  badged,
  contrast,
  countOnHover,
}: {
  countOnHover?: number
} & EntityLinkExternalProps) {
  return (
    <EntityLink
      label={
        badged
          ? <span className="inline-flex gap-1">
            {QUEEN_FAVS}
            <FaStar
              size={10}
              className="text-amber-500"
            />
          </span>
          : QUEEN_FAVS}
      href={pathForQueen(QUEEN_FAVS)}
      icon={!badged &&
        <FaStar
          size={12}
          className={clsx(
            'text-amber-500',
            'translate-x-[-1px] translate-y-[-0.5px]',
          )}
        />}
      type={type}
      hoverEntity={countOnHover}
      badged={badged}
      contrast={contrast}
    />
  );
}
