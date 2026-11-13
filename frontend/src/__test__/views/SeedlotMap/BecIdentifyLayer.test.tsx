import React from 'react';
import {
  render, screen, act, fireEvent
} from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import BecIdentifyLayer, { buildIdentifyCqlFilters } from '../../../views/Seedlot/SeedlotMap/BecIdentifyLayer';
import { useWfsGetFeature } from '../../../hooks/useWfsGetFeature';
import {
  BEC_QUERY_LAYER, SEEDLOT_QUERY_LAYER, SPZ_QUERY_LAYER, VEGLOT_QUERY_LAYER
} from '../../../shared-constants/spar-map';

type ClickHandler = (e: { latlng: L.LatLng }) => void;
let onClick: ClickHandler = () => {};
const container = document.createElement('div');
const ctx: Record<string, unknown> = {};
let responses: Record<string, unknown[]> = {};

vi.mock('react-leaflet', () => ({
  useMap: () => ({ getContainer: () => container }),
  useMapEvent: (_name: string, fn: ClickHandler) => { onClick = fn; },
  GeoJSON: ({ style }: { style: { color: string } }) => <div data-testid="highlight" data-color={style.color} />,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../hooks/useWfsGetFeature', () => ({
  useWfsGetFeature: vi.fn(({ layer, enabled }: { layer: string; enabled: boolean }) => ({
    data: enabled ? { type: 'FeatureCollection', features: responses[layer] ?? [] } : undefined
  }))
}));

const polygonFeature = (properties: Record<string, unknown>) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Polygon', coordinates: [[[-123, 49], [-122, 49], [-122, 50], [-123, 49]]] }
});

const renderAndClick = () => {
  render(<BecIdentifyLayer layerTypeName={BEC_QUERY_LAYER} />);
  act(() => onClick({ latlng: L.latLng(49.5, -123.1) }));
};

const popupText = () => screen.getByTestId('bec-identify-popup').textContent;

beforeEach(() => {
  vi.clearAllMocks();
  responses = {};
  Object.assign(ctx, {
    identifyActive: true,
    addImportedLayersToMap: vi.fn(),
    cancelAoiMode: vi.fn()
  });
});

describe('buildIdentifyCqlFilters', () => {
  it('buffers point layers by 1 km and intersects polygon layers, without legacy URL filters', () => {
    const { pointCql, polygonCql } = buildIdentifyCqlFilters([1000, 2000]);
    expect(pointCql).toBe('DWITHIN(GEOMETRY, POINT(1000 2000), 1000, meters)');
    expect(polygonCql).toBe('INTERSECTS(GEOMETRY, POINT(1000 2000))');
    [pointCql, polygonCql].forEach((cql) => {
      expect(cql).not.toMatch(/ IN\(|SEEDLOT_NUMBER =/);
    });
  });

  it('returns empty filters before a click', () => {
    expect(buildIdentifyCqlFilters(null)).toEqual({ pointCql: '', polygonCql: '' });
  });
});

describe('BecIdentifyLayer', () => {
  it('does nothing until identify mode is on', () => {
    ctx.identifyActive = false;
    responses[BEC_QUERY_LAYER] = [polygonFeature({ ZONE: 'CWH' })];
    renderAndClick();
    expect(screen.queryByTestId('bec-identify-popup')).not.toBeInTheDocument();
    expect(container.classList.contains('identify-active')).toBe(false);
  });

  it('marks the map container while identify is on', () => {
    const { unmount } = render(<BecIdentifyLayer layerTypeName={BEC_QUERY_LAYER} />);
    expect(container.classList.contains('identify-active')).toBe(true);
    unmount();
    expect(container.classList.contains('identify-active')).toBe(false);
  });

  it('shows nothing when no layer has a feature at the point', () => {
    renderAndClick();
    expect(screen.queryByTestId('bec-identify-popup')).not.toBeInTheDocument();
    expect(useWfsGetFeature).toHaveBeenCalledWith(expect.objectContaining({ layer: SEEDLOT_QUERY_LAYER, enabled: true }));
  });

  it('prefers a seedlot over everything else and hides Copy as AOI for points', () => {
    responses[SEEDLOT_QUERY_LAYER] = [{
      type: 'Feature',
      properties: {
        SEEDLOT_NUMBER: '60001', VEGETATION_CODE: 'FDC', ACTIVE_IND: 'YES', USE_ELEVATION: '300'
      },
      geometry: { type: 'Point', coordinates: [-123, 49] }
    }];
    responses[BEC_QUERY_LAYER] = [polygonFeature({ ZONE: 'CWH' })];
    renderAndClick();
    expect(popupText()).toContain('Seedlot 60001');
    expect(popupText()).toContain('Active');
    expect(popupText()).toContain('Use elev300');
    expect(screen.getByTestId('highlight')).toHaveAttribute('data-color', '#ff0000');
    expect(screen.queryByTestId('bec-identify-copy-to-aoi')).not.toBeInTheDocument();
  });

  it('falls back to a veg lot', () => {
    responses[VEGLOT_QUERY_LAYER] = [{
      type: 'Feature', properties: { VEG_LOT_ID: 'V12', ACTIVE_IND: 'NO' }, geometry: null
    }];
    renderAndClick();
    expect(popupText()).toContain('Veg Lot V12');
    expect(popupText()).toContain('Expired');
  });

  it('describes a BEC zone with its area and copies it as an AOI', () => {
    responses[BEC_QUERY_LAYER] = [polygonFeature({
      ZONE_NAME: 'Coastal Western Hemlock', ZONE: 'CWH', SUBZONE: 'xm', VARIANT: null, FEATURE_AREA_SQM: 2_500_000
    })];
    renderAndClick();
    expect(popupText()).toContain('Coastal Western Hemlock');
    expect(popupText()).toContain('2.5 km²');
    expect(popupText()).not.toContain('Variant');
    fireEvent.click(screen.getByTestId('bec-identify-copy-to-aoi'));
    expect(ctx.addImportedLayersToMap).toHaveBeenCalledWith([
      expect.objectContaining({ geometry: expect.objectContaining({ type: 'Polygon' }) })
    ]);
    expect(screen.queryByTestId('bec-identify-popup')).not.toBeInTheDocument();
  });

  it('splits a MultiPolygon seed plan zone into one AOI per polygon', () => {
    const ring = [[[-123, 49], [-122, 49], [-122, 50], [-123, 49]]];
    responses[SPZ_QUERY_LAYER] = [{
      type: 'Feature',
      properties: { SEED_PLAN_ZONE_CODE: 'M', SEED_PLAN_ZONE_ID: 7 },
      geometry: { type: 'MultiPolygon', coordinates: [ring, ring] }
    }];
    renderAndClick();
    expect(popupText()).toContain('Seed Plan Zone');
    expect(popupText()).toContain('ID7');
    expect(screen.getByTestId('highlight')).toHaveAttribute('data-color', '#0000ff');
    fireEvent.click(screen.getByTestId('bec-identify-copy-to-aoi'));
    expect((ctx.addImportedLayersToMap as ReturnType<typeof vi.fn>).mock.calls[0][0]).toHaveLength(2);
  });

  it('hides Copy as AOI on themes without drawing', () => {
    ctx.cancelAoiMode = null;
    responses[BEC_QUERY_LAYER] = [polygonFeature({ ZONE: 'CWH' })];
    renderAndClick();
    expect(popupText()).toContain('BEC Zone');
    expect(screen.queryByTestId('bec-identify-copy-to-aoi')).not.toBeInTheDocument();
  });
});
