import type { Feature, Polygon } from 'geojson';

vi.mock('../../api-service/openmapsProxy', () => ({
  buildOpenmapsProxyUrl: (params: URLSearchParams) => `/api/openmaps?${params.toString()}`,
  getOpenmapsJson: vi.fn(),
  isOpenmapsAbort: () => false
}));

const { getOpenmapsJson } = await import('../../api-service/openmapsProxy');
const {
  CONTOUR_LINES_LAYER,
  SPOT_ELEVATION_LAYER,
  fetchPolygonElevationRange
} = await import('../../api-service/elevationApi');

const polygonWithVertices = (vertexCount: number): Feature<Polygon> => {
  const ring: Array<[number, number]> = [];
  for (let i = 0; i < vertexCount - 1; i += 1) {
    ring.push([-123.02 + i * 0.00001, 49 + (i % 2) * 0.00001]);
  }
  ring.push(ring[0]);
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] }
  };
};

const smallPolygon = () => polygonWithVertices(5);

const elevationFeatures = (values: number[]) => ({
  features: values.map((ELEVATION) => ({ properties: { ELEVATION } }))
});

/** Which layer a given call targeted, read back off the WFS params. */
const layerOf = (params: URLSearchParams) => params.get('typeNames');

describe('fetchPolygonElevationRange', () => {
  beforeEach(() => {
    vi.mocked(getOpenmapsJson).mockReset();
  });

  it('queries a dense polygon instead of refusing it on size', async () => {
    // Formerly capped at ~160 vertices by the CQL URL budget; the proxy now
    // POSTs the filter, so a detailed polygon is queried like any other.
    vi.mocked(getOpenmapsJson).mockResolvedValue(elevationFeatures([300, 900]));

    const range = await fetchPolygonElevationRange(polygonWithVertices(1500));

    expect(range?.source).toBe('contours');
    expect(getOpenmapsJson).toHaveBeenCalled();
  });

  it('returns the contour range when contours intersect', async () => {
    vi.mocked(getOpenmapsJson).mockResolvedValue(elevationFeatures([120, 340]));

    const range = await fetchPolygonElevationRange(smallPolygon());

    expect(range).toEqual({
      minM: 120, maxM: 340, source: 'contours', sampleCount: 2
    });
  });

  it('falls back to spot points when contours return no features', async () => {
    vi.mocked(getOpenmapsJson).mockImplementation(async (params) => (
      layerOf(params) === CONTOUR_LINES_LAYER
        ? elevationFeatures([])
        : elevationFeatures([210])
    ) as never);

    const range = await fetchPolygonElevationRange(smallPolygon());

    expect(range?.source).toBe('spot-points');
    expect(range?.minM).toBe(210);
  });

  it('still falls back to spot points when the contour query fails', async () => {
    vi.mocked(getOpenmapsJson).mockImplementation(async (params) => {
      if (layerOf(params) === CONTOUR_LINES_LAYER) {
        throw new Error('contour layer 502');
      }
      return elevationFeatures([90, 150]) as never;
    });

    const range = await fetchPolygonElevationRange(smallPolygon());

    expect(range?.source).toBe('spot-points');
    expect(range?.maxM).toBe(150);
  });

  it('throws when both layers fail rather than reporting an empty band', async () => {
    vi.mocked(getOpenmapsJson).mockRejectedValue(new Error('contour layer 502'));

    await expect(fetchPolygonElevationRange(smallPolygon()))
      .rejects.toThrow(/contour layer 502/);
  });

  it('throws when contours fail and spot points are empty', async () => {
    vi.mocked(getOpenmapsJson).mockImplementation(async (params) => {
      if (layerOf(params) === CONTOUR_LINES_LAYER) {
        throw new Error('contour layer 502');
      }
      return elevationFeatures([]) as never;
    });

    await expect(fetchPolygonElevationRange(smallPolygon()))
      .rejects.toThrow(/contour layer 502/);
  });

  it('returns null when both layers answer with no features', async () => {
    vi.mocked(getOpenmapsJson).mockResolvedValue(elevationFeatures([]));

    await expect(fetchPolygonElevationRange(smallPolygon())).resolves.toBeNull();
    expect(vi.mocked(getOpenmapsJson).mock.calls.map(([params]) => layerOf(params)))
      .toEqual([CONTOUR_LINES_LAYER, SPOT_ELEVATION_LAYER]);
  });
});
