import { QueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { OrchardObj } from '../OrchardStep/definitions';
import {
  RowItem, InfoSectionConfigType, RowDataDictType,
  HeaderObj, TabTypes, CompUploadResponse, GeneticWorthDictType
} from './definitions';
import { EMPTY_NUMBER_STRING, rowTemplate } from './constants';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { sliceTableRowData } from '../../../utils/PaginationUtils';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { recordKeys } from '../../../utils/RecordUtils';
import { GenWorthCalcPayload, GeneticTrait } from '../../../types/GeneticWorthTypes';

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

export const processParentTreeData = (
  data: ParentTreeGeneticQualityType,
  state: ParentTreeStepDataObj,
  currentPage: number,
  currPageSize: number,
  setSlicedRows: Function,
  setStepData: Function
) => {
  const modifiedState = { ...state };
  let clonedTableRowData: RowDataDictType = structuredClone(state.tableRowData);

  data.parentTrees.forEach((parentTree) => {
    if (!Object.prototype.hasOwnProperty.call(clonedTableRowData, parentTree.parentTreeNumber)) {
      const newRowData: RowItem = structuredClone(rowTemplate);
      newRowData.parentTreeNumber = parentTree.parentTreeNumber;
      // Assign genetic worth values
      parentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
        // We only care about breeding values of genetic worth
        if (singleGenWorthObj.geneticTypeCode === 'BV') {
          const genWorthName = singleGenWorthObj.geneticWorthCode.toLowerCase();
          if (Object.prototype.hasOwnProperty.call(newRowData, genWorthName)) {
            newRowData[genWorthName] = singleGenWorthObj.geneticQualityValue;
          }
        }
      });
      clonedTableRowData = Object.assign(clonedTableRowData, {
        [parentTree.parentTreeNumber]: newRowData
      });
    }
  });

  modifiedState.tableRowData = clonedTableRowData;
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

export const getParentTreesFetchStatus = (
  orchardsData: OrchardObj[],
  queryClient: QueryClient
): boolean => {
  let isFetching = false;
  orchardsData.forEach((orchard) => {
    const orchardId = orchard.selectedItem?.code ? orchard.selectedItem.code : '';
    const queryKey = ['orchard', 'parent-tree-genetic-quality', orchardId];
    const queryStatus = queryClient.getQueryState(queryKey);
    if (!isFetching && queryStatus?.fetchStatus === 'fetching') {
      isFetching = true;
    }
  });
  return isFetching;
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
  res: AxiosResponse,
  state: ParentTreeStepDataObj,
  headerConfig: HeaderObj[],
  currentTab: keyof TabTypes,
  setStepData: Function
) => {
  // Store parent tree numbers that does not exist in the orchards
  const invalidParentTreeNumbers: Array<string> = [];

  // Clean the table first
  const clonedState = cleanTable(state, headerConfig, currentTab, setStepData);

  res.data.forEach((row: CompUploadResponse) => {
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
  setHeaderConfig: Function
) => {
  const speciesHasGenWorth = Object.keys(geneticWorthDict);
  if (speciesHasGenWorth.includes(seedlotSpecies.code)) {
    const availableOptions = geneticWorthDict[seedlotSpecies.code];
    const clonedHeaders = structuredClone(headerConfig);
    let clonedGwItems = structuredClone(genWorthInfoItems);
    availableOptions.forEach((opt: string) => {
      const optionIndex = headerConfig.findIndex((header) => header.id === opt);
      // Enable option in the column customization
      clonedHeaders[optionIndex].isAnOption = true;
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
    });
    setHeaderConfig(clonedHeaders);
    setGenWorthInfoItems(clonedGwItems);
  }
};

export const setInputChange = (
  parentTreeNumber: string,
  colName: keyof RowItem,
  value: string,
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  // Using structuredClone so useEffect on state.tableRowData can be triggered
  const clonedState = structuredClone(state);
  clonedState.tableRowData[parentTreeNumber][colName] = value;
  setStepData(clonedState);
};

export const fillGwInfo = (
  geneticTraits: GeneticTrait[],
  genWorthInfoItems: Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: Function
) => {
  const tempGenWorthItems = structuredClone(genWorthInfoItems);
  const gwCodesToFill = recordKeys(tempGenWorthItems);
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
