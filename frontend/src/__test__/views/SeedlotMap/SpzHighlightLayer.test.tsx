import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import L from 'leaflet';

import SpzHighlightLayer from '../../../views/Seedlot/SeedlotMap/SpzHighlightLayer';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';

const fakeMap = {
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
} as unknown as L.Map;

vi.mock('react-leaflet', () => ({
  useMap: () => fakeMap,
}));

const wmsSpy = vi.spyOn(L.tileLayer, 'wms');

beforeEach(() => {
  vi.clearAllMocks();
  wmsSpy.mockReturnValue({
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  } as unknown as L.TileLayer.WMS);
});

const SpzDriver = ({ ids }: { ids: number[] }) => {
  const { setSpzIds } = useSparMap();
  React.useEffect(() => {
    setSpzIds(ids);
  }, [setSpzIds, ids]);
  return null;
};

const renderWith = (ids: number[]) =>
  render(
    <SparMapProvider>
      <SpzDriver ids={ids} />
      <SpzHighlightLayer />
    </SparMapProvider>
  );

describe('SpzHighlightLayer', () => {
  it('adds no layer when the SPZ ID list is empty', () => {
    renderWith([]);
    expect(wmsSpy).not.toHaveBeenCalled();
  });

  it('adds one CQL-filtered layer when IDs are present', () => {
    renderWith([1284]);
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as {
      layers: string;
      cql_filter: string;
      sld_body?: string;
    };
    expect(opts.layers).toBe('pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW');
    expect(opts.cql_filter).toBe('SEED_PLAN_ZONE_ID IN (1284)');
    expect(opts.sld_body).toBeDefined();
    // Blue polygon SLD must be applied so the highlight pops on the
    // default basemap.
    expect(opts.sld_body).toContain('#0090ff');
    expect(opts.sld_body).toContain('PolygonSymbolizer');
  });

  it('joins multiple IDs into the IN-list without quoting (numeric column)', () => {
    renderWith([1284, 1342, 7]);
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as { cql_filter: string };
    // Numeric IDs go in unquoted — `SEED_PLAN_ZONE_ID` is a NUMBER
    // column in WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW.
    expect(opts.cql_filter).toBe('SEED_PLAN_ZONE_ID IN (1284,1342,7)');
  });
});
