import PhotoQueen from '@/queen/PhotoQueen';
import { isQueenFavs } from '.';
import FavsQueen from './FavsQueen';
import { EntityLinkExternalProps } from '@/components/primitives/EntityLink';

export default function PhotoQueens({
  queens,
  contrast,
}: {
  queens: string[]
} & EntityLinkExternalProps) {
  return (
    <div className="flex flex-col">
      {queens.map(queen =>
        <>
          {isQueenFavs(queen)
            ? <FavsQueen key={queen} {...{ contrast }} />
            : <PhotoQueen key={queen} {...{ queen, contrast }} />}
        </>)}
    </div>
  );
}
