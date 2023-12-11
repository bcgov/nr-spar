import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import {
  AllParentTreeMap, RowDataDictType, RowItem, StrTypeRowItem
} from '../definitions';
import { getMixRowTemplate, calcSum } from '../utils';

export const isPtNumberInvalid = (ptNumber: string, allParentTreeData: AllParentTreeMap) => (
  !Object.keys(allParentTreeData).includes(ptNumber)
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
  const newRow = getMixRowTemplate();
  newRow.rowId = rowId;
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

// Validate and populate inputs
export const handleInput = (
  rowData: RowItem,
  inputValue: string,
  colName: keyof StrTypeRowItem,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  const clonedState = structuredClone(state);
  let mixTabData = { ...clonedState.mixTabData };
  const tableRowData = { ...clonedState.tableRowData };
  let isInvalid = false;
  if (colName === 'parentTreeNumber') {
    if (inputValue.length !== 0) {
      isInvalid = isPtNumberInvalid(inputValue, state.allParentTreeData);
      if (!isInvalid) {
        const populatedRow = populateRowData(rowData, inputValue, state);
        mixTabData[rowData.rowId] = populatedRow;
      } else {
        mixTabData[rowData.rowId] = cleanRowData(
          rowData.rowId,
          rowData.parentTreeNumber.value
        );
        const rowVolume = Number(rowData.volume).toString();
        mixTabData = calculateSmpRow(rowVolume, rowData, mixTabData, applicableGenWorths);
      }
    } else {
      mixTabData[rowData.rowId] = cleanRowData(rowData.rowId);
    }
  }
  if (colName === 'volume') {
    mixTabData = calculateSmpRow(inputValue, rowData, state.mixTabData, applicableGenWorths);
  }

  if (rowData.isMixTab) {
    mixTabData[rowData.rowId][colName].isInvalid = isInvalid;
  } else {
    tableRowData[rowData.parentTreeNumber.value][colName].isInvalid = isInvalid;
  }

  clonedState.mixTabData = mixTabData;
  clonedState.tableRowData = tableRowData;
  setStepData(clonedState);
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
  const volume = rowData.volume === null ? '0' : rowData.volume.value;
  clonedState.mixTabData = calculateSmpRow(volume, rowData, mixTabData, applicableGenWorths);
  setStepData(clonedState);
};
