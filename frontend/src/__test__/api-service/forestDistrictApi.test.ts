import {
  buildForestDistrictUrl, districtNameFromFeatureCollection
} from '../../api-service/forestDistrictApi';

describe('forestDistrictApi', () => {
  it('buildForestDistrictUrl targets the district layer with a BC-Albers POINT INTERSECTS', () => {
    const url = buildForestDistrictUrl([-123.45, 48.55]);
    expect(url).toContain('WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG');
    expect(url).toContain('propertyName=DISTRICT_NAME');
    expect(decodeURIComponent(url)).toContain('INTERSECTS(SHAPE,POINT(');
  });

  it('districtNameFromFeatureCollection returns the first DISTRICT_NAME', () => {
    expect(districtNameFromFeatureCollection({
      features: [{ properties: { DISTRICT_NAME: 'Sea to Sky Natural Resource District' } }]
    })).toBe('Sea to Sky Natural Resource District');
  });

  it('districtNameFromFeatureCollection returns null when empty', () => {
    expect(districtNameFromFeatureCollection({ features: [] })).toBeNull();
    expect(districtNameFromFeatureCollection({})).toBeNull();
  });
});
