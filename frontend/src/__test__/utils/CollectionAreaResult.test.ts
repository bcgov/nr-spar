import type { Feature, MultiPolygon } from 'geojson';

import { deriveCollectionAreaResult } from '../../views/Seedlot/SeedlotMap/collectionAreaResult';

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
    expect(result.meanLat).not.toBeNull();
    expect(result.meanLng).not.toBeNull();
    expect(result.meanLat!).toBeGreaterThan(48);
    expect(result.meanLat!).toBeLessThan(49);
    expect(result.meanLng!).toBeLessThan(-123);
    expect(result.meanLng!).toBeGreaterThan(-124);
    expect(result.elevationMinM).toBe(110);
    expect(result.elevationMaxM).toBe(300);
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
    expect(result.becVariant).toBeNull();
    expect(result.meanLat).not.toBeNull();
  });
});
