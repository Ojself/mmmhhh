import { db, sql } from '@vercel/postgres';
import {
  PhotoDb,
  PhotoDbInsert,
  translatePhotoId,
  parsePhotoFromDb,
  Photo,
  PhotoDateRange,
} from '@/photo';
import { Camera, Cameras } from '@/camera';
import { parameterize } from '@/utility/string';
import { PRIORITY_ORDER_ENABLED } from '@/site/config';
import { Queens } from '@/queen';

const PHOTO_DEFAULT_LIMIT = 100;

export const convertArrayToPostgresString = (array?: string[]) => array
  ? `{${array.join(',')}}`
  : null;

const sqlCreatePhotosTable = () =>
  sql`
    CREATE TABLE IF NOT EXISTS photos (
      id VARCHAR(8) PRIMARY KEY,
      url VARCHAR(255) NOT NULL,
      extension VARCHAR(255) NOT NULL,
      aspect_ratio REAL DEFAULT 1.5,
      blur_data TEXT,
      title VARCHAR(255),
      caption TEXT,
      semantic_description TEXT,
      queens VARCHAR(255)[],
      location_name VARCHAR(255),
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      priority_order REAL,
      taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
      taken_at_naive VARCHAR(255) NOT NULL,
      hidden BOOLEAN,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

// Migration 01
const MIGRATION_FIELDS_01 = ['caption', 'semantic_description'];
const sqlRunMigration01 = () =>
  sql`
    ALTER TABLE photos
    ADD COLUMN IF NOT EXISTS caption TEXT,
    ADD COLUMN IF NOT EXISTS semantic_description TEXT
  `;

// Must provide id as 8-character nanoid
export const sqlInsertPhoto = (photo: PhotoDbInsert) =>
  safelyQueryPhotos(() => sql`
    INSERT INTO photos (
      id,
      url,
      extension,
      aspect_ratio,
      blur_data,
      title,
      caption,
      semantic_description,
      queens,
      location_name,
      latitude,
      longitude,
      priority_order,
      hidden,
      taken_at,
      taken_at_naive
    )
    VALUES (
      ${photo.id},
      ${photo.url},
      ${photo.extension},
      ${photo.aspectRatio},
      ${photo.blurData},
      ${photo.title},
      ${photo.caption},
      ${photo.semanticDescription},
      ${convertArrayToPostgresString(photo.queens)},
      ${photo.locationName},
      ${photo.latitude},
      ${photo.longitude},
      ${photo.priorityOrder},
      ${photo.hidden},
      ${photo.takenAt},
      ${photo.takenAtNaive}
    )
  `);

export const sqlUpdatePhoto = (photo: PhotoDbInsert) =>
  safelyQueryPhotos(() => sql`
    UPDATE photos SET
    url=${photo.url},
    extension=${photo.extension},
    aspect_ratio=${photo.aspectRatio},
    blur_data=${photo.blurData},
    title=${photo.title},
    caption=${photo.caption},
    semantic_description=${photo.semanticDescription},
    queens=${convertArrayToPostgresString(photo.queens)},
    location_name=${photo.locationName},
    latitude=${photo.latitude},
    longitude=${photo.longitude},
    priority_order=${photo.priorityOrder || null},
    hidden=${photo.hidden},
    taken_at=${photo.takenAt},
    taken_at_naive=${photo.takenAtNaive},
    updated_at=${(new Date()).toISOString()}
    WHERE id=${photo.id}
  `);

export const sqlDeletePhotoQueenGlobally = (queen: string) =>
  safelyQueryPhotos(() => sql`
    UPDATE photos
    SET queens=ARRAY_REMOVE(queens, ${queen})
    WHERE ${queen}=ANY(queens)
  `);

export const sqlRenamePhotoQueenGlobally = (queen: string, updatedQueen: string) =>
  safelyQueryPhotos(() => sql`
    UPDATE photos
    SET queens=ARRAY_REPLACE(queens, ${queen}, ${updatedQueen})
    WHERE ${queen}=ANY(queens)
  `);

export const sqlDeletePhoto = (id: string) =>
  safelyQueryPhotos(() => sql`DELETE FROM photos WHERE id=${id}`);

const sqlGetPhoto = (id: string) =>
  safelyQueryPhotos(() =>
    sql<PhotoDb>`SELECT * FROM photos WHERE id=${id} LIMIT 1`
  );

const sqlGetPhotosCount = async () => sql`
  SELECT COUNT(*) FROM photos
  WHERE hidden IS NOT TRUE
