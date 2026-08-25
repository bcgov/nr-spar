/* eslint-disable no-undef */
import { buildBClassReviewPayload, formatDms } from '../../views/Seedlot/SeedlotReviewClassB/utils';
import { initEmptySteps } from '../../views/Seedlot/ContextContainerClassB/utils';
import { RichSeedlotType } from '../../types/SeedlotType';

describe('SeedlotReviewClassB utils test', () => {
  it('should format DMS values', () => {
    expect(formatDms('48', '30', '15')).toBe('48° 30\' 15"');
  });

  it('should return empty string when all DMS values are empty', () => {
    expect(formatDms('', '', '')).toBe('');
  });

  describe('buildBClassReviewPayload', () => {
    const richSeedlot = {
      seedlot: {
        areaOfUseComment: 'A comment',
        elevationMin: 100,
        elevationMax: 900,
        latitudeDegMin: 48,
        latitudeMinMin: 30,
        latitudeSecMin: 0,
        latitudeDegMax: 50,
        latitudeMinMax: 15,
        latitudeSecMax: 10,
        longitudeDegMin: 120,
        longitudeMinMin: 0,
        longitudeSecMin: 0,
        longitudeDegMax: 125,
        longitudeMinMax: 30,
        longitudeSecMax: 5
      },
      bClassDetail: {
        aouSpzList: [{ code: 'BV', description: 'Bulkley Valley', isPrimary: true }],
        collectionGeometry: null,
        provenanceId: null
      },
      calculatedValues: [
        {
          traitCode: 'GVO', traitValue: 10, calculatedValue: 12, testedParentTreePerc: 0.8
        }
      ]
    } as unknown as RichSeedlotType;

    it('should preserve area of use values from the seedlot', () => {
      const payload = buildBClassReviewPayload(initEmptySteps(), richSeedlot);

      expect(payload.aouSpzList).toEqual(richSeedlot.bClassDetail?.aouSpzList);

      const collectionDto = payload.seedlotFormCollectionDto;
      expect(collectionDto.areaOfUseComment).toBe('A comment');
      expect(collectionDto.elevationMin).toBe(100);
      expect(collectionDto.elevationMax).toBe(900);
      expect(collectionDto.latitudeDegMin).toBe(48);
      expect(collectionDto.latitudeMinMin).toBe(30);
      expect(collectionDto.latitudeDegMax).toBe(50);
      expect(collectionDto.longitudeDegMin).toBe(120);
      expect(collectionDto.longitudeDegMax).toBe(125);
      expect(collectionDto.longitudeSecMax).toBe(5);
    });

    it('should preserve null area of use values instead of falling back to collection', () => {
      const seedlotWithNullAou = {
        ...richSeedlot,
        seedlot: {
          ...richSeedlot.seedlot,
          elevationMin: null,
          elevationMax: null,
          latitudeDegMin: null,
          latitudeMinMin: null,
          latitudeSecMin: null,
          latitudeDegMax: null,
          latitudeMinMax: null,
          latitudeSecMax: null,
          longitudeDegMin: null,
          longitudeMinMin: null,
          longitudeSecMin: null,
          longitudeDegMax: null,
          longitudeMinMax: null,
          longitudeSecMax: null
        }
      } as unknown as RichSeedlotType;

      const collectionDto = buildBClassReviewPayload(
        initEmptySteps(),
        seedlotWithNullAou
      ).seedlotFormCollectionDto;

      expect(collectionDto.elevationMin).toBeNull();
      expect(collectionDto.elevationMax).toBeNull();
      expect(collectionDto.latitudeDegMin).toBeNull();
      expect(collectionDto.longitudeDegMax).toBeNull();
    });

    it('should preserve superior provenance fields from the seedlot', () => {
      const superiorSeedlot = {
        ...richSeedlot,
        seedlot: {
          ...richSeedlot.seedlot,
          superiorProvenanceInd: true,
          provenanceId: 42
        }
      } as unknown as RichSeedlotType;

      const collectionDto = buildBClassReviewPayload(
        initEmptySteps(),
        superiorSeedlot
      ).seedlotFormCollectionDto;

      expect(collectionDto.superiorProvenanceInd).toBe(true);
      expect(collectionDto.provenanceId).toBe(42);
    });

    it('should preserve null superior provenance indicator', () => {
      const seedlotWithNullProvenance = {
        ...richSeedlot,
        seedlot: {
          ...richSeedlot.seedlot,
          superiorProvenanceInd: null,
          provenanceId: null
        }
      } as unknown as RichSeedlotType;

      const collectionDto = buildBClassReviewPayload(
        initEmptySteps(),
        seedlotWithNullProvenance
      ).seedlotFormCollectionDto;

      expect(collectionDto.superiorProvenanceInd).toBeNull();
    });

    it('should preserve bec version and map sameBecUnit to override fields', () => {
      const steps = initEmptySteps();
      steps.collectionStep.sameBecUnit.value = false;

      const seedlotWithBec = {
        ...richSeedlot,
        seedlot: {
          ...richSeedlot.seedlot,
          becVersionId: 7,
          becOverrideComment: 'Mapped from adjacent unit'
        }
      } as unknown as RichSeedlotType;

      const collectionDto = buildBClassReviewPayload(
        steps,
        seedlotWithBec
      ).seedlotFormCollectionDto;

      expect(collectionDto.becVersionId).toBe(7);
      expect(collectionDto.becOverrideInd).toBe(true);
      expect(collectionDto.becOverrideComment).toBe('Mapped from adjacent unit');
    });

    it('should preserve genetic worth values from the seedlot', () => {
      const payload = buildBClassReviewPayload(initEmptySteps(), richSeedlot);

      expect(payload.geneticWorthTraits).toEqual([
        {
          traitCode: 'GVO', traitValue: 10, calculatedValue: 12, testedParentTreePerc: 0.8
        }
      ]);
    });

    it('should default to empty lists without rich seedlot data', () => {
      const payload = buildBClassReviewPayload(initEmptySteps());

      expect(payload.aouSpzList).toEqual([]);
      expect(payload.geneticWorthTraits).toEqual([]);
    });
  });
});
