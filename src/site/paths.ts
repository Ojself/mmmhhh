import { Photo } from '@/photo';
import { BASE_URL } from './config';
import { Camera } from '@/camera';
import { parameterize } from '@/utility/string';

// Core paths
export const PATH_ROOT      = '/';
export const PATH_GRID      = '/';
export const PATH_ADMIN     = '/admin';
export const PATH_API       = '/api';
export const PATH_SIGN_IN   = '/sign-in';
export const PATH_OG        = '/og';

// Path prefixes
export const PREFIX_PHOTO           = '/p';
export const PREFIX_TAG             = '/queen';
export const PREFIX_CAMERA          = '/shot-on';

// Dynamic paths
const PATH_PHOTO_DYNAMIC            = `${PREFIX_PHOTO}/[photoId]`;
const PATH_TAG_DYNAMIC              = `${PREFIX_TAG}/[queen]`;
const PATH_CAMERA_DYNAMIC           = `${PREFIX_CAMERA}/[make]/[model]`;

// Admin paths
export const PATH_ADMIN_PHOTOS        = `${PATH_ADMIN}/photos`;
export const PATH_ADMIN_UPLOADS       = `${PATH_ADMIN}/uploads`;
export const PATH_ADMIN_QUEENS          = `${PATH_ADMIN}/queens`;
export const PATH_ADMIN_CONFIGURATION = `${PATH_ADMIN}/configuration`;
export const PATH_ADMIN_BASELINE      = `${PATH_ADMIN}/baseline`;

// API paths
export const PATH_API_STORAGE = `${PATH_API}/storage`;
export const PATH_API_VERCEL_BLOB_UPLOAD = `${PATH_API_STORAGE}/vercel-blob`;
export const PATH_API_PRESIGNED_URL = `${PATH_API_STORAGE}/presigned-url`;

// Modifiers
const SHARE = 'share';
const NEXT  = 'next';
const EDIT  = 'edit';

export const PATHS_ADMIN = [
  PATH_ADMIN,
  PATH_ADMIN_PHOTOS,
  PATH_ADMIN_UPLOADS,
  PATH_ADMIN_QUEENS,
  PATH_ADMIN_CONFIGURATION,
];

export const PATHS_TO_CACHE = [
  PATH_ROOT,
  PATH_GRID,
  PATH_OG,
  PATH_PHOTO_DYNAMIC,
  PATH_TAG_DYNAMIC,
  PATH_CAMERA_DYNAMIC,
  ...PATHS_ADMIN,
];

// Absolute paths
export const ABSOLUTE_PATH_FOR_HOME_IMAGE = `${BASE_URL}/home-image`;

const pathWithNext = (path: string, next?: number) =>
  next !== undefined ? `${path}?${NEXT}=${next}` : path;

export const pathForRoot = (next?: number) =>
  pathWithNext(PATH_ROOT, next);

export const pathForGrid = (next?: number) =>
  pathWithNext(PATH_GRID, next);

export const pathForAdminPhotos = (next?: number) =>
  pathWithNext(PATH_ADMIN_PHOTOS, next);

export const pathForAdminUploadUrl = (url: string) =>
  `${PATH_ADMIN_UPLOADS}/${encodeURIComponent(url)}`;

export const pathForAdminPhotoEdit = (photo: PhotoOrPhotoId) =>
  `${PATH_ADMIN_PHOTOS}/${getPhotoId(photo)}/${EDIT}`;

export const pathForAdminQueenEdit = (queen: string) =>
  `${PATH_ADMIN_QUEENS}/${queen}/${EDIT}`;

export const pathForOg = (next?: number) =>
  pathWithNext(PATH_OG, next);

type PhotoOrPhotoId = Photo | string;

const getPhotoId = (photoOrPhotoId: PhotoOrPhotoId) =>
  typeof photoOrPhotoId === 'string' ? photoOrPhotoId : photoOrPhotoId.id;

export const pathForPhoto = (
  photo: PhotoOrPhotoId,
  queen?: string,
  camera?: Camera,
) =>
  queen
    ? `${pathForQueen(queen)}/${getPhotoId(photo)}`
    : camera
      ? `${pathForCamera(camera)}/${getPhotoId(photo)}`
      : `${PREFIX_PHOTO}/${getPhotoId(photo)}`;

export const pathForPhotoShare = (
  photo: PhotoOrPhotoId,
  queen?: string,
  camera?: Camera,
) =>
  `${pathForPhoto(photo, queen, camera)}/${SHARE}`;

export const pathForQueen = (queen: string, next?: number) =>
  pathWithNext(
    `${PREFIX_TAG}/${queen}`,
    next,
  );

export const pathForQueenShare = (queen: string) =>
  `${pathForQueen(queen)}/${SHARE}`;

export const pathForCamera = ({ make, model }: Camera, next?: number) =>
  pathWithNext(
    `${PREFIX_CAMERA}/${parameterize(make, true)}/${parameterize(model, true)}`,
    next,
  );

export const pathForCameraShare = (camera: Camera) =>
  `${pathForCamera(camera)}/${SHARE}`;

export const absolutePathForPhoto = (
  photo: PhotoOrPhotoId,
  queen?: string,
  camera?: Camera,
) =>
  `${BASE_URL}${pathForPhoto(photo, queen, camera)}`;

export const absolutePathForQueen = (queen: string) =>
  `${BASE_URL}${pathForQueen(queen)}`;

export const absolutePathForCamera= (camera: Camera) =>
  `${BASE_URL}${pathForCamera(camera)}`;

