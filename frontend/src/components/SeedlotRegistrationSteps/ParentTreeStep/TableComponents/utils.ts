import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { AllParentTreeMap, RowDataDictType, RowItem } from '../definitions';
import { getMixRowTemplate } from '../utils';

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
    const genName = genObj.geneticWorthCode.toLocaleLowerCase();
    newRow[genName] = String(genObj.geneticQualityValue);
  });

  return newRow;
};

const cleanRowData = (rowId: string, ptNumber?: string): RowItem => {
  const newRow = getMixRowTemplate();
  newRow.rowId = rowId;
  if (ptNumber) {
    newRow.parentTreeNumber = ptNumber;
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

  // Calculate volume sum
  let volumeSum = 0;
  Object.values(clonedData).forEach((row) => {
    volumeSum += Number(row.volume);
  });

  // Update proportion for each row
  Object.values(clonedData).forEach((row) => {
    const updatedRow = structuredClone(row);
    if (updatedRow.volume?.length) {
      let rowVolume = updatedRow.rowId === rowData.rowId ? volume : updatedRow.volume;
      rowVolume = rowVolume === '' ? '0' : rowVolume;
      const proportion = volumeSum === 0
        ? '0'
        : (Number(rowVolume) / Number(volumeSum)).toFixed(3);
      updatedRow.proportion = proportion;
    } else {
      updatedRow.proportion = '';
    }
    clonedData[updatedRow.rowId] = updatedRow;
  });

  // Update Weighted GVs only if applicableGenWorths is passed in
  Object.values(clonedData).forEach((row) => {
    const updatedRow = structuredClone(row);
    const { proportion } = updatedRow;
    if (proportion?.length) {
      applicableGenWorths.forEach((gw) => {
        updatedRow[`w_${gw}`] = (Number(updatedRow[gw]) * Number(proportion)).toFixed(3);
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
  colName: keyof RowItem,
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
          rowData.parentTreeNumber
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
    mixTabData[rowData.rowId].invalidObjs[colName].isInvalid = isInvalid;
  } else {
    tableRowData[rowData.parentTreeNumber].invalidObjs[colName].isInvalid = isInvalid;
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
  const volume = rowData.volume === null ? '0' : rowData.volumel;
  clonedState.mixTabData = calculateSmpRow(volume, rowData, mixTabData, applicableGenWorths);
  setStepData(clonedState);
};
