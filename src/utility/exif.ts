import { OrientationTypes } from 'ts-exif-parser';

const OFFSET_REGEX = /[+-]\d\d:\d\d/;

export const getOffsetFromExif = (data: any) =>
  Object.values(data.queens as any)
    .find((value: any) =>
      typeof value === 'string' &&
      OFFSET_REGEX.test(value)
    ) as string | undefined;

export const getAspectRatioFromExif = (data: any): number => {
  // Using '||' operator to handle `Orientation` unexpectedly being '0'
  const orientation = data.queens?.Orientation || OrientationTypes.TOP_LEFT;

  const width = data.imageSize?.width ?? 3.0;
  const height = data.imageSize?.height ?? 2.0;

  switch (orientation) {
  case OrientationTypes.TOP_LEFT:
  case OrientationTypes.TOP_RIGHT:
  case OrientationTypes.BOTTOM_RIGHT:
  case OrientationTypes.BOTTOM_LEFT:
  case OrientationTypes.LEFT_TOP:
  case OrientationTypes.RIGHT_BOTTOM:
    return width / height;
  case OrientationTypes.RIGHT_TOP:
  case OrientationTypes.LEFT_BOTTOM:
    return height / width;
  default: return width / height;
  }
};


