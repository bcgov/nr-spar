import { OrchardObj } from '../OrchardStep/definitions';
import {
  RowItem, InfoSectionConfigType, RowDataDictType,
  HeaderObj, TabTypes, CompUploadResponse, GeneticWorthDictType, MixUploadResponse
} from './definitions';
import { EMPTY_NUMBER_STRING, rowTemplate } from './constants';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { sliceTableRowData } from '../../../utils/PaginationUtils';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { recordKeys } from '../../../utils/RecordUtils';
import { GenWorthCalcPayload, CalcPayloadResType } from '../../../types/GeneticWorthTypes';
import { isPtNumberInvalid, populateRowData } from './TableComponents/utils';

export const getTabString = (selectedIndex: number) => {
  switch (selectedIndex) {
    case 0:
      return 'coneTab';
    case 1:
      return 'successTab';
    case 2:
      return 'mixTab';
    default:
      return 'coneTab';
  }
};

// Returns a merged array of orchards, duplicated orchards are merged as one
export const processOrchards = (orchards: Array<OrchardObj>): Array<OrchardObj> => {
  const obj = {};

  orchards.forEach((orchard) => {
    if (orchard.selectedItem) {
      Object.assign(obj, {
        [orchard.selectedItem.code]: orchard
      });
    }
  });

  return Object.values(obj);
};

export const combineObjectValues = (objs: Array<InfoSectionConfigType>): Array<InfoDisplayObj> => {
  let combined: Array<InfoDisplayObj> = [];

  objs.forEach((obj) => {
    const vals = Object.values(obj);
    combined = [
      ...combined,
      ...vals
    ];
  });

  return combined;
};

const calcAverage = (tableRows: Array<RowItem>, field: string): string => {
  let sum = 0;
  let total = tableRows.length;
  tableRows.forEach((row) => {
    // add if the value is not null
    if (row[field]) {
      sum += Number(row[field]);
    } else {
      total -= 1;
    }
  });

  const average = (sum / total).toFixed(2);

  // No value for calculation, 0 / 0 will result in NaN
  if (total === 0) return EMPTY_NUMBER_STRING;

  // If the value is an integer return the whole number
  if (Number(average) % 1 === 0) {
    return Number(average).toFixed(0);
  }
  return average;
};

const calcSum = (tableRows: Array<RowItem>, field: string): string => {
  let sum = 0;

  tableRows.forEach((row) => {
    // add if the value is not null
    if (row[field]) {
      sum += Number(row[field]);
    }
  });
  return sum.toString();
};

export const calcSummaryItems = (
  disableOptions: boolean,
  setSummaryConfig: Function,
  summaryConfig: Record<string, any>,
  tableRows: RowItem[]
) => {
  if (!disableOptions) {
    const modifiedSummaryConfig = { ...summaryConfig };

    // Calc Total Number of Parent Trees
    modifiedSummaryConfig.sharedItems
      .totalParentTree.value = tableRows.length.toString();

    // Calc Total number of cone count
    modifiedSummaryConfig.coneTab
      .infoItems.totalCone.value = calcSum(tableRows, 'coneCount');

    // Calc Total number of pollen count
    modifiedSummaryConfig.coneTab
      .infoItems.totalPollen.value = calcSum(tableRows, 'pollenCount');

    // Calc AVG of SMP Success
    modifiedSummaryConfig.successTab
      .infoItems.avgSMPSuccess.value = calcAverage(tableRows, 'smpSuccessPerc');

    // Calc AVG of of non-orchard pollen contam.
    modifiedSummaryConfig.successTab
      .infoItems.avgNonOrchardContam.value = calcAverage(tableRows, 'nonOrchardPollenContam');

    setSummaryConfig(modifiedSummaryConfig);
  }
};

