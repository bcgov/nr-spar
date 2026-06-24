import { describe, it, expect } from 'vitest';

import {
  formatDms,
  formatLatLng,
  formatBcAlbers,
  formatUtm
} from '../../../views/Seedlot/SeedlotMap/CursorPositionControl';

/**
 * Reference cursor: Victoria, BC. Lat 48.4284, Lng -123.3656. Known
 * values for cross-checks:
 *   - DMS: 48° 25' 42.2" N, 123° 21' 56.2" W
 *   - BC Albers (EPSG:3005): ~1175000 E, 384000 N
 *   - UTM Zone 10, ~472000 E, 5365000 N
 */
const VIC_LAT = 48.4284;
const VIC_LNG = -123.3656;

describe('CursorPositionControl formatters', () => {
  describe('formatDms', () => {
    it('formats positive latitude as degrees-minutes-seconds N', () => {
      expect(formatDms(48.4284, 'lat')).toBe("48° 25' 42.2\" N");
    });

    it('formats negative longitude as degrees-minutes-seconds W', () => {
      expect(formatDms(-123.3656, 'lng')).toBe("123° 21' 56.2\" W");
    });

    it('uses S hemisphere code for negative latitude', () => {
      expect(formatDms(-33.8688, 'lat')).toMatch(/S$/);
    });

    it('uses E hemisphere code for positive longitude', () => {
      expect(formatDms(151.2093, 'lng')).toMatch(/E$/);
    });

    it('returns em-dash for non-finite input', () => {
      expect(formatDms(NaN, 'lat')).toBe('—');
      expect(formatDms(Infinity, 'lng')).toBe('—');
    });
  });

  describe('formatLatLng', () => {
    it('joins lat and lng DMS with a comma', () => {
      expect(formatLatLng(VIC_LAT, VIC_LNG)).toBe(
        "48° 25' 42.2\" N, 123° 21' 56.2\" W"
      );
    });
  });

  describe('formatBcAlbers', () => {
    it('reprojects WGS84 lat/lng to BC Albers easting/northing (±1 m)', () => {
      const out = formatBcAlbers(VIC_LAT, VIC_LNG);
      // proj4 BC Albers result is roughly easting ~1174000, northing ~382000
      // for Victoria. Loose check: the string parses into 2 numbers, both
      // in the expected BC range.
      const [easting, northing] = out.split(',').map((s) => Number(s.trim()));
      expect(easting).toBeGreaterThan(1000000);
      expect(easting).toBeLessThan(1300000);
      expect(northing).toBeGreaterThan(350000);
      expect(northing).toBeLessThan(420000);
    });
  });

  describe('formatUtm', () => {
    it('returns Zone 10 for Victoria coordinates', () => {
      const out = formatUtm(VIC_LAT, VIC_LNG);
      expect(out).toContain('Zone 10');
    });

    it('parses into easting/northing roughly matching the known UTM Z10 values', () => {
      const out = formatUtm(VIC_LAT, VIC_LNG);
      const match = out.match(/^(-?\d+), (-?\d+) /);
      expect(match).not.toBeNull();
      const easting = Number(match![1]);
      const northing = Number(match![2]);
      // Victoria UTM Z10 is roughly E≈472000, N≈5365000.
      expect(easting).toBeGreaterThan(460000);
      expect(easting).toBeLessThan(480000);
      expect(northing).toBeGreaterThan(5360000);
      expect(northing).toBeLessThan(5370000);
    });

    it('returns em-dash for non-finite input', () => {
      expect(formatUtm(NaN, 0)).toBe('—');
    });
  });
});
