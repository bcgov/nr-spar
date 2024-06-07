import validator from 'validator';

import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedPlanZoneDto, SeedPlanZoneOracleDto } from '../../../types/SeedlotType';
import { StringInputType } from '../../../types/FormInputType';

import {
  MIN_MAX_ERR_MSG, ELEVATION_OUT_OF_RANGE_ERR_MSG,
  MAX_ELEVATION_LIMIT, MIN_ELEVATION_LIMIT,
  MIN_DEGREE_LIMIT,
  MAX_DEGREE_LIMIT,
  MIN_MINUTE_AND_SECOND_LIMIT,
  MAX_MINUTE_AND_SECOND_LIMIT,
  DEGREE_OUT_OF_RANGE_ERR_MSG,
  MINUTE_AND_SECOND_OUT_OF_RANGE_ERR_MSG
} from './constants';

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

export const validateElevatioRange = (inputObj: StringInputType): StringInputType => {
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

export const validateMinMaxPair = (
  minObj: StringInputType,
  maxObj: StringInputType,
  rangeValidator: (inputObj: StringInputType) => StringInputType
): {
  minReturnObj: StringInputType, maxReturnObj: StringInputType
} => {
  const minReturnObj = rangeValidator(minObj);
  const maxReturnObj = rangeValidator(maxObj);

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

const isDegreeOutOfRange = (value: string) => (
  !validator.isInt(value, { min: MIN_DEGREE_LIMIT, max: MAX_DEGREE_LIMIT })
);

export const validateDegreeRange = (inputObj: StringInputType): StringInputType => {
  const validatedObj = inputObj;
  validatedObj.isInvalid = isDegreeOutOfRange(inputObj.value);

  if (validatedObj.isInvalid) {
    validatedObj.errMsg = DEGREE_OUT_OF_RANGE_ERR_MSG;
  } else {
    validatedObj.errMsg = undefined;
  }

  return validatedObj;
};

const isMinuteOrSecondOutOfRange = (value: string) => (
  !validator.isInt(value, { min: MIN_MINUTE_AND_SECOND_LIMIT, max: MAX_MINUTE_AND_SECOND_LIMIT })
);

export const validateMinuteOrSecondRange = (inputObj: StringInputType): StringInputType => {
  const validatedObj = inputObj;
  validatedObj.isInvalid = isMinuteOrSecondOutOfRange(inputObj.value);

  if (validatedObj.isInvalid) {
    validatedObj.errMsg = MINUTE_AND_SECOND_OUT_OF_RANGE_ERR_MSG;
  } else {
    validatedObj.errMsg = undefined;
  }

  return validatedObj;
};