const getOutsideParentTreeNum = (state: ParentTreeStepDataObj): string => {
  let sum = 0;
  const insidePtNums = Object.keys(state.tableRowData);
  const ptNumsInMixTab: string[] = [];
  Object.values(state.mixTabData).forEach((row) => {
    if (
      row.parentTreeNumber?.length
      && !row.invalidObjs.parentTreeNumber.isInvalid
    ) {
      ptNumsInMixTab.push(row.parentTreeNumber);
    }
  });

  ptNumsInMixTab.forEach((ptNum) => {
    if (!insidePtNums.includes(ptNum)) {
      sum += 1;
    }
  });

  return sum.toString();
};

export const calcMixTabInfoItems = (
  disableOptions: boolean,
  summaryConfig: Record<string, any>,
  setSummaryConfig: Function,
  applicableGenWorths: string[],
  weightedGwInfoItems: Record<keyof RowItem, InfoDisplayObj>,
  setWeightedGwInfoItems: Function,
  state: ParentTreeStepDataObj
) => {
  if (!disableOptions) {
    const modifiedSummaryConfig = { ...summaryConfig };
    const tableRows = Object.values(state.mixTabData);

    // Calc number of SMP parents from outside
    modifiedSummaryConfig.mixTab.infoItems.parentsOutside.value = getOutsideParentTreeNum(state);

    // Total volume (ml)
    modifiedSummaryConfig.mixTab.infoItems.totalVolume.value = calcSum(tableRows, 'volume');

    setSummaryConfig(modifiedSummaryConfig);

    // Calculate the sum of each weighted gw value
    const modifiedWeightedGwInfoItems = { ...weightedGwInfoItems };
    applicableGenWorths.forEach((gw) => {
      const weightedId = `w_${gw}`;
      const sumWeighted = calcSum(tableRows, weightedId);
      modifiedWeightedGwInfoItems[gw].value = Number(sumWeighted).toFixed(3);
    });
    setWeightedGwInfoItems(modifiedWeightedGwInfoItems);
  }
};

export const processParentTreeData = (
  data: ParentTreeGeneticQualityType[],
  state: ParentTreeStepDataObj,
  orchardIds: (string | undefined)[],
  currentPage: number,
  currPageSize: number,
  setSlicedRows: Function,
  setStepData: Function
) => {
  const modifiedState = { ...state };
  const clonedAllData = structuredClone(state.allParentTreeData);
  let clonedTableRowData: RowDataDictType = structuredClone(state.tableRowData);

  data.forEach((parentTree) => {
    Object.assign(clonedAllData, { [parentTree.parentTreeNumber]: parentTree });
    if (
      !Object.prototype.hasOwnProperty.call(clonedTableRowData, parentTree.parentTreeNumber)
      && orchardIds.includes(parentTree.orchardId)
    ) {
      const newRowData: RowItem = structuredClone(rowTemplate);
      newRowData.parentTreeNumber = parentTree.parentTreeNumber;
      // Assign genetic worth values
      parentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
        const genWorthName = singleGenWorthObj.geneticWorthCode.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(newRowData, genWorthName)) {
          newRowData[genWorthName] = singleGenWorthObj.geneticQualityValue;
        }
      });
      clonedTableRowData = Object.assign(clonedTableRowData, {
        [parentTree.parentTreeNumber]: newRowData
      });
    }
  });

  modifiedState.tableRowData = clonedTableRowData;
  modifiedState.allParentTreeData = clonedAllData;
  sliceTableRowData(
    Object.values(clonedTableRowData),
    currentPage,
    currPageSize,
    false,
    'parentTreeNumber',
    setSlicedRows
  );
  setStepData(modifiedState);
};

export const cleanTable = (
  state: ParentTreeStepDataObj,
  headerConfig: HeaderObj[],
  currentTab: keyof TabTypes,
  setStepData: Function
) => {
  const clonedState = structuredClone(state);
  const fieldsToClean = headerConfig
    .filter((header) => header.editable && header.availableInTabs.includes(currentTab))
    .map((header) => header.id);
  const parentTreeNumbers = Object.keys(clonedState.tableRowData);
  parentTreeNumbers.forEach((parentTreeNumber) => {
    fieldsToClean.forEach((field) => {
      clonedState.tableRowData[parentTreeNumber][field] = '';
    });
  });
  setStepData(clonedState);
  return clonedState;
};

