import { BecCatalogueItem } from '@/api-service/becCatalogueAPI';
import { EmptyMultiOptObj } from '@/shared-constants/shared-constants';
import { BClassCollectionFormSubmitType } from '@/types/SeedlotType';
import { getBooleanInputObj, getOptionsInputObj, getStringInputObj } from '@/utils/FormInputUtils';
import { initCollectionState } from '@/views/Seedlot/ContextContainerClassA/utils';
import { emptyCollectionStep } from '@/views/Seedlot/ContextContainerClassA/constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { BClassCollectionForm } from './definitions';
import { calcVolume, isNumNotInRange } from '../CollectionStep/utils';

const toOption = (code: string | null | undefined, description = ''): MultiOptionsObj => {
  if (!code) {
    return EmptyMultiOptObj;
  }
  return {
    code,
    description,
    label: description ? `${code} - ${description}` : code
  };
};

const nullableToString = (value: number | null | undefined): string => (
  value != null ? String(value) : ''
);

export const getBecVariantItems = (
  catalogue: BecCatalogueItem[] | undefined,
  zoneCode: string,
  subzoneCode: string
): MultiOptionsObj[] => {
  if (!catalogue || !zoneCode || !subzoneCode) return [];
  return catalogue
    .filter((row) => row.becZoneCode === zoneCode
      && row.becSubzoneCode === subzoneCode
      && row.variant !== null)
    .map((row) => ({
      code: row.variant as string,
      description: row.variantName ?? '',
      label: `${row.variant} - ${row.variantName}`
    }));
};

export const isBecVariantRequired = (
  catalogue: BecCatalogueItem[] | undefined,
  zoneCode: string,
  subzoneCode: string
): boolean => getBecVariantItems(catalogue, zoneCode, subzoneCode).length > 0;

export const initBClassCollectionState = (
  defaultAgencyNumber: string,
  defaultLocCode = ''
): BClassCollectionForm => {
  const base = initCollectionState(defaultAgencyNumber, {
    ...emptyCollectionStep,
    collectionLocnCode: defaultLocCode
  });

  return {
    ...base,
    orgUnit: getOptionsInputObj('b-collection-org-unit', EmptyMultiOptObj),
    locationArea: getStringInputObj('b-collection-location-area', ''),
    collectionRadius: getStringInputObj('b-collection-radius', ''),
    elevationMin: getStringInputObj('b-collection-elevation-min', ''),
    elevationMax: getStringInputObj('b-collection-elevation-max', ''),
    elevationMean: getStringInputObj('b-collection-elevation-mean', ''),
    captureMethod: getOptionsInputObj('b-collection-capture-method', EmptyMultiOptObj),
    numberTreesFrom: getOptionsInputObj('b-collection-number-trees-from', EmptyMultiOptObj),
    latDeg: getStringInputObj('b-collection-lat-deg', ''),
    latMin: getStringInputObj('b-collection-lat-min', ''),
    latSec: getStringInputObj('b-collection-lat-sec', ''),
    longDeg: getStringInputObj('b-collection-long-deg', ''),
    longMin: getStringInputObj('b-collection-long-min', ''),
    longSec: getStringInputObj('b-collection-long-sec', ''),
    useLatLongForBec: getBooleanInputObj('b-collection-use-lat-long-bec', true),
    becZone: getOptionsInputObj('b-collection-bec-zone', EmptyMultiOptObj),
    becSubzone: getOptionsInputObj('b-collection-bec-subzone', EmptyMultiOptObj),
    becVariant: getOptionsInputObj('b-collection-bec-variant', EmptyMultiOptObj),
    sameBecUnit: getBooleanInputObj('b-collection-same-bec-unit', true)
  };
};

