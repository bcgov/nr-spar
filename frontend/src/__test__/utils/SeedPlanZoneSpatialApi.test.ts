import {
  buildClassBSpzCql,
  fetchClassBSpzAt,
  fetchClassBSpzCodesIntersecting
} from '../../api-service/seedPlanZoneSpatialApi';

vi.mock('../../api-service/openmapsClient', () => ({
  getOpenmapsJson: vi.fn()
}));

const { getOpenmapsJson } = await import('../../api-service/openmapsClient');

describe('seedPlanZoneSpatialApi', () => {
  beforeEach(() => {
    vi.mocked(getOpenmapsJson).mockReset();
  });

  it('includes zones for the species and zones for all species', () => {
    expect(buildClassBSpzCql('POINT(1 2)', 'FDC')).toBe(
      "INTERSECTS(GEOMETRY,POINT(1 2)) AND GENETIC_CLASS_CODE='B'"
      + " AND (VEGETATION_CODE='FDC' OR VEGETATION_CODE IS NULL)"
    );
  });

  it('returns the zone under the point', async () => {
    vi.mocked(getOpenmapsJson).mockResolvedValue({
      features: [{ properties: { SEED_PLAN_ZONE_CODE: 'M' } }]
    });

    await expect(fetchClassBSpzAt([-123.7, 48.78], 'FDC')).resolves.toBe('M');

    const params = vi.mocked(getOpenmapsJson).mock.calls[0][0] as URLSearchParams;
    expect(params.get('count')).toBe('1');
    expect(params.get('CQL_FILTER')).toContain("VEGETATION_CODE='FDC'");
  });

  it('returns each zone the area touches once', async () => {
    vi.mocked(getOpenmapsJson).mockResolvedValue({
      features: [
        { properties: { SEED_PLAN_ZONE_CODE: 'M' } },
        { properties: { SEED_PLAN_ZONE_CODE: 'SM' } },
        { properties: { SEED_PLAN_ZONE_CODE: 'M' } }
      ]
    });

    const codes = await fetchClassBSpzCodesIntersecting({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[-123.1, 48.1], [-123.0, 48.1], [-123.0, 48.2], [-123.1, 48.1]]]]
      }
    }, 'FDC');

    expect(codes).toEqual(['M', 'SM']);
  });

  it('fails soft when the lookup errors', async () => {
    vi.mocked(getOpenmapsJson).mockRejectedValue(new Error('timeout'));

    await expect(fetchClassBSpzAt([-123.7, 48.78], 'FDC')).resolves.toBeNull();
  });

  it('does not query with an unsafe species code', async () => {
    await expect(fetchClassBSpzAt([-123.7, 48.78], "FDC' OR 1=1")).resolves.toBeNull();
    await expect(fetchClassBSpzCodesIntersecting({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[-123.1, 48.1], [-123.0, 48.1], [-123.0, 48.2], [-123.1, 48.1]]]]
      }
    }, "FDC' OR 1=1")).resolves.toEqual([]);

    expect(getOpenmapsJson).not.toHaveBeenCalled();
  });

  it('returns null when the point lookup finds no zone', async () => {
    vi.mocked(getOpenmapsJson).mockResolvedValue({
      features: [{ properties: { SEED_PLAN_ZONE_CODE: 12 } }, { properties: {} }]
    });

    await expect(fetchClassBSpzAt([-123.7, 48.78], 'FDC')).resolves.toBeNull();
  });

  it('returns no zones when the area lookup fails', async () => {
    vi.mocked(getOpenmapsJson).mockRejectedValue(new Error('timeout'));

    await expect(fetchClassBSpzCodesIntersecting({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[-123.1, 48.1], [-123.0, 48.1], [-123.0, 48.2], [-123.1, 48.1]]]]
      }
    }, 'FDC')).resolves.toEqual([]);
  });
});
