import proj4 from 'proj4';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';

// BC Albers (EPSG:3005) — the standard projected CRS for British Columbia.
const BC_ALBERS = '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';

// Register EPSG:3005 with proj4 at module load. Every consumer of this module
// (BecIdentifyLayer, LeafletMap, etc.) gets the definition automatically on
// first import, so they don't have to remember to call defineBcAlbers() first.
proj4.defs('EPSG:3005', BC_ALBERS);

/**
 * Register EPSG:3005 (BC Albers) with proj4. Also called automatically at
 * module load; this function is kept for tests that want to re-register it
 * after clearing proj4 state. Safe to call multiple times (idempotent).
 */
export const defineBcAlbers = (): void => {
  proj4.defs('EPSG:3005', BC_ALBERS);
};

/**
 * Reproject a point from BC Albers (EPSG:3005) to WGS84. Input is
 * `[easting, northing]` in metres; output is `[lng, lat]` in degrees.
 */
export const bcAlbersToWgs84 = (coords: [number, number]): [number, number] => proj4('EPSG:3005', 'EPSG:4326', coords) as [number, number];

/**
 * Reproject a point from WGS84 to BC Albers (EPSG:3005). Input is
 * `[lng, lat]` in degrees; output is `[easting, northing]` in metres.
 */
export const wgs84ToBcAlbers = (coords: [number, number]): [number, number] => proj4('EPSG:4326', 'EPSG:3005', coords) as [number, number];

/**
 * Parse the legacy `extent=minX,minY,maxX,maxY` URL param (BC Albers) into a
 * Leaflet LatLngBoundsExpression in WGS84 (Leaflet takes [lat, lng] tuples).
 */
export const parseExtentParam = (str: string): LatLngBoundsExpression => {
  const [minX, minY, maxX, maxY] = str.split(',').map(Number);
  const sw = bcAlbersToWgs84([minX, minY]);
  const ne = bcAlbersToWgs84([maxX, maxY]);
  // Leaflet wants [lat, lng] — proj4 gave us [lng, lat], so flip.
  return [
    [sw[1], sw[0]] as LatLngTuple,
    [ne[1], ne[0]] as LatLngTuple
  ];
};

/**
 * Parse the legacy lowercase `beczone=IDF,MH_,SBS` URL param.
 * Trailing underscore on a code marks it as "not suitable for this species."
 */
export const parseBecZoneParam = (str: string): { codes: string[]; notSuit: string[] } => {
  const raw = str.split(',');
  const codes: string[] = [];
  const notSuit: string[] = [];
  raw.forEach((item) => {
    if (item.endsWith('_')) {
      const code = item.slice(0, -1);
      codes.push(code);
      notSuit.push(code);
    } else {
      codes.push(item);
    }
  });
  return { codes, notSuit };
};

/**
 * Parse the CBST `becZone=IDFmw1` URL param — a single concatenated
 * zone+subzone+variant value emitted by CbstAltAction / SuitableSeedlotVeglotCbstAction
 * in the legacy JSP app. Distinct from the lowercase `beczone` comma-list.
 */
export const parseBecZoneCamelCaseParam = (str: string): { code: string } => ({ code: str });
