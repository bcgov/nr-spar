/**
 * Collection-area size caps. The registration form's radius cannot exceed
 * 8 km, so a drawn/imported polygon must not span more than that diameter.
 */
export const MAX_COLLECTION_RADIUS_KM = 8;

/** Diameter of an 8 km-radius circle, plus a little geodesic slack. */
export const MAX_COLLECTION_EXTENT_KM = MAX_COLLECTION_RADIUS_KM * 2 + 0.1;

/** Matches backend {@code CollectionAreaLimits.MAX_VERTICES}. */
export const MAX_COLLECTION_VERTICES = 2000;
