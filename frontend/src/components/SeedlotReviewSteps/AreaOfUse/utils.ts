import validator from 'validator';

import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedPlanZoneDto, SeedPlanZoneOracleDto } from '../../../types/SeedlotType';
import { StringInputType } from '../../../types/FormInputType';

import {
  MIN_MAX_ERR_MSG, ELEVATION_OUT_OF_RANGE_ERR_MSG,
  MAX_ELEVATION_LIMIT, MIN_ELEVATION_LIMIT,
  MIN_LAT_DEG_LIMIT,
  MAX_LAT_DEG_LIMIT,
  MIN_LONG_DEG_LIMIT,
  MAX_LONG_DEG_LIMIT,
  MIN_MINUTE_AND_SECOND_LIMIT,
  MAX_MINUTE_AND_SECOND_LIMIT,
  LAT_DEG_OUT_OF_RANGE_ERR_MSG,
  LONG_DEG_OUT_OF_RANGE_ERR_MSG,
  MINUTE_AND_SECOND_OUT_OF_RANGE_ERR_MSG
} from './constants';
import { AreaOfUseDataType } from '../../../views/Seedlot/ContextContainerClassA/definitions';
import { dmsToSecond } from '../../../utils/GeospatialUtils';

export const formatSpz = (spzDto: SeedPlanZoneDto) => (
  `${spzDto.code} - ${spzDto.description}`
);

export const spzListToString = (spzDtoList: SeedPlanZoneDto[]) => (
  spzDtoList.map((spzDto) => formatSpz(spzDto)).join(', ')
);

export const formatLatLong = (
  degree: number | null | undefined,
  minute: number | null | undefined,
  second: number | null | undefined
): string => {
  // Use undefined comparison instead of `!second` since second can be 0
  if (degree === undefined || minute === undefined || second === undefined) {
    return '';
  }

  return `${degree}° ${minute}' ${second}"`;
};

/**
 * Converts spz list from oracle to a list of MultiOptionObj.
 */
export const spzListToMultiObj = (spzList: SeedPlanZoneOracleDto[]): MultiOptionsObj[] => {
  const result: MultiOptionsObj[] = spzList.map((spzDto) => (
    {
      code: spzDto.code,
      description: spzDto.description,
      label: `${spzDto.code} - ${spzDto.description}`
    }
  ));

  return result;
};

/**
 * Returns a list of MultiOptionObj that aren't being selected.
 */
export const filterSpzListItem = (
  spzMultiOptionList: MultiOptionsObj[] | undefined,
  existingSpzMultiObjs: MultiOptionsObj[]
): MultiOptionsObj[] => {
  if (!spzMultiOptionList) {
    return [];
  }

  const existingSpzCodes = existingSpzMultiObjs.map((spz) => spz.code);
  return spzMultiOptionList.filter((spz) => !existingSpzCodes.includes(spz.code));
};

const isElevationOutOfRange = (value: string) => (
  !validator.isInt(value, { min: MIN_ELEVATION_LIMIT, max: MAX_ELEVATION_LIMIT })
);

const isMinMaxInvalid = (minVal: string, maxVal: string) => (
  !validator.isInt(minVal, { min: Number(minVal), max: Number(maxVal) })
);

export const validateElevationRange = (inputObj: StringInputType): StringInputType => {
  const returnObj = inputObj;

  if (isElevationOutOfRange(inputObj.value)) {
    returnObj.isInvalid = true;
    returnObj.errMsg = ELEVATION_OUT_OF_RANGE_ERR_MSG;
  } else {
    returnObj.isInvalid = false;
    returnObj.errMsg = undefined;
  }

  return returnObj;
};

export const validateElevationPair = (
  minObj: StringInputType,
  maxObj: StringInputType
): {
  minReturnObj: StringInputType, maxReturnObj: StringInputType
} => {
  const minReturnObj = validateElevationRange(minObj);
  const maxReturnObj = validateElevationRange(maxObj);

  if (!minReturnObj.isInvalid && !maxReturnObj.isInvalid) {
    const isInvalid = isMinMaxInvalid(minObj.value, maxObj.value);
    minReturnObj.isInvalid = isInvalid;
    maxReturnObj.isInvalid = isInvalid;

    if (isInvalid) {
      minReturnObj.errMsg = MIN_MAX_ERR_MSG;
      maxReturnObj.errMsg = MIN_MAX_ERR_MSG;
    } else {
      minReturnObj.errMsg = undefined;
      maxReturnObj.errMsg = undefined;
    }
  }

  return { minReturnObj, maxReturnObj };
};

const isDegreeOutOfRange = (value: string, isLat: boolean) => (
  !validator.isInt(
    value,
    {
      min: isLat ? MIN_LAT_DEG_LIMIT : MIN_LONG_DEG_LIMIT,
      max: isLat ? MAX_LAT_DEG_LIMIT : MAX_LONG_DEG_LIMIT
    }
  )
);

const validateDegreeRange = (inputObj: StringInputType, isLat: boolean): StringInputType => {
  const validatedObj = inputObj;
  validatedObj.isInvalid = isDegreeOutOfRange(inputObj.value, isLat);

  if (validatedObj.isInvalid) {
    validatedObj.errMsg = isLat ? LAT_DEG_OUT_OF_RANGE_ERR_MSG : LONG_DEG_OUT_OF_RANGE_ERR_MSG;
  } else {
    validatedObj.errMsg = undefined;
  }

  return validatedObj;
};

