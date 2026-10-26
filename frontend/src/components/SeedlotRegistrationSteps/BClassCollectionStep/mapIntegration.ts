import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import type { CollectionAreaResult } from '../../../types/SparMapTypes';
import { BecCatalogueItem } from '../../../api-service/becCatalogueAPI';
import { BClassCollectionForm } from './definitions';
import { initBClassCollectionState } from './utils';

interface Dms {
  deg: string;
  min: string;
  sec: string;
}

/**
 * Convert a decimal-degree coordinate to whole degrees/minutes/seconds.
 * The B-class collection form stores the hemisphere separately (latitude
 * "N", longitude "W"), so only the magnitude is returned here. Seconds
 * that round up to 60 roll over into minutes, and minutes into degrees.
 */
export const decimalToDms = (decimal: number): Dms => {
  const abs = Math.abs(decimal);
  let deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  let min = Math.floor(minFloat);
  let sec = Math.round((minFloat - min) * 60);
  if (sec === 60) {
    sec = 0;
    min += 1;
  }
  if (min === 60) {
    min = 0;
    deg += 1;
  }
  return { deg: String(deg), min: String(min), sec: String(sec) };
};

const findZone = (
  catalogue: BecCatalogueItem[] | undefined,
  zoneCode: string
): MultiOptionsObj => {
  const row = catalogue?.find((item) => item.becZoneCode === zoneCode);
  if (!row) {
    return { code: zoneCode, description: '', label: zoneCode };
  }
  return {
    code: row.becZoneCode,
    description: row.becZoneName,
    label: `${row.becZoneCode} - ${row.becZoneName}`
  };
};

const findSubzone = (
  catalogue: BecCatalogueItem[] | undefined,
  zoneCode: string,
  subzoneCode: string
): MultiOptionsObj => {
  const row = catalogue?.find(
    (item) => item.becZoneCode === zoneCode && item.becSubzoneCode === subzoneCode
  );
  if (!row) {
    return { code: subzoneCode, description: '', label: subzoneCode };
  }
  return {
    code: row.becSubzoneCode,
    description: row.becSubzoneName,
    label: `${row.becSubzoneCode} - ${row.becSubzoneName}`
  };
};

const findVariant = (
  catalogue: BecCatalogueItem[] | undefined,
  zoneCode: string,
  subzoneCode: string,
  variantCode: string
): MultiOptionsObj => {
  const row = catalogue?.find(
    (item) => item.becZoneCode === zoneCode
      && item.becSubzoneCode === subzoneCode
      && item.variant === variantCode
  );
  if (!row) {
    return { code: variantCode, description: '', label: variantCode };
  }
  return {
    code: row.variant as string,
    description: row.variantName ?? '',
    label: `${row.variant} - ${row.variantName}`
  };
};

/* eslint-disable no-param-reassign -- helpers mutate a structuredClone of form state */
const applyLatLong = (next: BClassCollectionForm, result: CollectionAreaResult): void => {
  if (result.meanLat != null) {
    const latDms = decimalToDms(result.meanLat);
    next.latDeg.value = latDms.deg;
    next.latMin.value = latDms.min;
    next.latSec.value = latDms.sec;
    next.latDeg.isInvalid = false;
    next.latMin.isInvalid = false;
    next.latSec.isInvalid = false;
  }
  if (result.meanLng != null) {
    const longDms = decimalToDms(result.meanLng);
    next.longDeg.value = longDms.deg;
    next.longMin.value = longDms.min;
    next.longSec.value = longDms.sec;
    next.longDeg.isInvalid = false;
    next.longMin.isInvalid = false;
    next.longSec.isInvalid = false;
  }
};

const applyElevation = (next: BClassCollectionForm, result: CollectionAreaResult): void => {
  if (result.elevationMinM != null) {
    next.elevationMin.value = String(result.elevationMinM);
  }
  if (result.elevationMaxM != null) {
    next.elevationMax.value = String(result.elevationMaxM);
  }
  if (result.elevationMinM != null && result.elevationMaxM != null) {
    next.elevationMean.value = String(
      Math.round((result.elevationMinM + result.elevationMaxM) / 2)
    );
  }
};

const applyBec = (
  next: BClassCollectionForm,
  result: CollectionAreaResult,
  becCatalogue: BecCatalogueItem[] | undefined
): void => {
  if (result.becVariant) {
    const { zone, subzone, variant } = result.becVariant;
    if (zone) {
      next.becZone.value = findZone(becCatalogue, zone);
      next.becZone.isInvalid = false;
    }
    if (zone && subzone) {
      next.becSubzone.value = findSubzone(becCatalogue, zone, subzone);
      next.becSubzone.isInvalid = false;
    }
    if (zone && subzone && variant) {
      next.becVariant.value = findVariant(becCatalogue, zone, subzone, variant);
    } else {
      next.becVariant.value = EmptyMultiOptObj;
    }
    next.becVariant.isInvalid = false;
    return;
  }
  if (result.becZones.length === 1) {
    next.becZone.value = findZone(becCatalogue, result.becZones[0]);
    next.becZone.isInvalid = false;
  }
};

/**
 * Merge the derived SeedMap collection-area values into the B-class
 * collection form state. Populates coordinates, elevation, radius, BEC
 * unit, and stashes the raw GeoJSON for submission. Fields the map can't
 * derive (e.g. dates, containers) are left untouched.
 */
export const applyCollectionAreaResult = (
  state: BClassCollectionForm,
  result: CollectionAreaResult,
  becCatalogue: BecCatalogueItem[] | undefined
): BClassCollectionForm => {
  const next = structuredClone(state);

  next.collectionGeometry.value = result.geoJson;
  applyLatLong(next, result);
  applyElevation(next, result);

  // Already measured as half the longest distance across the area, and already
  // validated against the form's maximum, so it transfers as-is.
  if (result.radiusKm > 0) {
    next.collectionRadius.value = String(result.radiusKm);
    next.collectionRadius.isInvalid = false;
  }

  applyBec(next, result, becCatalogue);

  // The map derives BEC from the drawn geometry, so drive the lat/long
  // auto-BEC checkbox off and let the derived unit stand.
  next.useLatLongForBec.value = false;

  return next;
};

/**
 * Remove the collection area and every value it fills in, returning those
 * fields to their initial state. Fields the map never touches are kept.
 */
export const clearCollectionAreaResult = (
  state: BClassCollectionForm
): BClassCollectionForm => {
  const empty = initBClassCollectionState('');
  return {
    ...structuredClone(state),
    collectionGeometry: empty.collectionGeometry,
    latDeg: empty.latDeg,
    latMin: empty.latMin,
    latSec: empty.latSec,
    longDeg: empty.longDeg,
    longMin: empty.longMin,
    longSec: empty.longSec,
    elevationMin: empty.elevationMin,
    elevationMax: empty.elevationMax,
    elevationMean: empty.elevationMean,
    collectionRadius: empty.collectionRadius,
    becZone: empty.becZone,
    becSubzone: empty.becSubzone,
    becVariant: empty.becVariant,
    useLatLongForBec: empty.useLatLongForBec
  };
};
