import { describe, it, expect } from 'vitest';

import { buildIdentifyCqlFilters } from '../../../views/Seedlot/SeedlotMap/BecIdentifyLayer';

describe('buildIdentifyCqlFilters', () => {
  it('returns empty strings when albersCoords is null (no clicked point)', () => {
    expect(buildIdentifyCqlFilters(null)).toEqual({ pointCql: '', polygonCql: '' });
  });

  it('builds a 1 km DWITHIN point CQL for seedlot/veglot identify', () => {
    const { pointCql } = buildIdentifyCqlFilters([1424659.679, 567002.918]);
    expect(pointCql).toBe(
      'DWITHIN(GEOMETRY, POINT(1424659.679 567002.918), 1000, meters)'
    );
  });

  it('builds a point-INTERSECTS polygon CQL for BEC/SPZ identify', () => {
    const { polygonCql } = buildIdentifyCqlFilters([1424659.679, 567002.918]);
    expect(polygonCql).toBe('INTERSECTS(GEOMETRY, POINT(1424659.679 567002.918))');
  });

  // The next four assertions pin the deliberate divergence from legacy
  // sparmap.js (audit findings A2 + A3). Legacy filtered identify
  // queries to the URL's beczone= / spzid= / seedlot= params; the new
  // code intentionally drops those filters so any feature at the click
  // point is identifiable. If any of these regress, that filter has
  // crept back in and operators will lose the enhanced cascade.
  it('does NOT include a legacy MAP_LABEL IN(...) filter on BEC identify', () => {
    const { polygonCql } = buildIdentifyCqlFilters([1, 2]);
    expect(polygonCql).not.toMatch(/MAP_LABEL\s+IN/i);
  });

  it('does NOT include a legacy SEED_PLAN_ZONE_ID IN(...) filter on SPZ identify', () => {
    const { polygonCql } = buildIdentifyCqlFilters([1, 2]);
    expect(polygonCql).not.toMatch(/SEED_PLAN_ZONE_ID\s+IN/i);
  });

  it('does NOT include a legacy SEEDLOT_NUMBER = filter on point identify', () => {
    const { pointCql } = buildIdentifyCqlFilters([1, 2]);
    expect(pointCql).not.toMatch(/SEEDLOT_NUMBER\s*=/i);
  });

  it('does NOT include a legacy VEG_LOT_ID = filter on point identify', () => {
    const { pointCql } = buildIdentifyCqlFilters([1, 2]);
    expect(pointCql).not.toMatch(/VEG_LOT_ID\s*=/i);
  });
});
