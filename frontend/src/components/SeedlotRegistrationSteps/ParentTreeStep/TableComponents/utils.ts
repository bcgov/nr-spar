import validator from 'validator';
import BigNumber from 'bignumber.js';

import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegFormClassA/definitions';

import {
  AllParentTreeMap, RowDataDictType, RowItem, StrTypeRowItem
} from '../definitions';
import { getMixRowTemplate, calcSum, populateStrInputId } from '../utils';
import {
  CONE_COUNT_MAX, CONE_COUNT_MIN, MAX_DECIMAL_DIGITS, NON_ORCHARD_CONTAM_MAX,
  NON_ORCHARD_CONTAM_MIN, POLLEN_COUNT_MAX, POLLEN_COUNT_MIN,
  SMP_SUCCESS_PERC_MAX, SMP_SUCCESS_PERC_MAX_PW, SMP_SUCCESS_PERC_MIN, VOLUME_MAX, VOLUME_MIN
} from '../constants';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';

export const isPtNumberInvalid = (ptNumber: string, allParentTreeData: AllParentTreeMap) => (
  !Object.keys(allParentTreeData).includes(ptNumber)
);

const isPtNumberDuplicate = (rowId: string, ptNumber: string, mixTabData: RowDataDictType) => (
  Object.values(mixTabData)
    .filter((row) => (
      row.parentTreeNumber.value === ptNumber
      && row.rowId !== rowId
    )).length > 0
);

export const populateRowData = (
  rowData: RowItem,
  ptNumber: string,
  state: ParentTreeStepDataObj
): RowItem => {
  const ptData = state.allParentTreeData[ptNumber];
  const newRow = { ...rowData };
  ptData.parentTreeGeneticQualities.forEach((genObj) => {
    const genName = genObj.geneticWorthCode.toLocaleLowerCase() as keyof StrTypeRowItem;
    newRow[genName].value = String(genObj.geneticQualityValue);
  });

  return newRow;
};

const cleanRowData = (rowId: string, ptNumber?: string): RowItem => {
  let newRow = getMixRowTemplate();
  newRow.rowId = rowId;
  newRow = populateStrInputId(rowId, newRow);
  if (ptNumber) {
    newRow.parentTreeNumber.value = ptNumber;
  }
  return newRow;
};

/**
 * Calculate proportion for each row, then calculate weighted GV for each row
 */
const calculateSmpRow = (
  volume: string,
  rowData: RowItem,
  mixTabData: RowDataDictType,
  applicableGenWorths: string[]
): RowDataDictType => {
  const clonedData = structuredClone(mixTabData);
  if (clonedData[rowData.rowId]) {
    clonedData[rowData.rowId].volume.value = volume;
  }

  const tableRows = Object.values(clonedData);
  // Calculate volume sum
  const volumeSum = calcSum(tableRows, 'volume');

  // Update proportion for each row
  tableRows.forEach((row) => {
    const updatedRow = structuredClone(row);
    if (updatedRow.volume.value.length) {
      let rowVolume = updatedRow.rowId === rowData.rowId ? volume : updatedRow.volume.value;
      rowVolume = rowVolume === '' ? '0' : rowVolume;
      const proportion = volumeSum === '0'
        ? '0'
        : (Number(rowVolume) / Number(volumeSum)).toFixed(3);
      updatedRow.proportion.value = proportion;
    } else {
      updatedRow.proportion.value = '';
    }
    clonedData[updatedRow.rowId] = updatedRow;
  });

  // Update Weighted GVs only if applicableGenWorths is passed in
  Object.values(clonedData).forEach((row) => {
    const updatedRow = structuredClone(row);
    const { proportion } = updatedRow;
    if (proportion.value.length) {
      applicableGenWorths.forEach((gw) => {
        const gwColName = gw as keyof StrTypeRowItem;
        const weightedColName = `w_${gw}` as keyof StrTypeRowItem;
        updatedRow[weightedColName]
          .value = (Number(updatedRow[gwColName].value) * Number(proportion.value)).toFixed(3);
      });
      clonedData[updatedRow.rowId] = updatedRow;
    }
  });

  return clonedData;
};

export const getPTNumberErrMsg = (value: string): string => (
  `"${value}" is an invalid parent tree number. Please provide a valid parent tree number and review the number you have entered.`
);

/**
 * A float validator, the validator.isFloat() cannot handle high precision comparing.
 */
const isFloatWithinRange = (value: string, min: string, max: string): boolean => (
  new BigNumber(value).isGreaterThanOrEqualTo(min)
  && new BigNumber(value).isLessThanOrEqualTo(max)
);

export const isConeCountInvalid = (value: string): boolean => {
  if (!value) {
    return false;
  }
  let isValid = isFloatWithinRange(value, CONE_COUNT_MIN, CONE_COUNT_MAX);
  if (isValid) {
    isValid = validator.isDecimal(value, { decimal_digits: `0,${MAX_DECIMAL_DIGITS}` });
  }
  return !isValid;
};

export const getConeCountErrMsg = (): string => (
  `Invalid entry. Value must be between ${CONE_COUNT_MIN} and ${CONE_COUNT_MAX} and up to 10 decimal places.`
);

export const isPollenCountInvalid = (value: string): boolean => {
  if (!value) {
    return false;
  }
  let isValid = isFloatWithinRange(value, POLLEN_COUNT_MIN, POLLEN_COUNT_MAX);
  if (isValid) {
    isValid = validator.isDecimal(value, { decimal_digits: `0,${MAX_DECIMAL_DIGITS}` });
  }
  return !isValid;
};