`.then(({ rows }) => parseInt(rows[0].count, 10));

const sqlGetPhotosCountIncludingHidden = async () => sql`
  SELECT COUNT(*) FROM photos
`.then(({ rows }) => parseInt(rows[0].count, 10));

const sqlGetPhotosQueenCount = async (queen: string) => sql`
  SELECT COUNT(*) FROM photos
  WHERE ${queen}=ANY(queens) AND
  hidden IS NOT TRUE
`.then(({ rows }) => parseInt(rows[0].count, 10));

const sqlGetPhotosCameraCount = async () => sql`
  SELECT COUNT(*) FROM photos
  WHERE hidden IS NOT TRUE
`.then(({ rows }) => parseInt(rows[0].count, 10));

const sqlGetPhotosDateRange = async () => sql`
  SELECT MIN(taken_at_naive) as start, MAX(taken_at_naive) as end
  FROM photos
  WHERE hidden IS NOT TRUE
`.then(({ rows }) => rows[0]?.start && rows[0]?.end
    ? rows[0] as PhotoDateRange
    : undefined);

const sqlGetPhotosQueenDateRange = async (queen: string) => sql`
  SELECT MIN(taken_at_naive) as start, MAX(taken_at_naive) as end
  FROM photos
  WHERE ${queen}=ANY(queens) AND
  hidden IS NOT TRUE
`.then(({ rows }) => rows[0]?.start && rows[0]?.end
    ? rows[0] as PhotoDateRange
    : undefined);

const sqlGetPhotosCameraDateRange = async () => sql`
  SELECT MIN(taken_at_naive) as start, MAX(taken_at_naive) as end
  FROM photos
  WHERE hidden IS NOT TRUE
`.then(({ rows }) => rows[0]?.start && rows[0]?.end
    ? rows[0] as PhotoDateRange
    : undefined);

const sqlGetUniqueQueens = async () => sql`
  SELECT DISTINCT unnest(queens) as queen, COUNT(*)
  FROM photos
  WHERE hidden IS NOT TRUE
  GROUP BY queen
  ORDER BY queen ASC
`.then(({ rows }): Queens => rows.map(({ queen, count }) => ({
    queen: queen as string,
    count: parseInt(count, 10),
  })));

const sqlGetUniqueQueensHidden = async () => sql`
  SELECT DISTINCT unnest(queens) as queen, COUNT(*)
  FROM photos
  GROUP BY queen
  ORDER BY queen ASC
