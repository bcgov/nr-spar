/**
 * Collection-area size cap. The registration form's radius cannot exceed 8 km,
 * and a drawn or imported polygon is measured with the same definition the
 * form records: half the longest distance across the area. See
 * `collectionRadiusKm` in `AoiToolbar/aoiValidation.ts`.
 */
export const MAX_COLLECTION_RADIUS_KM = 8;

/**
 * Sanity bound on polygon complexity, mirroring backend
 * `CollectionAreaLimits.MAX_VERTICES`. Not a transport limit — spatial queries
 * are POSTed to the OpenMaps proxy, so the WKT is not constrained by URL
 * length. This exists so one collection area cannot cost DataBC or PostGIS an
 * unbounded amount of work.
 */
export const MAX_COLLECTION_VERTICES = 2000;