const isMinuteOrSecondOutOfRange = (value: string) => (
  !validator.isInt(value, { min: MIN_MINUTE_AND_SECOND_LIMIT, max: MAX_MINUTE_AND_SECOND_LIMIT })
);

const validateMinuteOrSecondRange = (inputObj: StringInputType): StringInputType => {
  const validatedObj = inputObj;
  validatedObj.isInvalid = isMinuteOrSecondOutOfRange(inputObj.value);

  if (validatedObj.isInvalid) {
    validatedObj.errMsg = MINUTE_AND_SECOND_OUT_OF_RANGE_ERR_MSG;
  } else {
    validatedObj.errMsg = undefined;
  }

  return validatedObj;
};

/**
 * Validate the minimum and maximum latitude longitude degree, minute, second
 */
export const validateDmsMinMax = (areaOfUseData: AreaOfUseDataType): AreaOfUseDataType => {
  let {
    minLatDeg, maxLatDeg,
    minLatMinute, maxLatMinute,
    minLatSec, maxLatSec,
    minLongDeg, maxLongDeg,
    minLongMinute, maxLongMinute,
    minLongSec, maxLongSec
  } = areaOfUseData;

  // Validate range limit of degrees
  minLatDeg = validateDegreeRange(minLatDeg, true);
  maxLatDeg = validateDegreeRange(maxLatDeg, true);
  minLongDeg = validateDegreeRange(minLongDeg, false);
  maxLongDeg = validateDegreeRange(maxLongDeg, false);

  // Validate range limit of minute and second
  minLatMinute = validateMinuteOrSecondRange(minLatMinute);
  maxLatMinute = validateMinuteOrSecondRange(maxLatMinute);
  minLatSec = validateMinuteOrSecondRange(minLatSec);
  maxLatSec = validateMinuteOrSecondRange(maxLatSec);

  minLongMinute = validateMinuteOrSecondRange(minLongMinute);
  maxLongMinute = validateMinuteOrSecondRange(maxLongMinute);
  minLongSec = validateMinuteOrSecondRange(minLongSec);
  maxLongSec = validateMinuteOrSecondRange(maxLongSec);

  const objList = [
    minLatDeg, maxLatDeg,
    minLatMinute, maxLatMinute,
    minLatSec, maxLatSec,
    minLongDeg, maxLongDeg,
    minLongMinute, maxLongMinute,
    minLongSec, maxLongSec
  ];

  const invalidList = objList.filter((inputObj) => inputObj.isInvalid);

  // If all DMS are valid
  // Then Validate the min max pair e.g. Min lat DMS vs Max DMS
  if (invalidList.length === 0) {
    // Latitude
    const minLatTotalSecond = dmsToSecond({
      degree: Number(minLatDeg.value),
      minute: Number(minLatMinute.value),
      second: Number(minLatSec.value)
    });

    const maxLatTotalSecond = dmsToSecond({
      degree: Number(maxLatDeg.value),
      minute: Number(maxLatMinute.value),
      second: Number(maxLatSec.value)
    });

    const isLatInvalid = (maxLatTotalSecond - minLatTotalSecond) < 0;
    minLatDeg.isInvalid = isLatInvalid;
    maxLatDeg.isInvalid = isLatInvalid;
    minLatMinute.isInvalid = isLatInvalid;
    maxLatMinute.isInvalid = isLatInvalid;
    minLatSec.isInvalid = isLatInvalid;
    maxLatSec.isInvalid = isLatInvalid;

    if (isLatInvalid) {
      minLatDeg.errMsg = MIN_MAX_ERR_MSG;
      maxLatDeg.errMsg = MIN_MAX_ERR_MSG;
      // only provide degree inputs with error message so it's not overwhelming to users
      minLatMinute.errMsg = undefined;
      maxLatMinute.errMsg = undefined;
      minLatSec.errMsg = undefined;
      maxLatSec.errMsg = undefined;
    }

    // Longitude
    const minLongTotalSecond = dmsToSecond({
      degree: Number(minLongDeg.value),
      minute: Number(minLongMinute.value),
      second: Number(minLongSec.value)
    });

    const maxLongTotalSecond = dmsToSecond({
      degree: Number(maxLongDeg.value),
      minute: Number(maxLongMinute.value),
      second: Number(maxLongSec.value)
    });

    const isLongInvalid = (maxLongTotalSecond - minLongTotalSecond) < 0;
    minLongDeg.isInvalid = isLongInvalid;
    maxLongDeg.isInvalid = isLongInvalid;
    minLongMinute.isInvalid = isLongInvalid;
    maxLongMinute.isInvalid = isLongInvalid;
    minLongSec.isInvalid = isLongInvalid;
    maxLongSec.isInvalid = isLongInvalid;

    if (isLongInvalid) {
      minLongDeg.errMsg = MIN_MAX_ERR_MSG;
      maxLongDeg.errMsg = MIN_MAX_ERR_MSG;
      // only provide degree inputs with error message so it's not overwhelming to users
      minLongMinute.errMsg = undefined;
      maxLongMinute.errMsg = undefined;
      minLongSec.errMsg = undefined;
      maxLongSec.errMsg = undefined;
    }
  }

  return {
    ...areaOfUseData,
    minLatDeg,
    maxLatDeg,
    minLatMinute,
    maxLatMinute,
    minLatSec,
    maxLatSec,
    minLongDeg,
    maxLongDeg,
    minLongMinute,
    maxLongMinute,
    minLongSec,
    maxLongSec
  };
};
