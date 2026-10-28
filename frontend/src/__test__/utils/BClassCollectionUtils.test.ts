import { BecCatalogueItem } from '../../api-service/becCatalogueAPI';
import { BClassCollectionFormSubmitType } from '../../types/SeedlotType';
import {
  becVariantPlaceholder,
  getBecSubzoneItems,
  getBecVariantItems,
  getBecZoneItems,
  initBClassCollectionState,
  initBClassCollectionStateFromDto,
  isBecVariantRequired,
  validateBClassCollectionStep,
  verifyBClassCollectionStepCompleteness
} from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';

const catalogue: BecCatalogueItem[] = [
  {
    becZoneCode: 'CWH', becZoneName: 'Coastal Western Hemlock', becSubzoneCode: 'dm', becSubzoneName: 'Dry Maritime', variant: null, variantName: null
  },
  {
    becZoneCode: 'CWH', becZoneName: 'Coastal Western Hemlock', becSubzoneCode: 'vm', becSubzoneName: 'Very Wet Maritime', variant: '1', variantName: 'Submontane'
  },
  {
    becZoneCode: 'CWH', becZoneName: 'Coastal Western Hemlock', becSubzoneCode: 'vm', becSubzoneName: 'Very Wet Maritime', variant: '2', variantName: 'Montane'
  },
  {
    becZoneCode: 'IDF', becZoneName: 'Interior Douglas-fir', becSubzoneCode: 'xh', becSubzoneName: 'Very Dry Hot', variant: null, variantName: null
  }
];

const dto = {
  collectionClientNumber: '00012797',
  collectionLocnCode: '00',
  collectionStartDate: '2024-01-01T00:00:00Z',
  collectionEndDate: '2024-01-05T00:00:00Z',
  noOfContainers: 2,
  volPerContainer: 3,
  clctnVolume: 6,
  seedlotComment: 'note',
  coneCollectionMethodCodes: [1],
  collectionLocationDesc: 'Near the lake',
  orgUnitNo: 1910,
  collectionAreaRadius: 2.5,
  captureMethodCode: 'GPS',
  numberTreesFromCode: 'T10',
  collectionLatitudeDeg: 49,
  collectionLatitudeMin: 10,
  collectionLatitudeSec: 5,
  collectionLongitudeDeg: 123,
  collectionLongitudeMin: 20,
  collectionLongitudeSec: 15,
  collectionElevation: 200,
  collectionElevationMin: 100,
  collectionElevationMax: 300,
  bgcZoneCode: 'CWH',
  bgcZoneDescription: 'Coastal Western Hemlock',
  bgcSubzoneCode: 'vm',
  variant: '1',
  collectionGeometryGeoJson: '{"type":"Polygon","coordinates":[]}'
} as unknown as BClassCollectionFormSubmitType;

