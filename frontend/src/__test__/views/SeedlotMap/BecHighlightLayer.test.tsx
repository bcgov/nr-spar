import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import L from 'leaflet';

import BecHighlightLayer from '../../../views/Seedlot/SeedlotMap/BecHighlightLayer';
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
  wmsSpy.mockReturnValue({ addTo: vi.fn().mockReturnThis(), remove: vi.fn() } as unknown as L.TileLayer.WMS);
});

const SeedZones = ({
  codes,
  notSuit,
  shape,
}: {
  codes: string[];
  notSuit: string[];
  shape: 'zone' | 'mapLabel';
}) => {
  const { setBecZones } = useSparMap();
  React.useEffect(() => {
    setBecZones(codes, notSuit, shape);
  }, [setBecZones, codes, notSuit, shape]);
  return null;
};

const renderWithZones = (
  codes: string[],
  notSuit: string[],
  shape: 'zone' | 'mapLabel' = 'zone'
) =>
  render(
    <SparMapProvider>
      <SeedZones codes={codes} notSuit={notSuit} shape={shape} />
      <BecHighlightLayer />
    </SparMapProvider>
  );

describe('BecHighlightLayer', () => {
  it('adds no layers when both code lists are empty', () => {
    renderWithZones([], []);
    expect(wmsSpy).not.toHaveBeenCalled();
  });

  it('adds one gold-styled layer when all codes are suitable', () => {
    renderWithZones(['IDF', 'SBS'], []);
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as { cql_filter: string; sld_body?: string };
    expect(opts.cql_filter).toBe("ZONE IN ('IDF','SBS')");
    // Suitable codes are painted with the legacy SPAR gold #D5C262 at
    // 30% opacity + red #FF0301 stroke. Matches sparmapIdentifyBec.js
    // `initQueryValues('BEC', ...)` defaults.
    expect(opts.sld_body).toBeDefined();
    expect(opts.sld_body).toContain('#D5C262');
    expect(opts.sld_body).toContain('#FF0301');
  });

  it('adds one purple layer when all codes are not-suitable', () => {
    renderWithZones(['MH'], ['MH']);
    expect(wmsSpy).toHaveBeenCalledTimes(1);
    const opts = wmsSpy.mock.calls[0][1] as { cql_filter: string; sld_body?: string };
    expect(opts.cql_filter).toBe("ZONE IN ('MH')");
    expect(opts.sld_body).toBeDefined();
  });

  it('adds two layers when codes are split — gold for suitable, purple for not-suitable', () => {
    renderWithZones(['IDF', 'MH', 'SBS'], ['MH']);
    expect(wmsSpy).toHaveBeenCalledTimes(2);
    const calls = wmsSpy.mock.calls.map(
      (c) => c[1] as { cql_filter: string; sld_body?: string }
    );
    const suit = calls.find((c) => c.sld_body?.includes('#D5C262'));
    const notSuit = calls.find((c) => c.sld_body?.includes('#800080'));
    expect(suit?.cql_filter).toBe("ZONE IN ('IDF','SBS')");
    expect(notSuit?.cql_filter).toBe("ZONE IN ('MH')");
  });

  it('uses MAP_LABEL filter when shape is mapLabel', () => {
    renderWithZones(['IDFmw1'], [], 'mapLabel');
    const opts = wmsSpy.mock.calls[0][1] as { cql_filter: string };
    expect(opts.cql_filter).toBe("MAP_LABEL IN ('IDFmw1')");
  });
});
