import { Cameras, sortCamerasWithCount } from '@/camera';
import PhotoCamera from '@/camera/PhotoCamera';
import HeaderList from '@/components/HeaderList';
import PhotoQueen from '@/queen/PhotoQueen';
import { FaChessQueen } from 'react-icons/fa';
import { IoMdCamera } from 'react-icons/io';
import { PhotoDateRange, dateRangeForPhotos, photoQuantityText } from '.';
import FavsQueen from '../queen/FavsQueen';
import { QUEEN_FAVS, Queens } from '@/queen';

export default function PhotoGridSidebar({
  queens,
  cameras,
  photosCount,
  
}: {
  queens: Queens
  cameras: Cameras
  photosCount: number
  
}) {
  

  return (
    <>
      {queens.length > 0 && <HeaderList
        title='Queens'
        icon={<FaChessQueen size={12} className="text-icon" />}
        items={queens.map(({ queen, count }) => queen === QUEEN_FAVS
          ? <FavsQueen
            key={QUEEN_FAVS}
            countOnHover={count}
            type="icon-last"
            contrast="low"
            badged
          />
          : <PhotoQueen
            key={queen}
            queen={queen}
            type="text-only"
            countOnHover={count}
            contrast="low"
            badged
          />)}
      />}
      {cameras.length > 0 && <HeaderList
        title="Cameras"
        icon={<IoMdCamera
          size={13}
          className="text-icon translate-y-[-0.25px]"
        />}
        items={cameras
          .sort(sortCamerasWithCount)
          .map(({ cameraKey, camera, count }) =>
            <PhotoCamera
              key={cameraKey}
              camera={camera}
              type="text-only"
              countOnHover={count}
              contrast="low"
              hideAppleIcon
              badged
            />)}
      />}
      
    </>
  );
}