export const applyValueToAll = (
  field: keyof RowItem,
  value: string,
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  const clonedState = structuredClone(state);
  const parentTreeNumbers = Object.keys(clonedState.tableRowData);
  parentTreeNumbers.forEach((number) => {
    clonedState.tableRowData[number][field] = value;
  });
  setStepData(clonedState);
};

export const fillCompostitionTables = (
  data: CompUploadResponse[],
  state: ParentTreeStepDataObj,
  headerConfig: HeaderObj[],
  currentTab: keyof TabTypes,
  setStepData: Function
) => {
  // Store parent tree numbers that does not exist in the orchards
  const invalidParentTreeNumbers: Array<string> = [];

  // Clean the table first
  const clonedState = cleanTable(state, headerConfig, currentTab, setStepData);

  data.forEach((row: CompUploadResponse) => {
    const parentTreeNumber = row.parentTreeNumber.toString();
    if (Object.prototype.hasOwnProperty.call(clonedState.tableRowData, parentTreeNumber)) {
      // If the clone nubmer exist from user file then fill in the values
      clonedState.tableRowData[parentTreeNumber].coneCount = row.coneCount.toString();
      clonedState.tableRowData[parentTreeNumber].pollenCount = row.pollenCount.toString();
      clonedState.tableRowData[parentTreeNumber].smpSuccessPerc = row.smpSuccess.toString();
      clonedState.tableRowData[parentTreeNumber]
        .nonOrchardPollenContam = row.pollenContamination.toString();
    } else {
      invalidParentTreeNumbers.push(parentTreeNumber);
    }
  });

  setStepData(clonedState);

  if (invalidParentTreeNumbers.length > 0) {
    // A temporary solution to let users know they have invalid clone numbers
    // eslint-disable-next-line no-alert
    alert(`The following clone numbers cannot be found: ${invalidParentTreeNumbers}`);
  }
};

export const toggleNotification = (
  notifType: string,
  state: ParentTreeStepDataObj,
  currentTab: keyof TabTypes,
  setStepData: Function
) => {
  const modifiedState = { ...state };
  if (notifType === 'info') {
    modifiedState.notifCtrl[currentTab].showInfo = false;
  }
  if (notifType === 'error') {
    modifiedState.notifCtrl[currentTab].showError = false;
  }
  setStepData(modifiedState);
};

export const toggleColumn = (
  colName: keyof RowItem,
  nodeName: string,
  headerConfig: HeaderObj[],
  setHeaderConfig: Function
) => {
  // Without this check the checkbox will be clicked twice
  if (nodeName !== 'INPUT') {
    const clonedHeaders = structuredClone(headerConfig);
    const optionIndex = headerConfig.findIndex((header) => header.id === colName);
    clonedHeaders[optionIndex].enabled = !headerConfig[optionIndex].enabled;
    setHeaderConfig(clonedHeaders);
  }
};

/**
 * Each seedlot species has its own associated Genetic Worth values that users can toggle,
 * only those values associated are displayed to user.
 * This function toggles the isAnOption field of a header column so it can be
 * displayed as an option
 */
