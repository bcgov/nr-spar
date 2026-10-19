import type { BecCatalogueItem } from '../../api-service/becCatalogueAPI';
import type { CollectionAreaResult } from '../../types/SparMapTypes';
import {
  applyCollectionAreaResult,
  decimalToDms
} from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/mapIntegration';
import { initBClassCollectionState } from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';

const catalogue: BecCatalogueItem[] = [
  {
    becZoneCode: 'CWH',
    becZoneName: 'Coastal Western Hemlock',
    becSubzoneCode: 'xm',
    becSubzoneName: 'Very Dry Maritime',
    variant: '1',
    variantName: 'Variant 1'
  },
  {
    becZoneCode: 'IDF',
    becZoneName: 'Interior Douglas-fir',
    becSubzoneCode: 'dk',
    becSubzoneName: 'Dry Cool',
    variant: null,
    variantName: null
  }
];

const baseResult = (overrides: Partial<CollectionAreaResult> = {}): CollectionAreaResult => ({
  geoJson: '{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[]},"properties":{}}',
  polygonCount: 1,
  areaHectares: 12.56,
  meanLat: 48.5,
  meanLng: -123.25,
  elevationMinM: 100,
  elevationMaxM: 300,
  becZones: ['CWH'],
  becVariant: {
    mapLabel: 'CWHxm1',
    zone: 'CWH',
    subzone: 'xm',
    variant: '1'
  },
  ...overrides
});

describe('mapIntegration', () => {
  describe('decimalToDms', () => {
    it('converts a simple decimal latitude', () => {
      expect(decimalToDms(48.5)).toEqual({ deg: '48', min: '30', sec: '0' });
    });

    it('uses absolute value (hemisphere is separate on the form)', () => {
      expect(decimalToDms(-123.25)).toEqual({ deg: '123', min: '15', sec: '0' });
    });

    it('rolls seconds of 60 into the next minute', () => {
      // 48 + 0 + 59.6/3600 ≈ enough to round sec to 60
      const result = decimalToDms(48 + (0 + 59.6 / 60) / 60);
      expect(Number(result.sec)).toBeLessThan(60);
    });
  });

  describe('applyCollectionAreaResult', () => {
    it('preserves unrelated form fields', () => {
      const state = initBClassCollectionState('00012797', '01');
      state.comments.value = 'leave me alone';
      state.startDate.value = '2024-01-01';

      const next = applyCollectionAreaResult(state, baseResult(), catalogue);

      expect(next.comments.value).toBe('leave me alone');
      expect(next.startDate.value).toBe('2024-01-01');
      expect(next.collectorAgency.value).toBe('00012797');
    });

    it('writes geometry, DMS, elevation, radius, and BEC labels', () => {
      const state = initBClassCollectionState('00012797', '01');
      const next = applyCollectionAreaResult(state, baseResult(), catalogue);

      expect(next.collectionGeometry.value).toContain('MultiPolygon');
      expect(next.latDeg.value).toBe('48');
      expect(next.latMin.value).toBe('30');
      expect(next.longDeg.value).toBe('123');
      expect(next.longMin.value).toBe('15');
      expect(next.elevationMin.value).toBe('100');
      expect(next.elevationMax.value).toBe('300');
      expect(next.elevationMean.value).toBe('200');
      expect(next.collectionRadius.value).toBeTruthy();
      expect(next.becZone.value.code).toBe('CWH');
      expect(next.becZone.value.description).toBe('Coastal Western Hemlock');
      expect(next.becSubzone.value.code).toBe('xm');
      expect(next.becVariant.value.code).toBe('1');
      expect(next.useLatLongForBec.value).toBe(false);
    });

    it('falls back to zone-only when becVariant is missing', () => {
      const state = initBClassCollectionState('00012797', '01');
      const next = applyCollectionAreaResult(
        state,
        baseResult({
          becVariant: null,
          becZones: ['IDF']
        }),
        catalogue
      );

      expect(next.becZone.value.code).toBe('IDF');
      expect(next.becZone.value.description).toBe('Interior Douglas-fir');
    });

    it('still fills codes when the catalogue is undefined', () => {
      const state = initBClassCollectionState('00012797', '01');
      const next = applyCollectionAreaResult(state, baseResult(), undefined);

      expect(next.becZone.value.code).toBe('CWH');
      expect(next.becZone.value.label).toBe('CWH');
      expect(next.becSubzone.value.code).toBe('xm');
    });
  });
});
