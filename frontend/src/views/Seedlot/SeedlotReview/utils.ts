import ROUTES from '../../../routes/constants';
import focusById from '../../../utils/FocusUtils';
import { addParamToPath } from '../../../utils/PathUtils';
import { AreaOfUseDataType } from '../ContextContainerClassA/definitions';
import { GenWorthValType, GeoInfoValType } from './definitions';

export const getBreadcrumbs = (seedlotNumber: string) => [
  {
    name: 'Seedlots',
    path: ROUTES.SEEDLOTS
  },
  {
    name: 'My seedlots',
    path: ROUTES.MY_SEEDLOTS
  },
  {
    name: `Seedlot ${seedlotNumber}`,
    path: `${addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber)}`
  }
];

/**
 * Validate genetic worth values
 * Return true if invalid
 */
export const validateGeneticWorth = (genWorthVals: GenWorthValType) => {
  const keys = Object.keys(genWorthVals) as (keyof GenWorthValType)[];

  const invalidObjKeys = keys.filter((key) => genWorthVals[key].isInvalid);

  let isInvalid = false;

  if (invalidObjKeys.length > 0) {
    isInvalid = true;
    const firstkey = invalidObjKeys[0];

    const idToFocus = genWorthVals[firstkey].id;
    focusById(idToFocus);
  }

  return isInvalid;
};

/**
 * Validate collection geospatial values and NE.
 * Return true if invalid
 */
export const validateCollectGeoVals = (geoInfoVal: GeoInfoValType) => {
  const keys = Object.keys(geoInfoVal) as (keyof GeoInfoValType)[];

  const invalidObjKeys = keys.filter((key) => geoInfoVal[key].isInvalid);

  let isInvalid = false;

  if (invalidObjKeys.length > 0) {
    isInvalid = true;
    const firstkey = invalidObjKeys[0];

    const idToFocus = geoInfoVal[firstkey].id;
    focusById(idToFocus);
  }

  return isInvalid;
};

export const validateAreaOfUse = (areaOfUseData: AreaOfUseDataType) => {
  const keys = Object.keys(areaOfUseData) as (keyof AreaOfUseDataType)[];

  // Validate everything but additionalSpzList
  const invalidObjKeys = keys.filter((key) => (
    key !== 'additionalSpzList'
    && areaOfUseData[key].isInvalid
  ));

  let isInvalid = false;

  if (invalidObjKeys.length > 0) {
    isInvalid = true;
    const firstkey = invalidObjKeys[0];

    if (firstkey !== 'additionalSpzList') {
      const idToFocus = areaOfUseData[firstkey].id;
      focusById(idToFocus);
      return isInvalid;
    }
  }

  // validate additionalSpzList
  if (areaOfUseData.additionalSpzList.length > 0) {
    const invalidSpzObjs = areaOfUseData.additionalSpzList.filter((spz) => spz.isInvalid);
    if (invalidSpzObjs.length > 0) {
      isInvalid = true;
      const firstObjId = invalidSpzObjs[0].id;
      focusById(firstObjId);
    }
  }

  return isInvalid;
};