export const configHeaderOpt = (
  geneticWorthDict: GeneticWorthDictType,
  seedlotSpecies: MultiOptionsObj,
  headerConfig: HeaderObj[],
  genWorthInfoItems: Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: Function,
  setHeaderConfig: Function,
  weightedGwInfoItems: Record<keyof RowItem, InfoDisplayObj>,
  setWeightedGwInfoItems: Function,
  setApplicableGenWorths: Function
) => {
  const speciesHasGenWorth = Object.keys(geneticWorthDict);
  if (speciesHasGenWorth.includes(seedlotSpecies.code)) {
    const availableOptions = geneticWorthDict[seedlotSpecies.code];
    setApplicableGenWorths(availableOptions);
    const clonedHeaders = structuredClone(headerConfig);
    let clonedGwItems = structuredClone(genWorthInfoItems);
    let clonedWeightedGwItems = structuredClone(weightedGwInfoItems);
    availableOptions.forEach((opt: string) => {
      const optionIndex = headerConfig.findIndex((header) => header.id === opt);
      // Enable option in the column customization
      clonedHeaders[optionIndex].isAnOption = true;

      // Enable weighted option in mix tab
      const weightedIndex = headerConfig.findIndex((header) => header.id === `w_${opt}`);
      if (weightedIndex > -1) {
        clonedHeaders[weightedIndex].isAnOption = true;
      }

      // Add GW input to the corresponding info section
      const gwAbbrevName = String(clonedHeaders[optionIndex].id).toUpperCase();
      clonedGwItems = Object.assign(clonedGwItems, {
        [clonedHeaders[optionIndex].id]: [
          {
            name: `Genetic worth ${gwAbbrevName}`,
            value: EMPTY_NUMBER_STRING
          },
          {
            name: `Tested parent trees % (${gwAbbrevName})`,
            value: EMPTY_NUMBER_STRING
          }
        ]
      });
      // Add weighted GW info to mix tab info section
      clonedWeightedGwItems = Object.assign(clonedWeightedGwItems, {
        [clonedHeaders[optionIndex].id]: {
          name: `SMP Breeding Value - ${gwAbbrevName}`,
          value: EMPTY_NUMBER_STRING
        }
      });
    });
    setHeaderConfig(clonedHeaders);
    setGenWorthInfoItems(clonedGwItems);
    setWeightedGwInfoItems(clonedWeightedGwItems);
  }
};

export const setInputChange = (
  rowData: RowItem,
  colName: keyof RowItem,
  value: string,
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  // Using structuredClone so useEffect on state.tableRowData can be triggered
  const clonedState = structuredClone(state);
  if (rowData.isMixTab) {
    clonedState.mixTabData[rowData.rowId][colName] = value;
  } else {
    clonedState.tableRowData[rowData.parentTreeNumber][colName] = value;
  }

  setStepData(clonedState);
};

export const fillCalculatedInfo = (
  data: CalcPayloadResType,
  genWorthInfoItems: Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: Function,
  popSizeAndDiversityConfig: Record<string, any>,
  setPopSizeAndDiversityConfig: Function
) => {
  const tempGenWorthItems = structuredClone(genWorthInfoItems);
  const gwCodesToFill = recordKeys(tempGenWorthItems);
  const { geneticTraits, neValue }: CalcPayloadResType = data;
  // Fill in calculated gw values and percentage
  gwCodesToFill.forEach((gwCode) => {
    const upperCaseCode = String(gwCode).toUpperCase();
    const traitIndex = geneticTraits.map((trait) => trait.traitCode).indexOf(upperCaseCode);
    if (traitIndex > -1) {
      const tuple = tempGenWorthItems[gwCode];
      const traitValueInfoObj = tuple.filter((obj) => obj.name.startsWith('Genetic'))[0];
      traitValueInfoObj.value = geneticTraits[traitIndex].calculatedValue
        ? (Number(geneticTraits[traitIndex].calculatedValue)).toFixed(1)
        : EMPTY_NUMBER_STRING;
      const testedPercInfoObj = tuple.filter((obj) => obj.name.startsWith('Tested'))[0];
      testedPercInfoObj.value = (
        Number(geneticTraits[traitIndex].testedParentTreePerc) * 100
      ).toFixed(2);
      tempGenWorthItems[gwCode] = [traitValueInfoObj, testedPercInfoObj];
    }
  });
  setGenWorthInfoItems(tempGenWorthItems);

  // Fill in Ne value
  const newPopAndDiversityConfig = { ...popSizeAndDiversityConfig };
  newPopAndDiversityConfig.ne.value = neValue.toFixed(1);
  setPopSizeAndDiversityConfig(newPopAndDiversityConfig);
};

