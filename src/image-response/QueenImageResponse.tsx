import type { Photo } from '../photo';
import { FaStar, FaChessQueen } from 'react-icons/fa';
import ImageCaption from './components/ImageCaption';
import ImagePhotoGrid from './components/ImagePhotoGrid';
import ImageContainer from './components/ImageContainer';
import type { NextImageSize } from '@/services/next-image';
import { isQueenFavs } from '@/queen';

export default function QueenImageResponse({
  queen,
  photos,
  width,
  height,
  fontFamily,
}: {
  queen: string,
  photos: Photo[]
  width: NextImageSize
  height: number
  fontFamily: string
}) {  
  return (
    <ImageContainer {...{
      width,
      height,
      ...photos.length === 0 && { background: 'black' },
    }}>
      <ImagePhotoGrid
        {...{
          photos,
          width,
          height,
        }}
      />
      <ImageCaption {...{ width, height, fontFamily }}>
        {isQueenFavs(queen)
          ? <FaStar
            size={height * .074}
            style={{
              transform: `translateY(${height * .01}px)`,
              // Fix horizontal distortion in icon size
              width: height * .08,
            }}
          />
          : <FaChessQueen
            size={height * .067}
            style={{ transform: `translateY(${height * .02}px)` }}
          />}
        <span>{queen.toUpperCase()}</span>
      </ImageCaption>
    </ImageContainer>
  );
}
