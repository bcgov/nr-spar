import ROUTES from '../../../routes/constants';
import focusById from '../../../utils/FocusUtils';
import { addParamToPath } from '../../../utils/PathUtils';
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
    console.log(idToFocus);
    focusById(idToFocus);
  }

  return isInvalid;
};
