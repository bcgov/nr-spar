import { BecCatalogueItem } from '../../api-service/becCatalogueAPI';
import {
  BClassCollectionFormSubmitType, RichSeedlotType, SeedlotType
} from '../../types/SeedlotType';
import {
  becVariantPlaceholder,
  getBecSubzoneItems,
  getBecVariantItems,
  getBecZoneItems,
  initBClassCollectionState,
  initBClassCollectionStateFromDto,
  isBecVariantRequired,
  isCoastAreaRequired,
  validateBClassCollectionStep,
  verifyBClassCollectionStepCompleteness
} from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';
import { initialProgressConfig } from '../../views/Seedlot/ContextContainerClassB/constants';
import {
  checkAllStepsCompletion,
  convertBClassCollection,
  hydrateFromDraftPayload,
  mergeDraftCollectionStep,
  updateStepStatus,
  withSeedlotSpzFallback
} from '../../views/Seedlot/ContextContainerClassB/utils';
import { BClassAllStepData } from '../../views/Seedlot/ContextContainerClassB/definitions';

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

  describe('collection seed planning zone', () => {
    const withSpz = (seedPlanZoneCode: string | null, seedCoastAreaCode: string | null) => (
      initBClassCollectionStateFromDto('00012797', {
        ...dto, seedPlanZoneCode, seedCoastAreaCode
      } as unknown as BClassCollectionFormSubmitType)
    );

    it('prefills the zone and geographic area from the saved collection', () => {
      const form = withSpz('M', '001');
      expect(form.seedPlanZone.value.code).toBe('M');
      expect(form.seedCoastArea.value.code).toBe('001');
    });

    it('drops a stale geographic area when the zone is not M', () => {
      expect(withSpz('SM', '001').seedCoastArea.value.code).toBe('');
    });

    it('requires a zone only for BC-source lots', () => {
      const form = withSpz(null, null);
      expect(verifyBClassCollectionStepCompleteness(form, catalogue, true)).toBe(false);
      expect(verifyBClassCollectionStepCompleteness(form, catalogue, false)).toBe(true);
    });

    it('requires a geographic area when the zone is M', () => {
      expect(verifyBClassCollectionStepCompleteness(withSpz('M', null), catalogue, true)).toBe(false);
      expect(verifyBClassCollectionStepCompleteness(withSpz('M', '001'), catalogue, true)).toBe(true);
      expect(verifyBClassCollectionStepCompleteness(withSpz('SM', null), catalogue, true)).toBe(true);
    });

    it('only treats M as needing a geographic area', () => {
      expect(isCoastAreaRequired('M')).toBe(true);
      expect(isCoastAreaRequired('SM')).toBe(false);
      expect(isCoastAreaRequired('')).toBe(false);
    });

    it('submits the chosen zone and geographic area, not a fallback', () => {
      const richSeedlot = {
        seedlot: { seedPlanZoneCode: 'GL', seedCoastAreaCode: null },
        primarySpz: { code: 'GL', description: 'Georgia Lowlands', isPrimary: true },
        primarySpu: { seedPlanZoneCode: 'GL' }
      } as unknown as RichSeedlotType;

      const maritime = convertBClassCollection(withSpz('M', '001'), richSeedlot);
      expect(maritime.seedPlanZoneCode).toBe('M');
      expect(maritime.seedCoastAreaCode).toBe('001');

      const empty = convertBClassCollection(withSpz(null, null), richSeedlot);
      expect(empty.seedPlanZoneCode).toBeNull();
      expect(empty.seedCoastAreaCode).toBeNull();
    });

    it('fills an empty draft zone from the seedlot', () => {
      const seedlot = { seedPlanZoneCode: 'M', seedCoastAreaCode: '002' } as unknown as SeedlotType;
      const form = withSeedlotSpzFallback(initBClassCollectionState('', ''), seedlot);
      expect(form.seedPlanZone.value.code).toBe('M');
      expect(form.seedCoastArea.value.code).toBe('002');
    });

    it('keeps a zone the user already chose over the seedlot value', () => {
      const seedlot = { seedPlanZoneCode: 'M', seedCoastAreaCode: '002' } as unknown as SeedlotType;
      const form = withSeedlotSpzFallback(withSpz('SM', null), seedlot);
      expect(form.seedPlanZone.value.code).toBe('SM');
      expect(form.seedCoastArea.value.code).toBe('');
    });

    it('ignores a stale zone on non-BC lots', () => {
      expect(verifyBClassCollectionStepCompleteness(withSpz('M', null), catalogue, false)).toBe(true);
    });

    it('does not submit a zone or geographic area for non-BC lots', () => {
      const richSeedlot = { seedlot: { sourceInBc: false } } as unknown as RichSeedlotType;
      const payload = convertBClassCollection(withSpz('M', '001'), richSeedlot);
      expect(payload.seedPlanZoneCode).toBeNull();
      expect(payload.seedCoastAreaCode).toBeNull();
    });

    it('does not fill the zone from the seedlot for non-BC lots', () => {
      const seedlot = { sourceInBc: false, seedPlanZoneCode: 'M', seedCoastAreaCode: '002' } as unknown as SeedlotType;
      const form = withSeedlotSpzFallback(initBClassCollectionState('', ''), seedlot);
      expect(form.seedPlanZone.value.code).toBe('');
    });

    it('keeps the collection step incomplete until a BC lot has a zone', () => {
      const steps = { collectionStep: withSpz(null, null) } as BClassAllStepData;
      const incomplete = updateStepStatus(
        'collection',
        initialProgressConfig.collection,
        steps,
        catalogue,
        true
      );
      expect(incomplete.isComplete).toBe(false);
      expect(checkAllStepsCompletion(initialProgressConfig, steps, true, catalogue, true)).toBe(false);

      const complete = updateStepStatus(
        'collection',
        initialProgressConfig.collection,
        steps,
        catalogue,
        false
      );
      expect(complete.isComplete).toBe(true);
    });

    it('fills an empty draft from the seedlot when the draft is loaded', () => {
      const seedlot = { sourceInBc: true, seedPlanZoneCode: 'SM', seedCoastAreaCode: null } as unknown as SeedlotType;
      const merged = mergeDraftCollectionStep(undefined, '00012797', '00', seedlot);
      expect(merged.seedPlanZone.value.code).toBe('SM');

      const hydrated = hydrateFromDraftPayload(
        { allStepData: {}, revisionCount: 3 },
        '00012797',
        '00',
        seedlot
      );
      expect(hydrated.revisionCount).toBe(3);
      expect(hydrated.allStepData.collectionStep.seedPlanZone.value.code).toBe('SM');
    });
  });
});