`.then(({ rows }): Queens => rows.map(({ queen, count }) => ({
    queen: queen as string,
    count: parseInt(count, 10),
  })));

export type GetPhotosOptions = {
  sortBy?: 'createdAt' | 'takenAt' | 'priority'
  limit?: number
  offset?: number
  query?: string
  queen?: string
  camera?: Camera
  takenBefore?: Date
  takenAfterInclusive?: Date
  includeHidden?: boolean
}

const safelyQueryPhotos = async <T>(callback: () => Promise<T>): Promise<T> => {
  let result: T;

  try {
    result = await callback();
  } catch (e: any) {
    if (MIGRATION_FIELDS_01.some(field => new RegExp(
      `column "${field}" of relation "photos" does not exist`,
      'i',
    ).test(e.message))) {
      console.log('Running migration 01 ...');
      await sqlRunMigration01();
      result = await callback();
    } else if (/relation "photos" does not exist/i.test(e.message)) {
      // If the table does not exist, create it
      console.log('Creating photos table ...');
      await sqlCreatePhotosTable();
      result = await callback();
    } else if (/endpoint is in transition/i.test(e.message)) {
      // Wait 5 seconds and try again
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        result = await callback();
      } catch (e: any) {
        console.log(`sql get error on retry (after 5000ms): ${e.message} `);
        throw e;
      }
    } else {
      console.log(`sql get error: ${e.message} `);
      throw e;
    }
  }

  return result;
};

export const getPhotos = async (options: GetPhotosOptions = {}) => {
  const {
    sortBy = PRIORITY_ORDER_ENABLED ? 'priority' : 'takenAt',
    limit = PHOTO_DEFAULT_LIMIT,
    offset = 0,
    query,
    queen,
    takenBefore,
    takenAfterInclusive,
    includeHidden,
  } = options;

  let sql = ['SELECT * FROM photos'];
  let values = [] as (string | number)[];
  let valueIndex = 1;

  // WHERE
  let wheres = [] as string[];
  if (!includeHidden) {
    wheres.push('hidden IS NOT TRUE');
  }
  if (takenBefore) {
    wheres.push(`taken_at > $${valueIndex++}`);
    values.push(takenBefore.toISOString());
  }
  if (takenAfterInclusive) {
    wheres.push(`taken_at <= $${valueIndex++}`);
    values.push(takenAfterInclusive.toISOString());
  }
  if (query) {
    // eslint-disable-next-line max-len
    wheres.push(`CONCAT(title, ' ', caption, ' ', semantic_description) ILIKE $${valueIndex++}`);
    values.push(`%${query.toLocaleLowerCase()}%`);
  }
  if (queen) {
    wheres.push(`$${valueIndex++}=ANY(queens)`);
    values.push(queen);
  }
  /* if (camera) {
    wheres.push(`LOWER(REPLACE(make, ' ', '-'))=$${valueIndex++}`);
    wheres.push(`LOWER(REPLACE(model, ' ', '-'))=$${valueIndex++}`);
    values.push(parameterize(camera.make, true));
    values.push(parameterize(camera.model, true));
  } */
  
  if (wheres.length > 0) {
    sql.push(`WHERE ${wheres.join(' AND ')}`);
  }

  // ORDER BY
  switch (sortBy) {
  case 'createdAt':
    sql.push('ORDER BY created_at DESC');
    break;
  case 'takenAt':
    sql.push('ORDER BY taken_at DESC');
    break;
  case 'priority':
    sql.push('ORDER BY priority_order ASC, taken_at DESC');
    break;
  }

  // LIMIT + OFFSET
  sql.push(`LIMIT $${valueIndex++} OFFSET $${valueIndex++}`);
  values.push(limit, offset);

  return safelyQueryPhotos(async () => {
    const client = await db.connect();
    return client.query(sql.join(' '), values);
  })
    .then(({ rows }) => rows.map(parsePhotoFromDb));
};

export const getPhotosNearId = async (
  id: string,
  limit: number,
) => {
  const orderBy = PRIORITY_ORDER_ENABLED
    ? 'ORDER BY priority_order ASC, taken_at DESC'
    : 'ORDER BY taken_at DESC';

  return safelyQueryPhotos(async () => {
    const client = await db.connect();
    return client.query(
      `
        WITH twi AS (
          SELECT *, row_number()
          OVER (${orderBy}) as row_number
          FROM photos
          WHERE hidden IS NOT TRUE
        ),
        current AS (SELECT row_number FROM twi WHERE id = $1)
        SELECT twi.*
        FROM twi, current
        WHERE twi.row_number >= current.row_number - 1
        LIMIT $2
      `,
      [id, limit]
    );
  })
    .then(({ rows }) => rows.map(parsePhotoFromDb));
};

export const getPhoto = async (id: string): Promise<Photo | undefined> => {
  // Check for photo id forwarding
  // and convert short ids to uuids
  const photoId = translatePhotoId(id);
  return safelyQueryPhotos(() => sqlGetPhoto(photoId))
    .then(({ rows }) => rows.map(parsePhotoFromDb))
    .then(photos => photos.length > 0 ? photos[0] : undefined);
};
export const getPhotosDateRange = () =>
  safelyQueryPhotos(sqlGetPhotosDateRange);
export const getPhotosCount = () =>
  safelyQueryPhotos(sqlGetPhotosCount);
export const getPhotosCountIncludingHidden = () =>
  safelyQueryPhotos(sqlGetPhotosCountIncludingHidden);

// QUEENS
export const getUniqueQueens = () =>
  safelyQueryPhotos(sqlGetUniqueQueens);
export const getUniqueQueensHidden = () =>
  safelyQueryPhotos(sqlGetUniqueQueensHidden);
export const getPhotosQueenDateRange = (queen: string) =>
  safelyQueryPhotos(() => sqlGetPhotosQueenDateRange(queen));
export const getPhotosQueenCount = (queen: string) =>
  safelyQueryPhotos(() => sqlGetPhotosQueenCount(queen));

// CAMERAS
export const getPhotosCameraDateRange = () =>
  safelyQueryPhotos(() => sqlGetPhotosCameraDateRange());
export const getPhotosCameraCount = () =>
  safelyQueryPhotos(() => sqlGetPhotosCameraCount());