describe('BClassCollectionStep utils', () => {
  describe('BEC catalogue helpers', () => {
    it('lists each zone once', () => {
      expect(getBecZoneItems(catalogue).map((item) => item.label)).toEqual([
        'CWH - Coastal Western Hemlock',
        'IDF - Interior Douglas-fir'
      ]);
      expect(getBecZoneItems(undefined)).toEqual([]);
    });

    it('lists each subzone of the chosen zone once', () => {
      expect(getBecSubzoneItems(catalogue, 'CWH').map((item) => item.code)).toEqual(['dm', 'vm']);
      expect(getBecSubzoneItems(catalogue, '')).toEqual([]);
      expect(getBecSubzoneItems(undefined, 'CWH')).toEqual([]);
    });

    it('lists only real variants of the chosen subzone', () => {
      expect(getBecVariantItems(catalogue, 'CWH', 'vm').map((item) => item.label)).toEqual([
        '1 - Submontane',
        '2 - Montane'
      ]);
      expect(getBecVariantItems(catalogue, 'CWH', 'dm')).toEqual([]);
      expect(getBecVariantItems(catalogue, 'CWH', '')).toEqual([]);
    });

    it('requires a variant only when the subzone has one', () => {
      expect(isBecVariantRequired(catalogue, 'CWH', 'vm')).toBe(true);
      expect(isBecVariantRequired(catalogue, 'CWH', 'dm')).toBe(false);
    });

    it.each([
      ['', 0, 'Choose subzone first'],
      ['vm', 2, 'Choose variant'],
      ['dm', 0, 'None']
    ])('uses the right variant placeholder for subzone "%s"', (subzone, count, expected) => {
      expect(becVariantPlaceholder(subzone, count)).toBe(expected);
    });
  });

  describe('initBClassCollectionStateFromDto', () => {
    it('maps the saved collection onto the form', () => {
      const form = initBClassCollectionStateFromDto('00012797', dto);

      expect(form.orgUnit.value.code).toBe('1910');
      expect(form.locationArea.value).toBe('Near the lake');
      expect(form.collectionRadius.value).toBe('2.5');
      expect(form.elevationMin.value).toBe('100');
      expect(form.elevationMax.value).toBe('300');
      expect(form.elevationMean.value).toBe('200');
      expect(form.captureMethod.value.code).toBe('GPS');
      expect(form.numberTreesFrom.value.code).toBe('T10');
      expect(form.latDeg.value).toBe('49');
      expect(form.longSec.value).toBe('15');
      expect(form.becZone.value.label).toBe('CWH - Coastal Western Hemlock');
      expect(form.becSubzone.value.code).toBe('vm');
      expect(form.becVariant.value.code).toBe('1');
      expect(form.collectionGeometry.value).toBe('{"type":"Polygon","coordinates":[]}');
    });

    it('leaves missing optional values empty', () => {
      const form = initBClassCollectionStateFromDto('00012797', {
        ...dto,
        orgUnitNo: null,
        collectionAreaRadius: null,
        collectionElevation: null,
        captureMethodCode: '',
        variant: null,
        collectionGeometryGeoJson: null,
        collectionLocationDesc: null,
        seedlotComment: null,
        coneCollectionMethodCodes: null
      } as unknown as BClassCollectionFormSubmitType);

      expect(form.orgUnit.value.code).toBe('');
      expect(form.collectionRadius.value).toBe('');
      expect(form.elevationMean.value).toBe('');
      expect(form.captureMethod.value.code).toBe('');
      expect(form.becVariant.value.code).toBe('');
      expect(form.collectionGeometry.value).toBe('');
      expect(form.locationArea.value).toBe('');
    });
  });

  describe('validation and completeness', () => {
    it('treats a complete form as complete', () => {
      const form = initBClassCollectionStateFromDto('00012797', dto);
      expect(verifyBClassCollectionStepCompleteness(form, catalogue)).toBe(true);
    });

    it('needs a variant when the subzone has variants', () => {
      const form = initBClassCollectionStateFromDto('00012797', { ...dto, variant: null } as unknown as BClassCollectionFormSubmitType);
      expect(verifyBClassCollectionStepCompleteness(form, catalogue)).toBe(false);
    });

    it('treats a blank form as incomplete', () => {
      expect(verifyBClassCollectionStepCompleteness(initBClassCollectionState('', ''), catalogue))
        .toBe(false);
    });

    it('reports invalid fields', () => {
      const form = initBClassCollectionStateFromDto('00012797', dto);
      expect(validateBClassCollectionStep(form, catalogue)).toBe(false);

      form.latDeg.isInvalid = true;
      expect(validateBClassCollectionStep(form, catalogue)).toBe(true);
    });

    it('ignores an invalid variant when the subzone has none', () => {
      const form = initBClassCollectionStateFromDto('00012797', { ...dto, bgcSubzoneCode: 'dm' } as unknown as BClassCollectionFormSubmitType);
      form.becVariant.isInvalid = true;
      expect(validateBClassCollectionStep(form, catalogue)).toBe(false);
    });
  });
});
