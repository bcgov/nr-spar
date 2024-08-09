import React from 'react';
import { StringInputType } from '../../../types/FormInputType';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/ContextContainerClassA/definitions';
import { GeneticWorthDto } from '../../../types/GeneticWorthType';

export type TabTypes = 'coneTab' | 'successTab' | 'mixTab';

type EstimatedGwType = { isEstimated: boolean };

export type GeneticWorthInputType = StringInputType & EstimatedGwType;

export type StrTypeRowItem = {
  parentTreeNumber: StringInputType,
  coneCount: StringInputType,
  pollenCount: StringInputType,
  smpSuccessPerc: StringInputType,
  nonOrchardPollenContam: StringInputType,
  volume: StringInputType,
  proportion: StringInputType,
  ad: GeneticWorthInputType,
  dfs: GeneticWorthInputType,
  dfu: GeneticWorthInputType,
  dfw: GeneticWorthInputType,
  dsb: GeneticWorthInputType,
  dsc: GeneticWorthInputType,
  gvo: GeneticWorthInputType,
  wdu: GeneticWorthInputType,
  wwd: GeneticWorthInputType,
  dsg: GeneticWorthInputType,
  iws: GeneticWorthInputType,
  wve: GeneticWorthInputType,
  w_ad: GeneticWorthInputType,
  w_dfs: GeneticWorthInputType,
  w_dfu: GeneticWorthInputType,
  w_dfw: GeneticWorthInputType,
  w_dsb: GeneticWorthInputType,
  w_dsc: GeneticWorthInputType,
  w_gvo: GeneticWorthInputType,
  w_wdu: GeneticWorthInputType,
  w_wwd: GeneticWorthInputType,
  w_dsg: GeneticWorthInputType,
  w_iws: GeneticWorthInputType,
  w_wve: GeneticWorthInputType
}

export type PrimitiveRowItem = {
  rowId: string
  isMixTab: boolean
}

export type RowItem = PrimitiveRowItem & StrTypeRowItem;

export type HeaderObjId = keyof RowItem | 'actions';

/**
 * id: referencing the property's name
 * name: displayed header name
 * description: used for tooltip
 * isAnoption: true if the option belongs to this species
 * enabled: whether to display in header row, can be toggled by user
 * availableInTabs: this header item can be seen in one or more of these tabs
 */
export type HeaderObj = {
  id: HeaderObjId,
  name: string,
  description: string,
  enabled: boolean,
  isAnOption: boolean,
  editable: boolean,
  availableInTabs: ['coneTab'?, 'successTab'?, 'mixTab'?]
};

export type RowDataDictType = {
  [key: string]: RowItem
}

export type NotifCtrlType = {
  [key: string]: {
    showInfo: boolean,
    showError: boolean
  }
}

type SpeciesWithGenWorth = 'CW'| 'PLI' |'FDC' | 'PW' | 'DR' | 'EP' | 'FDI' | 'HW' | 'LW' | 'PY' | 'SS' | 'SX' | 'UNKNOWN';

export type GeneticWorthDictType = {
  [key in SpeciesWithGenWorth]: string[]
}

export type InfoSectionConfigType = {
  [key: string]: InfoDisplayObj;
};

export type FileConfigType = {
  file: File | null,
  fileName: string,
  fileAdded: boolean,
  uploaderStatus: string,
  errorSub: string,
  errorMessage: string,
  invalidFile: boolean
};

export type CompUploadResponse = {
  parentTreeNumber: number,
  coneCount: number,
  pollenCount: number,
  smpSuccess: number,
  pollenContamination: number
}

export type MixUploadResponse = {
  parentTreeNumber: number,
  pollenVolume: number
}

export type InputErrorNotifProps = {
  state: ParentTreeStepDataObj;
  headerConfig: HeaderObj[];
}

export type UploadWarnNotifProps = {
  invalidPTNumbers: string[],
  setInvalidPTNumbers: React.Dispatch<React.SetStateAction<string[]>>
}

export type EditableCellProps = {
  rowData: RowItem,
  header: HeaderObj,
  applicableGenWorths: string[],
  readOnly: boolean,
  geneticWorthList: GeneticWorthDto[]
};

export type MeanGeomInfoSectionConfigType = {
  seedlot: {
    meanLatitudeDm: InfoDisplayObj,
    meanLongitudeDm: InfoDisplayObj,
    meanElevation: InfoDisplayObj
  },
  smpMix: {
    meanLatitudeDm: InfoDisplayObj,
    meanLongitudeDm: InfoDisplayObj,
    meanElevation: InfoDisplayObj
  }
}
