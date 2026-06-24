import { describe, it, expect, beforeAll } from 'vitest';
import {
  defineBcAlbers,
  bcAlbersToWgs84,
  wgs84ToBcAlbers,
  parseExtentParam,
  parseBecZoneParam,
  parseBecZoneCamelCaseParam,
} from '../../legacy_translated/SPR_SPATIAL_UTILS';

describe('SPR_SPATIAL_UTILS', () => {
  beforeAll(() => defineBcAlbers());

  it('round-trips a BC Albers point through WGS84', () => {
    const bcAlbers: [number, number] = [1200000, 700000];
    const wgs84 = bcAlbersToWgs84(bcAlbers);
    const back = wgs84ToBcAlbers(wgs84);
    expect(back[0]).toBeCloseTo(bcAlbers[0], 3);
    expect(back[1]).toBeCloseTo(bcAlbers[1], 3);
  });

  it('parses an extent param string', () => {
    // BC Albers extent → reprojected bounds in [lat, lng] format for Leaflet
    const bounds = parseExtentParam('1100000,650000,1300000,750000');
    // Just verify the shape — exact values depend on proj4 and are implementation-detail
    expect(Array.isArray(bounds)).toBe(true);
    expect(bounds).toHaveLength(2);
    const [sw, ne] = bounds as [[number, number], [number, number]];
    expect(sw).toHaveLength(2);
    expect(ne).toHaveLength(2);
    // Sanity: BC bounding box is roughly lat 48-60, lng -139 to -114
    expect(sw[0]).toBeGreaterThan(40);
    expect(sw[0]).toBeLessThan(65);
    expect(sw[1]).toBeLessThan(-100);
    expect(sw[1]).toBeGreaterThan(-145);
  });

  it('reprojects a south-interior BC Albers extent to a sensible WGS84 bbox', () => {
    // The BC Albers values below come from a legacy SPAR `extent=` URL.
    // proj4 lands the centroid at approximately (50.0°N, -120.0°W) —
    // roughly the Merritt/Princeton corridor in BC's southern interior.
    // Allow a ~0.5° pad in each direction so the assertion isn't tied
    // to proj4's exact rounding.
    const bounds = parseExtentParam(
      '1424659.679,567002.918,1434659.679,577002.918'
    );
    const [sw, ne] = bounds as [[number, number], [number, number]];
    const centroidLat = (sw[0] + ne[0]) / 2;
    const centroidLng = (sw[1] + ne[1]) / 2;
    expect(centroidLat).toBeGreaterThan(49.5);
    expect(centroidLat).toBeLessThan(50.5);
    expect(centroidLng).toBeGreaterThan(-120.5);
    expect(centroidLng).toBeLessThan(-119.5);
    // SW corner must be lat-south and lng-west of the NE corner.
    expect(sw[0]).toBeLessThan(ne[0]);
    expect(sw[1]).toBeLessThan(ne[1]);
  });

  it('parses a lowercase comma-list beczone param with not-suit suffix', () => {
    const result = parseBecZoneParam('IDF,MH_,SBS');
    expect(result.codes).toEqual(['IDF', 'MH', 'SBS']);
    expect(result.notSuit).toEqual(['MH']);
  });

  it('parses a lowercase beczone with no not-suit suffix', () => {
    const result = parseBecZoneParam('IDF,SBS,BWBS');
    expect(result.codes).toEqual(['IDF', 'SBS', 'BWBS']);
    expect(result.notSuit).toEqual([]);
  });

  it('parses a camelCase becZone single concatenated value', () => {
    const result = parseBecZoneCamelCaseParam('IDFmw1');
    expect(result.code).toBe('IDFmw1');
  });
});