export const generateGenWorthPayload = (
  state: ParentTreeStepDataObj,
  geneticWorthDict: GeneticWorthDictType,
  seedlotSpecies: MultiOptionsObj
): GenWorthCalcPayload[] => {
  const { tableRowData } = state;
  const payload: GenWorthCalcPayload[] = [];
  const rows = Object.values(tableRowData);
  const genWorthTypes = geneticWorthDict[seedlotSpecies.code];
  rows.forEach((row) => {
    const newPayloadItem: GenWorthCalcPayload = {
      parentTreeNumber: row.parentTreeNumber,
      coneCount: Number(row.coneCount),
      pollenCount: Number(row.pollenCount),
      geneticTraits: []
    };
    // Populate geneticTraits array
    genWorthTypes.forEach((gwType) => {
      newPayloadItem.geneticTraits.push({
        traitCode: gwType,
        traitValue: Number(row[gwType])
      });
    });
    payload.push(newPayloadItem);
  });

  return payload;
};

export const getMixRowTemplate = (): RowItem => {
  const newRow = structuredClone(rowTemplate);
  newRow.isMixTab = true;
  newRow.rowId = '-1';
  return newRow;
};

export const addNewMixRow = (state: ParentTreeStepDataObj, setStepData: Function) => {
  const clonedState = structuredClone(state);
  const mixTableData = clonedState.mixTabData;
  let maxRowId = -1;
  Object.values(mixTableData).forEach((row) => {
    if (Number(row.rowId) > maxRowId) {
      maxRowId = Number(row.rowId);
    }
  });
  const newRow = getMixRowTemplate();
  const newRowId = maxRowId + 1;
  newRow.rowId = String(newRowId);
  Object.assign(mixTableData, { [newRowId]: newRow });
  clonedState.mixTabData = mixTableData;
  setStepData(clonedState);
};

/**
 * Update proportions and relavent weighted GW values.
 */
const updateCalculations = (
  tableDataObj: RowDataDictType,
  applicableGenWorths: string[]
): RowDataDictType => {
  const clonedTable = structuredClone(tableDataObj);
  const tableRows = Object.values(clonedTable);

  // Calculate sum
  const sum = Number(calcSum(tableRows, 'volume'));

  if (sum > 0) {
    // Calculate proportion for each row
    tableRows.forEach((row) => {
      const { rowId, volume } = row;
      const proportion = (Number(volume) / sum).toFixed(3);
      clonedTable[rowId].proportion = proportion;
      // Update relavent weighted gw
      applicableGenWorths.forEach((gw) => {
        clonedTable[rowId][`w_${gw}`] = (Number(clonedTable[rowId][gw]) * Number(proportion)).toFixed(3);
      });
    });
  }
  return clonedTable;
};

export const fillMixTable = (
  data: MixUploadResponse[],
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  let newRows = {};
  const clonedState = structuredClone(state);
  data.forEach((row: MixUploadResponse, index: number) => {
    let newRow = getMixRowTemplate();
    const ptNumber = String(row.parentTreeNumber);
    newRow.rowId = index;
    newRow.parentTreeNumber = ptNumber;
    newRow.volume = String(row.pollenVolume);

    // Validate pt number
    const isPtInvalid = isPtNumberInvalid(ptNumber, state.allParentTreeData);
    newRow.invalidObjs.parentTreeNumber.isInvalid = isPtInvalid;

    // Populate data such as gw value
    if (!isPtInvalid) {
      newRow = populateRowData(newRow, ptNumber, state);
    }

    Object.assign(newRows, { [newRow.rowId]: newRow });
  });

  newRows = updateCalculations(newRows, applicableGenWorths);
  clonedState.mixTabData = newRows;
  setStepData(clonedState);
};