export const absolutePathForPhotoImage = (photo: PhotoOrPhotoId) =>
  `${absolutePathForPhoto(photo)}/image`;

export const absolutePathForQueenImage = (queen: string) =>
  `${absolutePathForQueen(queen)}/image`;

export const absolutePathForCameraImage= (camera: Camera) =>
  `${absolutePathForCamera(camera)}/image`;

// p/[photoId]
export const isPathPhoto = (pathname = '') =>
  new RegExp(`^${PREFIX_PHOTO}/[^/]+/?$`).test(pathname);

// p/[photoId]/share
export const isPathPhotoShare = (pathname = '') =>
  new RegExp(`^${PREFIX_PHOTO}/[^/]+/${SHARE}/?$`).test(pathname);

// queen/[queen]
export const isPathQueen = (pathname = '') =>
  new RegExp(`^${PREFIX_TAG}/[^/]+/?$`).test(pathname);

// queen/[queen]/share
export const isPathQueenShare = (pathname = '') =>
  new RegExp(`^${PREFIX_TAG}/[^/]+/${SHARE}/?$`).test(pathname);

// queen/[queen]/[photoId]
export const isPathQueenPhoto = (pathname = '') =>
  new RegExp(`^${PREFIX_TAG}/[^/]+/[^/]+/?$`).test(pathname);

// queen/[queen]/[photoId]/share
export const isPathQueenPhotoShare = (pathname = '') =>
  new RegExp(`^${PREFIX_TAG}/[^/]+/[^/]+/${SHARE}/?$`).test(pathname);

// shot-on/[make]/[model]
export const isPathCamera = (pathname = '') =>
  new RegExp(`^${PREFIX_CAMERA}/[^/]+/[^/]+/?$`).test(pathname);

// shot-on/[make]/[model]/share
export const isPathCameraShare = (pathname = '') =>
  new RegExp(`^${PREFIX_CAMERA}/[^/]+/[^/]+/${SHARE}/?$`).test(pathname);

// shot-on/[make]/[model]/[photoId]
export const isPathCameraPhoto = (pathname = '') =>
  new RegExp(`^${PREFIX_CAMERA}/[^/]+/[^/]+/[^/]+/?$`).test(pathname);

// shot-on/[make]/[model]/[photoId]/share
export const isPathCameraPhotoShare = (pathname = '') =>
  new RegExp(`^${PREFIX_CAMERA}/[^/]+/[^/]+/[^/]+/${SHARE}/?$`).test(pathname);

export const checkPathPrefix = (pathname = '', prefix: string) =>
  pathname.toLowerCase().startsWith(prefix);

export const isPathGrid = (pathname?: string) =>
  checkPathPrefix(pathname, PATH_GRID);

export const isPathSignIn = (pathname?: string) =>
  checkPathPrefix(pathname, PATH_SIGN_IN);

export const isPathAdmin = (pathname?: string) =>
  checkPathPrefix(pathname, PATH_ADMIN);

export const isPathAdminConfiguration = (pathname?: string) =>
  checkPathPrefix(pathname, PATH_ADMIN_CONFIGURATION);

export const isPathProtected = (pathname?: string) =>
  checkPathPrefix(pathname, PATH_ADMIN);

export const getPathComponents = (pathname = ''): {
  photoId?: string
  queen?: string
  camera?: Camera
} => {
  const photoIdFromPhoto = pathname.match(
    new RegExp(`^${PREFIX_PHOTO}/([^/]+)`))?.[1];
  const photoIdFromQueen = pathname.match(
    new RegExp(`^${PREFIX_TAG}/[^/]+/((?!${SHARE})[^/]+)`))?.[1];
  const photoIdFromCamera = pathname.match(
    new RegExp(`^${PREFIX_CAMERA}/[^/]+/[^/]+/((?!${SHARE})[^/]+)`))?.[1];
  const queen = pathname.match(
    new RegExp(`^${PREFIX_TAG}/([^/]+)`))?.[1];
  const cameraMake = pathname.match(
    new RegExp(`^${PREFIX_CAMERA}/([^/]+)`))?.[1];
  const cameraModel = pathname.match(
    new RegExp(`^${PREFIX_CAMERA}/[^/]+/([^/]+)`))?.[1];

  const camera = cameraMake && cameraModel
    ? { make: cameraMake, model: cameraModel }
    : undefined;

  return {
    photoId: (
      photoIdFromPhoto ||
      photoIdFromQueen ||
      photoIdFromCamera
    ),
    queen,
    camera,
  };
};

export const getEscapePath = (pathname?: string) => {
  const { photoId, queen, camera } = getPathComponents(pathname);
  if (
    (photoId && isPathPhoto(pathname)) ||
    (queen && isPathQueen(pathname)) ||
    (camera && isPathCamera(pathname))
  ) {
    return PATH_GRID;
  } else if (photoId && isPathQueenPhotoShare(pathname)) {
    return pathForPhoto(photoId, queen);
  } else if (photoId && isPathCameraPhotoShare(pathname)) {
    return pathForPhoto(photoId, undefined, camera);
  } else if (photoId && isPathPhotoShare(pathname)) {
    return pathForPhoto(photoId);
  } else if (queen && (
    isPathQueenPhoto(pathname) ||
    isPathQueenShare(pathname)
  )) {
    return pathForQueen(queen);
  } else if (camera && (
    isPathCameraPhoto(pathname) ||
    isPathCameraShare(pathname)
  )) {
    return pathForCamera(camera);
  }
};