export const initBClassCollectionStateFromDto = (
  defaultAgencyNumber: string,
  collectionData: BClassCollectionFormSubmitType
): BClassCollectionForm => {
  const base = initCollectionState(defaultAgencyNumber, {
    ...emptyCollectionStep,
    collectionClientNumber: collectionData.collectionClientNumber,
    collectionLocnCode: collectionData.collectionLocnCode,
    collectionStartDate: collectionData.collectionStartDate,
    collectionEndDate: collectionData.collectionEndDate,
    noOfContainers: nullableToString(collectionData.noOfContainers),
    volPerContainer: nullableToString(collectionData.volPerContainer),
    clctnVolume: nullableToString(collectionData.clctnVolume),
    seedlotComment: collectionData.seedlotComment ?? '',
    coneCollectionMethodCodes: collectionData.coneCollectionMethodCodes ?? []
  });

  const variantCode = collectionData.variant != null ? String(collectionData.variant) : '';

  return {
    ...base,
    orgUnit: getOptionsInputObj(
      'b-collection-org-unit',
      collectionData.orgUnitNo != null
        ? toOption(String(collectionData.orgUnitNo))
        : EmptyMultiOptObj
    ),
    locationArea: getStringInputObj('b-collection-location-area', collectionData.collectionLocationDesc ?? ''),
    collectionRadius: getStringInputObj(
      'b-collection-radius',
      nullableToString(collectionData.collectionAreaRadius)
    ),
    elevationMin: getStringInputObj(
      'b-collection-elevation-min',
      nullableToString(collectionData.collectionElevationMin)
    ),
    elevationMax: getStringInputObj(
      'b-collection-elevation-max',
      nullableToString(collectionData.collectionElevationMax)
    ),
    elevationMean: getStringInputObj(
      'b-collection-elevation-mean',
      nullableToString(collectionData.collectionElevation)
    ),
    captureMethod: getOptionsInputObj(
      'b-collection-capture-method',
      toOption(collectionData.captureMethodCode)
    ),
    numberTreesFrom: getOptionsInputObj(
      'b-collection-number-trees-from',
      toOption(collectionData.numberTreesFromCode)
    ),
    latDeg: getStringInputObj('b-collection-lat-deg', nullableToString(collectionData.collectionLatitudeDeg)),
    latMin: getStringInputObj('b-collection-lat-min', nullableToString(collectionData.collectionLatitudeMin)),
    latSec: getStringInputObj('b-collection-lat-sec', nullableToString(collectionData.collectionLatitudeSec)),
    longDeg: getStringInputObj('b-collection-long-deg', nullableToString(collectionData.collectionLongitudeDeg)),
    longMin: getStringInputObj('b-collection-long-min', nullableToString(collectionData.collectionLongitudeMin)),
    longSec: getStringInputObj('b-collection-long-sec', nullableToString(collectionData.collectionLongitudeSec)),
    useLatLongForBec: getBooleanInputObj('b-collection-use-lat-long-bec', true),
    becZone: getOptionsInputObj(
      'b-collection-bec-zone',
      toOption(collectionData.bgcZoneCode, collectionData.bgcZoneDescription)
    ),
    becSubzone: getOptionsInputObj(
      'b-collection-bec-subzone',
      toOption(collectionData.bgcSubzoneCode)
    ),
    becVariant: getOptionsInputObj('b-collection-bec-variant', toOption(variantCode)),
    sameBecUnit: getBooleanInputObj('b-collection-same-bec-unit', !collectionData.becOverrideInd)
  };
};

export { calcVolume, isNumNotInRange };

export const validateBClassCollectionStep = (
  collectionData: BClassCollectionForm,
  becCatalogue?: BecCatalogueItem[]
): boolean => {
  const variantRequired = isBecVariantRequired(
    becCatalogue,
    collectionData.becZone.value.code,
    collectionData.becSubzone.value.code
  );
  const keys = Object.keys(collectionData) as Array<keyof BClassCollectionForm>;
  return keys.some((key) => {
    if (key === 'becVariant' && !variantRequired) {
      return false;
    }
    const field = collectionData[key];
    return field && typeof field === 'object' && 'isInvalid' in field && field.isInvalid;
  });
};

export const verifyBClassCollectionStepCompleteness = (
  collectionData: BClassCollectionForm,
  becCatalogue?: BecCatalogueItem[]
): boolean => {
  if (!collectionData.collectorAgency.value
    || !collectionData.locationCode.value
    || !collectionData.startDate.value
    || !collectionData.endDate.value
    || !collectionData.numberOfContainers.value
    || !collectionData.volumePerContainers.value
    || !collectionData.volumeOfCones.value
    || collectionData.selectedCollectionCodes.value.length === 0
    || !collectionData.orgUnit.value.code
    || !collectionData.captureMethod.value.code
    || !collectionData.numberTreesFrom.value.code
    || !collectionData.latDeg.value
    || !collectionData.latMin.value
    || !collectionData.latSec.value
    || !collectionData.longDeg.value
    || !collectionData.longMin.value
    || !collectionData.longSec.value
    || !collectionData.elevationMean.value
    || !collectionData.elevationMin.value
    || !collectionData.elevationMax.value
    || !collectionData.becZone.value.code
    || !collectionData.becSubzone.value.code) {
    return false;
  }
  return !(isBecVariantRequired(
      becCatalogue,
      collectionData.becZone.value.code,
      collectionData.becSubzone.value.code
  ) && !collectionData.becVariant.value.code);
};
