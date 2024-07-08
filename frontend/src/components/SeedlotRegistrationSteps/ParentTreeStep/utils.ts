import React from 'react';
import validator from 'validator';
import BigNumber from 'bignumber.js';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { isFloatWithinRange } from '../../../utils/NumberUtils';
import { sliceTableRowData } from '../../../utils/PaginationUtils';
import { recordKeys } from '../../../utils/RecordUtils';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/ContextContainerClassA/definitions';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { StringInputType } from '../../../types/FormInputType';
import { PtValsCalcReqPayload, CalcPayloadResType, OrchardParentTreeValsType } from '../../../types/PtCalcTypes';
import { GeoInfoValType } from '../../../views/Seedlot/SeedlotReview/definitions';

import {
  getConeCountErrMsg, getNonOrchardContamErrMsg, getPollenCountErrMsg,
  getSmpSuccErrMsg, getVolumeErrMsg, isConeCountInvalid,
  isNonOrchardContamInvalid, isPollenCountInvalid,
  isPtNumberInvalid, isSmpSuccInvalid, isVolumeInvalid,
  populateRowData, getPTNumberErrMsg
} from './TableComponents/utils';
import { OrchardObj } from '../OrchardStep/definitions';

import {
  RowItem, InfoSectionConfigType, RowDataDictType,
  HeaderObj, TabTypes, CompUploadResponse, GeneticWorthDictType,
  MixUploadResponse, HeaderObjId, StrTypeRowItem, MeanGeomInfoSectionConfigType
} from './definitions';
import {
  DEFAULT_MIX_PAGE_ROWS, EMPTY_NUMBER_STRING, rowTemplate,
  MAX_NE_DECIMAL, INVALID_NE_DECIMAL_MSG, MIN_NE, MAX_NE, INVALID_NE_RANGE_MSG
} from './constants';

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

