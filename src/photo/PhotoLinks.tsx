'use client';

import { useEffect } from 'react';
import { Photo, getNextPhoto, getPreviousPhoto } from '@/photo';
import PhotoLink from './PhotoLink';
import { useRouter } from 'next/navigation';
import { pathForPhoto } from '@/site/paths';
import { useAppState } from '@/state';
import { AnimationConfig } from '@/components/AnimateItems';
import { Camera } from '@/camera';


const LISTENER_KEYUP = 'keyup';

const ANIMATION_LEFT: AnimationConfig = { type: 'left', duration: 0.3 };
const ANIMATION_RIGHT: AnimationConfig = { type: 'right', duration: 0.3 };

export default function PhotoLinks({
  photo,
  photos,
  queen,
  camera,
  
}: {
  photo: Photo
  photos: Photo[]
  queen?: string
  camera?: Camera
  
}) {
  const router = useRouter();

  const {
    setNextPhotoAnimation,
    shouldRespondToKeyboardCommands,
  } = useAppState();

  const previousPhoto = getPreviousPhoto(photo, photos);
  const nextPhoto = getNextPhoto(photo, photos);

  useEffect(() => {
    if (shouldRespondToKeyboardCommands) {
      const onKeyUp = (e: KeyboardEvent) => {
        switch (e.key.toUpperCase()) {
        case 'ARROWLEFT':
        case 'J':
          if (previousPhoto) {
            setNextPhotoAnimation?.(ANIMATION_RIGHT);
            router.push(
              pathForPhoto(previousPhoto, queen, camera),
              { scroll: false },
            );
          }
          break;
        case 'ARROWRIGHT':
        case 'L':
          if (nextPhoto) {
            setNextPhotoAnimation?.(ANIMATION_LEFT);
            router.push(
              pathForPhoto(nextPhoto, queen, camera),
              { scroll: false },
            );
          }
          break;
        };
      };
      window.addEventListener(LISTENER_KEYUP, onKeyUp);
      return () => window.removeEventListener(LISTENER_KEYUP, onKeyUp);
    }
  }, [
    router,
    shouldRespondToKeyboardCommands,
    setNextPhotoAnimation,
    previousPhoto,
    nextPhoto,
    queen,
    camera,
    
  ]);
  
  return (
    <>
      <PhotoLink
        photo={previousPhoto}
        nextPhotoAnimation={ANIMATION_RIGHT}
        queen={queen}
        camera={camera}
        
        prefetch
      >
        PREV
      </PhotoLink>
      <PhotoLink
        photo={nextPhoto}
        nextPhotoAnimation={ANIMATION_LEFT}
        queen={queen}
        camera={camera}
        
        prefetch
      >
        NEXT
      </PhotoLink>
    </>
  );
};
