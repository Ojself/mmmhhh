import { pathForQueen } from '@/site/paths';
import { FaChessQueen } from 'react-icons/fa';
import { formatQueen } from '.';
import EntityLink, {
  EntityLinkExternalProps,
} from '@/components/primitives/EntityLink';

export default function PhotoQueen({
  queen,
  type,
  badged,
  contrast,
  countOnHover,
}: {
  queen: string
  countOnHover?: number
} & EntityLinkExternalProps) {
  return (
    <EntityLink
      label={formatQueen(queen)}
      href={pathForQueen(queen)}
      icon={<FaChessQueen
        size={11}
        className="translate-y-[1px]"
      />}
      type={type}
      badged={badged}
      contrast={contrast}
      hoverEntity={countOnHover}
    />
  );
}