export const calcAverage = (tableRows: Array<RowItem>, field: keyof StrTypeRowItem): string => {
  let sum = 0;
  let total = tableRows.length;
  tableRows.forEach((row) => {
    // add if the value is not null
    if (row[field].value) {
      sum += Number(row[field].value);
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

export const calcSum = (tableRows: Array<RowItem>, field: keyof StrTypeRowItem): string => {
  let sum = new BigNumber('0');

  tableRows.forEach((row) => {
    // add if the value is not null
    if (row[field].value) {
      sum = sum.plus(row[field].value);
    }
  });

  return sum.toString();
};

/**
 * Calculate the total number of parent tress that contributes to a seedlot.
 */
const calcTotalContribParentTrees = (tableRows: RowItem[]): string => {
  let total = 0;

  tableRows.forEach((row) => {
    if (Number(row.coneCount.value) > 0 || Number(row.pollenCount.value) > 0) {
      total += 1;
    }
  });

  return String(total);
};

export const calcSummaryItems = (
  setSummaryConfig: Function,
  summaryConfig: Record<string, any>,
  tableRows: RowItem[]
) => {
  const modifiedSummaryConfig = { ...summaryConfig };

  // Calc Total Number of Parent Trees
  modifiedSummaryConfig.sharedItems
    .totalParentTree.value = calcTotalContribParentTrees(tableRows);

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
};

export const getOutsideParentTreeNum = (state: ParentTreeStepDataObj): string => {
  let sum = 0;
  const insidePtNums = Object.keys(state.tableRowData);
  const ptNumsInMixTab: string[] = [];
  Object.values(state.mixTabData).forEach((row) => {
    if (
      row.parentTreeNumber?.value.length
      && !row.parentTreeNumber.isInvalid
    ) {
      ptNumsInMixTab.push(row.parentTreeNumber.value);
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
  popSizeAndDiversityConfig: InfoSectionConfigType,
  setPopSizeAndDiversityConfig: React.Dispatch<React.SetStateAction<InfoSectionConfigType>>,
  state: ParentTreeStepDataObj
) => {
  if (!disableOptions) {
    const modifiedSummaryConfig = { ...summaryConfig };
    const tableRows = Object.values(state.mixTabData);

    // Calc number of SMP parents from outside
    const numOfOutsidePt = getOutsideParentTreeNum(state);
    modifiedSummaryConfig.mixTab.infoItems.parentsOutside.value = numOfOutsidePt;
    setPopSizeAndDiversityConfig((prevPop) => ({
      ...prevPop,
      outsideSMPParent: {
        ...prevPop.outsideSMPParent,
        value: numOfOutsidePt
      }
    }));

    // Total volume (ml)
    modifiedSummaryConfig.mixTab.infoItems.totalVolume.value = calcSum(tableRows, 'volume');

    setSummaryConfig(modifiedSummaryConfig);

    // Calculate the sum of each weighted gw value
    const modifiedWeightedGwInfoItems = { ...weightedGwInfoItems };
    applicableGenWorths.forEach((gw) => {
      const weightedId = `w_${gw}` as keyof StrTypeRowItem;
      const sumWeighted = calcSum(tableRows, weightedId);
      modifiedWeightedGwInfoItems[(gw as keyof StrTypeRowItem)]
        .value = Number(sumWeighted).toFixed(3);
    });
    setWeightedGwInfoItems(modifiedWeightedGwInfoItems);
  }
};

export const populateStrInputId = (idPrefix: string, row: RowItem): RowItem => {
  const newRow = structuredClone(row);
  Object.keys(newRow).forEach((key) => {
    const rowKey = key as keyof RowItem;
    if (rowKey !== 'isMixTab' && rowKey !== 'rowId') {
      newRow[rowKey].id = `${idPrefix}-${rowKey}-value`;
    }
  });

  return newRow;
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
  const allParentTreeData = {};
  let tableRowData: RowDataDictType = structuredClone(state.tableRowData);

  data.forEach((parentTree) => {
    Object.assign(allParentTreeData, { [parentTree.parentTreeNumber]: parentTree });
    if (
      !Object.prototype.hasOwnProperty.call(tableRowData, parentTree.parentTreeNumber)
      && orchardIds.includes(parentTree.orchardId)
    ) {
      const newRowData: RowItem = structuredClone(rowTemplate);
      newRowData.parentTreeNumber.value = parentTree.parentTreeNumber;
      // Assign genetic worth values
      parentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
        const genWorthName = singleGenWorthObj.geneticWorthCode
          .toLowerCase() as keyof StrTypeRowItem;

        if (Object.prototype.hasOwnProperty.call(newRowData, genWorthName)) {
          newRowData[genWorthName].value = String(singleGenWorthObj.geneticQualityValue);
        }
      });
      tableRowData = Object.assign(tableRowData, {
        [parentTree.parentTreeNumber]: populateStrInputId(parentTree.parentTreeNumber, newRowData)
      });
    }
  });

  modifiedState.tableRowData = tableRowData;
  modifiedState.allParentTreeData = allParentTreeData;

  sliceTableRowData(
    Object.values(tableRowData),
    currentPage,
    currPageSize,
    false,
    'parentTreeNumber',
    setSlicedRows
  );

  // Only set data if tableRowData is not empty, otherwise a inf loop will occur.
  setStepData('parentTreeStep', modifiedState);
};

/**
 * Determines if selected orchards contains a least one parent tree.
 */
export const hasParentTreesForSelectedOrchards = (
  orchardIds: (string | undefined)[],
  data: ParentTreeGeneticQualityType[]
): boolean => {
  const proceed = true;
  const stop = false;
  let hasParentTrees = false;

  // Loop through every parent tree data obj
  // and stop as soon as a tree is found with the matching orchard id.
  data.every((parentTree) => {
    if (orchardIds.includes(parentTree.orchardId)) {
      hasParentTrees = true;
      return stop;
    }
    return proceed;
  });

  return hasParentTrees;
};

export const getMixRowTemplate = (): RowItem => {
  const newRow = structuredClone(rowTemplate);
  newRow.isMixTab = true;
  newRow.rowId = '-1';
  return newRow;
};

/**
 * Generate x number of default rows to be used in the SMP mix tab
 */
export const generateDefaultRows = (numOfRows: number): RowDataDictType => {
  const generated = {};
  for (let i = 0; i < numOfRows; i += 1) {
    const newRow = getMixRowTemplate();
    const stringIndex = String(i);
    newRow.rowId = stringIndex;
    Object.assign(generated, { [stringIndex]: populateStrInputId(stringIndex, newRow) });
  }
  return generated;
};

export const cleanTable = (
  state: ParentTreeStepDataObj,
  headerConfig: HeaderObj[],
  currentTab: TabTypes,
  setStepData: Function
): ParentTreeStepDataObj => {
  const clonedState = structuredClone(state);
  if (currentTab === 'mixTab') {
    clonedState.mixTabData = generateDefaultRows(DEFAULT_MIX_PAGE_ROWS);
  } else {
    const fieldsToClean = headerConfig
      .filter((header) => header.editable && header.availableInTabs.includes(currentTab))
      .map((header) => header.id);
    const parentTreeNumbers = Object.keys(clonedState.tableRowData);
    parentTreeNumbers.forEach((parentTreeNumber) => {
      fieldsToClean.forEach((field) => {
        clonedState.tableRowData[parentTreeNumber][field as keyof StrTypeRowItem].value = '';
        clonedState.tableRowData[parentTreeNumber][field as keyof StrTypeRowItem].isInvalid = false;
      });
    });
  }
  setStepData('parentTreeStep', clonedState);
  return clonedState;
};

export const applyValueToAll = (
  field: keyof StrTypeRowItem,
  value: string,
  state: ParentTreeStepDataObj,
  setStepData: Function,
  seedlotSpecies: MultiOptionsObj
) => {
  const clonedState = structuredClone(state);
  const parentTreeNumbers = Object.keys(clonedState.tableRowData);
  const isInvalid = field === 'smpSuccessPerc' ? isSmpSuccInvalid(value, seedlotSpecies.code === 'PW') : isNonOrchardContamInvalid(value);
  const errMsg = field === 'smpSuccessPerc' ? getSmpSuccErrMsg(value) : getNonOrchardContamErrMsg(value);
  parentTreeNumbers.forEach((number) => {
    clonedState.tableRowData[number][field].value = value;
    clonedState.tableRowData[number][field].isInvalid = isInvalid;
    clonedState.tableRowData[number][field].errMsg = errMsg;
  });
  setStepData('parentTreeStep', clonedState);
};

export const fillCompostitionTables = (
  data: CompUploadResponse[],
  state: ParentTreeStepDataObj,
  headerConfig: HeaderObj[],
  currentTab: TabTypes,
  setStepData: Function,
  setInvalidPTNumbers: React.Dispatch<React.SetStateAction<string[]>>,
  seedlotSpecies: MultiOptionsObj
) => {
  // Store parent tree numbers that does not exist in the orchards
  const invalidParentTreeNumbers: Array<string> = [];

  // Clean the table first
  const clonedState = cleanTable(state, headerConfig, currentTab, setStepData);

  data.forEach((row: CompUploadResponse) => {
    const parentTreeNumber = String(row.parentTreeNumber);
    // If the clone nubmer exist from user file then fill in the values
    if (Object.prototype.hasOwnProperty.call(clonedState.tableRowData, parentTreeNumber)) {
      // Cone count
      const coneCountValue = String(row.coneCount);
      let isInvalid = isConeCountInvalid(coneCountValue);
      clonedState.tableRowData[parentTreeNumber].coneCount.value = coneCountValue;
      clonedState.tableRowData[parentTreeNumber].coneCount.isInvalid = isInvalid;
      clonedState.tableRowData[parentTreeNumber].coneCount
        .errMsg = isInvalid ? getConeCountErrMsg() : '';

      // Pollen count
      const pollenCountValue = String(row.pollenCount);
      isInvalid = isPollenCountInvalid(pollenCountValue);
      clonedState.tableRowData[parentTreeNumber].pollenCount.value = pollenCountValue;
      clonedState.tableRowData[parentTreeNumber].pollenCount.isInvalid = isInvalid;
      clonedState.tableRowData[parentTreeNumber].pollenCount
        .errMsg = isInvalid ? getPollenCountErrMsg() : '';

      // SMP Success percentage
      const smpSuccessValue = String(row.smpSuccess);
      isInvalid = isSmpSuccInvalid(smpSuccessValue, seedlotSpecies.code === 'PW');
      clonedState.tableRowData[parentTreeNumber].smpSuccessPerc.value = smpSuccessValue;
      clonedState.tableRowData[parentTreeNumber].smpSuccessPerc.isInvalid = isInvalid;
      clonedState.tableRowData[parentTreeNumber].smpSuccessPerc
        .errMsg = isInvalid ? getSmpSuccErrMsg(smpSuccessValue) : '';

      // Non orchard pollen contamination percentage
      const nonOrchardContamValue = String(row.pollenContamination);
      isInvalid = isNonOrchardContamInvalid(nonOrchardContamValue);
      clonedState.tableRowData[parentTreeNumber].nonOrchardPollenContam
        .value = nonOrchardContamValue;
      clonedState.tableRowData[parentTreeNumber].nonOrchardPollenContam.isInvalid = isInvalid;
      clonedState.tableRowData[parentTreeNumber].nonOrchardPollenContam
        .errMsg = isInvalid ? getNonOrchardContamErrMsg(nonOrchardContamValue) : '';
    } else {
      invalidParentTreeNumbers.push(parentTreeNumber);
    }
  });

  setStepData('parentTreeStep', clonedState);

  setInvalidPTNumbers(invalidParentTreeNumbers.sort((a, b) => Number(a) - Number(b)));
};

export const toggleNotification = (
  notifType: string,
  state: ParentTreeStepDataObj,
  currentTab: TabTypes,
  setStepData: Function
) => {
  const modifiedState = { ...state };
  if (notifType === 'info') {
    modifiedState.notifCtrl[currentTab].showInfo = false;
  }
  if (notifType === 'error') {
    modifiedState.notifCtrl[currentTab].showError = false;
  }
  setStepData('parentTreeStep', modifiedState);
};

export const toggleColumn = (
  colName: HeaderObjId,
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
  setApplicableGenWorths: Function,
  isReview: boolean
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

      // When on review mode, display all columns
      if (isReview) {
        clonedHeaders[optionIndex].enabled = true;
      }

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

export const fillCalculatedInfo = (
  data: CalcPayloadResType,
  genWorthInfoItems: Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: Function,
  popSizeAndDiversityConfig: Record<string, any>,
  setPopSizeAndDiversityConfig: Function,
  setMeanGeomInfos: React.Dispatch<React.SetStateAction<MeanGeomInfoSectionConfigType>>,
  setIsCalculatingPt: Function,
  setGeoInfoVals: React.Dispatch<React.SetStateAction<GeoInfoValType>>,
  setGenWorthVal: Function,
  isReview?: boolean
) => {
  const tempGenWorthItems = structuredClone(genWorthInfoItems);
  const gwCodesToFill = recordKeys(tempGenWorthItems);
  const { geneticTraits, calculatedPtVals, smpMixMeanGeoData }: CalcPayloadResType = data;
  // Fill in calculated gw values and percentage
  gwCodesToFill.forEach((gwCode) => {
    const upperCaseCode = String(gwCode).toUpperCase();
    const traitIndex = geneticTraits.map((trait) => trait.traitCode).indexOf(upperCaseCode);
    if (traitIndex > -1) {
      const tuple = tempGenWorthItems[gwCode];
      const traitValueInfoObj = tuple.filter((obj) => obj.name.startsWith('Genetic'))[0];
      if (geneticTraits[traitIndex].calculatedValue) {
        traitValueInfoObj.value = (Number(geneticTraits[traitIndex].calculatedValue)).toFixed(1);
        if (isReview) {
          setGenWorthVal(gwCode, geneticTraits[traitIndex].calculatedValue);
        }
      } else {
        traitValueInfoObj.value = EMPTY_NUMBER_STRING;
      }
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
  newPopAndDiversityConfig.ne.value = calculatedPtVals.neValue ? calculatedPtVals.neValue.toFixed(1) : '';
  setPopSizeAndDiversityConfig(newPopAndDiversityConfig);

  // Fill in mean geom data
  const seedlotMeanGeom = calculatedPtVals.geospatialData;
  setMeanGeomInfos((prevGeomInfo) => ({
    seedlot: {
      meanLatitudeDm: {
        ...prevGeomInfo.seedlot.meanLatitudeDm,
        value: `${seedlotMeanGeom.meanLatitudeDegree}° ${seedlotMeanGeom.meanLatitudeMinute}'`
      },
      meanLongitudeDm: {
        ...prevGeomInfo.seedlot.meanLongitudeDm,
        value: `${seedlotMeanGeom.meanLongitudeDegree}° ${seedlotMeanGeom.meanLongitudeMinute}'`
      },
      meanElevation: {
        ...prevGeomInfo.seedlot.meanElevation,
        value: `${seedlotMeanGeom.meanElevation} m`
      }
    },
    smpMix: {
      meanLatitudeDm: {
        ...prevGeomInfo.smpMix.meanLatitudeDm,
        value: `${smpMixMeanGeoData.meanLatitudeDegree}° ${smpMixMeanGeoData.meanLatitudeMinute}'`
      },
      meanLongitudeDm: {
        ...prevGeomInfo.smpMix.meanLongitudeDm,
        value: `${smpMixMeanGeoData.meanLongitudeDegree}° ${smpMixMeanGeoData.meanLongitudeMinute}'`
      },
      meanElevation: {
        ...prevGeomInfo.smpMix.meanElevation,
        value: `${smpMixMeanGeoData.meanElevation} m`
      }
    }
  }));

  if (isReview) {
    setGeoInfoVals((prevGeo) => ({
      ...prevGeo,
      meanElevation: {
        ...prevGeo.meanElevation,
        value: String(seedlotMeanGeom.meanElevation)
      },
      meanLatDeg: {
        ...prevGeo.meanLatDeg,
        value: String(seedlotMeanGeom.meanLatitudeDegree)
      },
      meanLatMinute: {
        ...prevGeo.meanLatMinute,
        value: String(seedlotMeanGeom.meanLatitudeMinute)
      },
      meanLatSec: {
        ...prevGeo.meanLatSec,
        value: String(seedlotMeanGeom.meanLatitudeSecond)
      },
      meanLongDeg: {
        ...prevGeo.meanLongDeg,
        value: String(seedlotMeanGeom.meanLongitudeDegree)
      },
      meanLongMinute: {
        ...prevGeo.meanLongMinute,
        value: String(seedlotMeanGeom.meanLongitudeMinute)
      },
      meanLongSec: {
        ...prevGeo.meanLongSec,
        value: String(seedlotMeanGeom.meanLongitudeSecond)
      },
      effectivePopSize: {
        ...prevGeo.effectivePopSize,
        value: String(calculatedPtVals.neValue)
      }
    }));
  }

  setIsCalculatingPt(false);
};

const findParentTreeId = (state: ParentTreeStepDataObj, ptNumber: string): number => {
  const found = Object.values(state.allParentTreeData)
    .find((pt) => pt.parentTreeNumber === ptNumber);

  if (!found) {
    throw Error(`Cannot find parent tree id with parent tree number: ${ptNumber}`);
  }
  return found.parentTreeId;
};

export const generatePtValCalcPayload = (
  state: ParentTreeStepDataObj,
  geneticWorthDict: GeneticWorthDictType,
  seedlotSpecies: MultiOptionsObj
): PtValsCalcReqPayload => {
  const { tableRowData, mixTabData } = state;
  const payload: PtValsCalcReqPayload = {
    orchardPtVals: [],
    smpMixIdAndProps: []
  };
  const rows = Object.values(tableRowData);
  const genWorthTypes = geneticWorthDict[seedlotSpecies.code];
  rows.forEach((row) => {
    const newPayloadItem: OrchardParentTreeValsType = {
      parentTreeId: findParentTreeId(state, row.parentTreeNumber.value),
      parentTreeNumber: row.parentTreeNumber.value,
      coneCount: Number(row.coneCount.value),
      pollenCount: Number(row.pollenCount.value),
      smpSuccessPerc: Number(row.smpSuccessPerc.value),
      geneticTraits: []
    };
    // Populate geneticTraits array
    genWorthTypes.forEach((gwType) => {
      newPayloadItem.geneticTraits.push({
        traitCode: gwType,
        traitValue: Number(row[gwType as keyof StrTypeRowItem].value)
      });
    });
    payload.orchardPtVals.push(newPayloadItem);
  });

  const smpMixRows = Object.values(mixTabData);
  smpMixRows.forEach((row) => {
    if (row.parentTreeNumber.value) {
      payload.smpMixIdAndProps.push({
        parentTreeId: findParentTreeId(state, row.parentTreeNumber.value),
        proportion: Number(row.proportion.value)
      });
    }
  });

  return payload;
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
  const newRowId = String(maxRowId + 1);
  newRow.rowId = newRowId;
  Object.assign(mixTableData, { [newRowId]: populateStrInputId(newRowId, newRow) });
  clonedState.mixTabData = mixTableData;
  setStepData('parentTreeStep', clonedState);
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
      if (row.rowId) {
        const { rowId, volume } = row;
        const proportion = (Number(volume.value) / sum).toFixed(3);
        clonedTable[rowId].proportion.value = proportion;
        // Update relavent weighted gw
        applicableGenWorths.forEach((gw) => {
          const gwColName = gw as keyof StrTypeRowItem;
          const weightedColName = `w_${gw}` as keyof StrTypeRowItem;
          clonedTable[rowId][weightedColName]
            .value = (Number(clonedTable[rowId][gwColName].value) * Number(proportion))
              .toFixed(3);
        });
      }
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
    newRow.rowId = String(index);
    newRow.parentTreeNumber.value = ptNumber;
    newRow.volume.value = String(row.pollenVolume);
    newRow.volume.isInvalid = isVolumeInvalid(newRow.volume.value);
    newRow.volume.errMsg = newRow.volume.isInvalid ? getVolumeErrMsg(newRow.volume.value) : '';

    // Validate pt number
    const isPtInvalid = isPtNumberInvalid(ptNumber, state.allParentTreeData);
    newRow.parentTreeNumber.isInvalid = isPtInvalid;
    newRow.parentTreeNumber.errMsg = isPtInvalid ? getPTNumberErrMsg(ptNumber) : '';
    // Populate data such as gw value
    if (!isPtInvalid) {
      newRow = populateRowData(newRow, ptNumber, state);
    }

    Object.assign(newRows, { [newRow.rowId]: populateStrInputId(newRow.rowId, newRow) });
  });

  newRows = updateCalculations(newRows, applicableGenWorths);
  clonedState.mixTabData = newRows;
  setStepData('parentTreeStep', clonedState);
};

/**
 * Validate whether the NE value has the correct number of decimal place and is within range.
 */
export const validateEffectivePopSize = (inputObj: StringInputType): StringInputType => {
  const validatedObj = inputObj;

  const isOverDecimal = !validator.isDecimal(validatedObj.value, { decimal_digits: `0,${MAX_NE_DECIMAL}` });
  validatedObj.isInvalid = isOverDecimal;

  if (isOverDecimal) {
    validatedObj.errMsg = INVALID_NE_DECIMAL_MSG;
    return validatedObj;
  }

  const isOutOfRange = !isFloatWithinRange(validatedObj.value, MIN_NE, MAX_NE);

  validatedObj.isInvalid = isOutOfRange;

  if (isOutOfRange) {
    validatedObj.errMsg = INVALID_NE_RANGE_MSG;
    return validatedObj;
  }

  validatedObj.errMsg = undefined;

  return validatedObj;
};
