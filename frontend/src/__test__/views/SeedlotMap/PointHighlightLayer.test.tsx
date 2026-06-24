import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import L from 'leaflet';

import PointHighlightLayer from '../../../views/Seedlot/SeedlotMap/PointHighlightLayer';
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

const HighlightDriver = ({
  seedlot,
  veglot,
}: {
  seedlot: string | null;
  veglot: string | null;
}) => {
  const { setHighlightPoint } = useSparMap();
  React.useEffect(() => {
    setHighlightPoint(seedlot, veglot);
  }, [setHighlightPoint, seedlot, veglot]);
  return null;
};

const renderWith = (seedlot: string | null, veglot: string | null) =>
  render(
    <SparMapProvider>
      <HighlightDriver seedlot={seedlot} veglot={veglot} />
      <PointHighlightLayer />
    </SparMapProvider>
  );

describe('PointHighlightLayer', () => {
  it('adds no layer when both seedlot and veglot are null', () => {
    renderWith(null, null);
    expect(wmsSpy).not.toHaveBeenCalled();
  });

  it('adds a seedlot point layer with the correct CQL filter', () => {
    renderWith('04404', null);
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as {
      layers: string;
      cql_filter: string;
      sld_body?: string;
    };
    expect(opts.layers).toBe('pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW');
    expect(opts.cql_filter).toBe("SEEDLOT_NUMBER = '04404'");
    // Red-circle SLD must be supplied so the point shows in red even on
    // GeoServer environments that don't have a default seedlot style.
    expect(opts.sld_body).toBeDefined();
    expect(opts.sld_body).toContain('#FF0000');
    expect(opts.sld_body).toContain('PointSymbolizer');
  });

  it('adds a veglot point layer with the correct CQL filter', () => {
    renderWith(null, '99999');
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as {
      layers: string;
      cql_filter: string;
      sld_body?: string;
    };
    expect(opts.layers).toBe('pub:WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW');
    expect(opts.cql_filter).toBe("VEG_LOT_ID = '99999'");
    expect(opts.sld_body).toBeDefined();
    expect(opts.sld_body).toContain('#FF0000');
  });

  it('seedlot wins when both URL params are passed (mutual exclusivity)', () => {
    // setHighlightPoint enforces this at the provider boundary, so the
    // layer should only ever see the seedlot side. Verify by passing
    // both — only one WMS call should fire and it should target the
    // seedlot layer.
    renderWith('04404', '99999');
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as { layers: string; cql_filter: string };
    expect(opts.layers).toBe('pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW');
    expect(opts.cql_filter).toBe("SEEDLOT_NUMBER = '04404'");
  });

  it('escapes embedded single quotes defensively', () => {
    // Real seedlot numbers are pure digits, but if a malformed URL ever
    // smuggles in an apostrophe we don't want it breaking the CQL.
    renderWith("O'Neill", null);
    const opts = wmsSpy.mock.calls[0][1] as { cql_filter: string };
    expect(opts.cql_filter).toBe("SEEDLOT_NUMBER = 'O''Neill'");
  });
});