export const getPollenCountErrMsg = (): string => (
  `Invalid entry. Value must be between ${POLLEN_COUNT_MIN} and ${POLLEN_COUNT_MAX} and up to 10 decimal places.`
);

/**
 * SMP success on parent (%)
 * isPw = an indicator for whether the species is Western White Pine
 * this species has can have a 100% max value.
 */
export const isSmpSuccInvalid = (value: string, isPw: boolean): boolean => (
  value === '' ? false : !validator.isInt(value, { min: SMP_SUCCESS_PERC_MIN, max: isPw ? SMP_SUCCESS_PERC_MAX_PW : SMP_SUCCESS_PERC_MAX })
);

export const getSmpSuccErrMsg = (value: string): string => (
  `"${value}" is an invalid entry. Please provide a valid SMP success on parent (%) value between ${SMP_SUCCESS_PERC_MIN} and ${SMP_SUCCESS_PERC_MAX}.`
);

/**
 * Non-orchard pollen contam. (%)
 */
export const isNonOrchardContamInvalid = (value: string): boolean => (
  value === '' ? false : !validator.isInt(value, { min: NON_ORCHARD_CONTAM_MIN, max: NON_ORCHARD_CONTAM_MAX })
);

export const getNonOrchardContamErrMsg = (value: string): string => (
  `"${value}" is an invalid entry. Please provide a valid Non-orchard pollen contam. (%) value between ${NON_ORCHARD_CONTAM_MIN} and ${NON_ORCHARD_CONTAM_MAX}.`
);

export const isVolumeInvalid = (value: string): boolean => (
  value === '' ? false : !validator.isInt(value, { min: VOLUME_MIN, max: VOLUME_MAX })
);

export const getVolumeErrMsg = (value: string): string => (
  `"${value}" is an invalid entry. Please provide a valid integer volume value between ${VOLUME_MIN} and ${VOLUME_MAX}.`
);

// Validate and populate inputs
export const handleInput = (
  rowData: RowItem,
  inputValue: string,
  colName: keyof StrTypeRowItem,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function,
  seedlotSpecies: MultiOptionsObj
) => {
  const clonedState = structuredClone(state);
  let mixTabData = { ...clonedState.mixTabData };
  const tableRowData = { ...clonedState.tableRowData };
  let isInvalid = false;
  let isDuplicate = false;
  let errMsg = '';
  if (colName === 'parentTreeNumber') {
    if (inputValue.length !== 0) {
      isInvalid = isPtNumberInvalid(inputValue, state.allParentTreeData);
      isDuplicate = isPtNumberDuplicate(rowData.rowId, inputValue, state.mixTabData);
      if (!isInvalid) {
        const populatedRow = populateRowData(rowData, inputValue, state);
        mixTabData[rowData.rowId] = populatedRow;
        const rowVolume = populatedRow.volume.value;
        mixTabData = calculateSmpRow(rowVolume, rowData, mixTabData, applicableGenWorths);
      } else {
        mixTabData[rowData.rowId] = cleanRowData(
          rowData.rowId,
          rowData.parentTreeNumber.value
        );
        errMsg = getPTNumberErrMsg(inputValue);
      }
    } else {
      mixTabData[rowData.rowId] = cleanRowData(rowData.rowId);
    }
  }

  if (colName === 'coneCount') {
    isInvalid = isConeCountInvalid(inputValue);
    if (isInvalid) {
      errMsg = getConeCountErrMsg();
    }
  }

  if (colName === 'pollenCount') {
    isInvalid = isPollenCountInvalid(inputValue);
    if (isInvalid) {
      errMsg = getPollenCountErrMsg();
    }
  }

  if (colName === 'smpSuccessPerc') {
    isInvalid = isSmpSuccInvalid(inputValue, seedlotSpecies.code === 'PW');
    if (isInvalid) {
      errMsg = getSmpSuccErrMsg(inputValue);
    }
  }

  if (colName === 'nonOrchardPollenContam') {
    isInvalid = isNonOrchardContamInvalid(inputValue);
    if (isInvalid) {
      errMsg = getNonOrchardContamErrMsg(inputValue);
    }
  }

  if (colName === 'volume') {
    mixTabData = calculateSmpRow(inputValue, rowData, state.mixTabData, applicableGenWorths);
    isInvalid = isVolumeInvalid(inputValue);
    if (isInvalid) {
      errMsg = getVolumeErrMsg(inputValue);
    }
  }

  // Set isInvalid and errMsg
  if (rowData.isMixTab) {
    mixTabData[rowData.rowId][colName].value = inputValue;
    mixTabData[rowData.rowId][colName].isInvalid = isInvalid || isDuplicate;
    mixTabData[rowData.rowId][colName].errMsg = errMsg;
  } else {
    tableRowData[rowData.parentTreeNumber.value][colName].value = inputValue;
    tableRowData[rowData.parentTreeNumber.value][colName].isInvalid = isInvalid;
    tableRowData[rowData.parentTreeNumber.value][colName].errMsg = errMsg;
  }
  clonedState.mixTabData = mixTabData;
  clonedState.tableRowData = tableRowData;
  setStepData('parentTreeStep', clonedState);
};

export const deleteMixRow = (
  rowData: RowItem,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  const clonedState = structuredClone(state);
  const mixTabData = { ...clonedState.mixTabData };
  delete mixTabData[rowData.rowId];
  const volume = rowData.volume.value === null ? '0' : rowData.volume.value;
  clonedState.mixTabData = calculateSmpRow(volume, rowData, mixTabData, applicableGenWorths);
  setStepData('parentTreeStep', clonedState);
};
