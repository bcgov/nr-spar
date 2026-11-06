vi.mock('../../api-service/api', () => ({
  default: { get: vi.fn() }
}));

const { default: api } = await import('../../api-service/api');
const { getSpzByVegCodeList } = await import('../../api-service/areaOfUseAPI');
const { default: getSeedCoastAreas } = await import('../../api-service/seedCoastAreaAPI');

describe('seed planning zone list APIs', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('asks oracle-api for the genetic class, defaulting to A', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [{ code: 'GL', description: 'Georgia Lowlands' }] });

    await expect(getSpzByVegCodeList('FDC')).resolves.toEqual([
      { code: 'GL', description: 'Georgia Lowlands' }
    ]);
    expect(vi.mocked(api.get).mock.calls[0][0]).toContain('/FDC?geneticClass=A');

    await getSpzByVegCodeList('FDC', 'B');
    expect(vi.mocked(api.get).mock.calls[1][0]).toContain('/FDC?geneticClass=B');
  });

  it('loads geographic areas', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [{ code: '001', description: 'Georgia Strait' }] });

    await expect(getSeedCoastAreas()).resolves.toEqual([
      { code: '001', description: 'Georgia Strait' }
    ]);
    expect(vi.mocked(api.get).mock.calls[0][0]).toContain('/api/seed-coast-areas');
  });
});
