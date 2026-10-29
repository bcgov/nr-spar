import type { Feature, MultiPolygon } from 'geojson';

import {
  deriveCollectionAreaResult,
  serializeCollectionArea
} from '../../views/Seedlot/SeedlotMap/collectionAreaResult';
import { MAX_COLLECTION_VERTICES } from '../../views/Seedlot/SeedlotMap/collectionAreaLimits';

/** Mirrors backend `CollectionAreaLimits.MAX_GEOJSON_CHARS`. */
const BACKEND_MAX_GEOJSON_CHARS = 64_000;

vi.mock('../../api-service/becZonesApi', () => ({
  fetchBecVariantAt: vi.fn()
}));

vi.mock('../../api-service/elevationApi', () => ({
  fetchPolygonElevationRange: vi.fn()
}));

const { fetchBecVariantAt } = await import('../../api-service/becZonesApi');
const { fetchPolygonElevationRange } = await import('../../api-service/elevationApi');

const squareFeature = (): Feature<MultiPolygon> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [[
      [
        [-123.1, 48.1],
        [-123.0, 48.1],
        [-123.0, 48.2],
        [-123.1, 48.2],
        [-123.1, 48.1]
      ]
    ]]
  }
});

describe('deriveCollectionAreaResult', () => {
  beforeEach(() => {
    vi.mocked(fetchBecVariantAt).mockReset();
    vi.mocked(fetchPolygonElevationRange).mockReset();
  });

  it('derives area, mean lat/lng, elevation, and BEC variant', async () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValue({ minM: 110.4, maxM: 299.6 });
    vi.mocked(fetchBecVariantAt).mockResolvedValue({
      mapLabel: 'CWHxm1',
      zone: 'CWH',
      subzone: 'xm',
      variant: '1'
    });

    const result = await deriveCollectionAreaResult(squareFeature(), ['CWH'], 1);

    expect(result.polygonCount).toBe(1);
    expect(result.becZones).toEqual(['CWH']);
    expect(result.areaHectares).toBeGreaterThan(0);
    // 0.1 deg lng at 48N is ~7.4 km, 0.1 deg lat ~11.1 km, so the diagonal is
    // ~13.4 km and half of that ~6.7 km.
    expect(result.radiusKm).toBeCloseTo(6.7, 1);
    expect(result.meanLat).not.toBeNull();
    expect(result.meanLng).not.toBeNull();
    expect(result.meanLat!).toBeGreaterThan(48);
    expect(result.meanLat!).toBeLessThan(49);
    expect(result.meanLng!).toBeLessThan(-123);
    expect(result.meanLng!).toBeGreaterThan(-124);
    expect(result.elevationMinM).toBe(110);
    expect(result.elevationMaxM).toBe(300);
    expect(result.elevationLookupFailed).toBe(false);
    expect(result.becVariant?.zone).toBe('CWH');
    expect(JSON.parse(result.geoJson).geometry.type).toBe('MultiPolygon');
  });

  it('fails soft when elevation and BEC lookups reject', async () => {
    vi.mocked(fetchPolygonElevationRange).mockRejectedValue(new Error('timeout'));
    vi.mocked(fetchBecVariantAt).mockRejectedValue(new Error('cors'));

    const result = await deriveCollectionAreaResult(squareFeature(), ['CWH'], 2);

    expect(result.polygonCount).toBe(2);
    expect(result.elevationMinM).toBeNull();
    expect(result.elevationMaxM).toBeNull();
    expect(result.elevationLookupFailed).toBe(true);
    expect(result.becVariant).toBeNull();
    expect(result.meanLat).not.toBeNull();
  });

  it('reports no error when elevation answered with no data', async () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValue(null);
    vi.mocked(fetchBecVariantAt).mockResolvedValue(null);

    const result = await deriveCollectionAreaResult(squareFeature(), ['CWH'], 1);

    expect(result.elevationMinM).toBeNull();
    expect(result.elevationLookupFailed).toBe(false);
  });
});

describe('serializeCollectionArea', () => {
  it('rounds coordinates to 6 decimals', () => {
    const feature = squareFeature();
    feature.geometry.coordinates[0][0][0] = [-123.12345678901234, 48.98765432109876];

    const parsed = JSON.parse(serializeCollectionArea(feature));

    expect(parsed.geometry.coordinates[0][0][0]).toEqual([-123.123457, 48.987654]);
  });

  it('keeps a full-precision polygon at the vertex cap under the backend size cap', () => {
    const ring = Array.from({ length: MAX_COLLECTION_VERTICES - 1 }, (_, i) => {
      const angle = (2 * Math.PI * i) / (MAX_COLLECTION_VERTICES - 1);
      return [
        -123.123456789012345 + (0.05 * Math.cos(angle)),
        48.123456789012345 + (0.05 * Math.sin(angle))
      ];
    });
    ring.push(ring[0]);
    const feature: Feature<MultiPolygon> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [[ring]] }
    };

    expect(JSON.stringify(feature).length).toBeGreaterThan(BACKEND_MAX_GEOJSON_CHARS);
    expect(serializeCollectionArea(feature).length).toBeLessThan(BACKEND_MAX_GEOJSON_CHARS);
  });
});
