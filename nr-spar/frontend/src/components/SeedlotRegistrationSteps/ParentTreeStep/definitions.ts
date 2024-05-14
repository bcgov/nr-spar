import React from 'react';
import { StringInputType } from '../../../types/FormInputType';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { ParentTreeGeneticQualityType } from '../../../types/ParentTreeGeneticQualityType';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/ContextContainerClassA/definitions';

export type TabTypes = 'coneTab' | 'successTab' | 'mixTab';

export type StrTypeRowItem = {
  parentTreeNumber: StringInputType,
  coneCount: StringInputType,
  pollenCount: StringInputType,
  smpSuccessPerc: StringInputType,
  nonOrchardPollenContam: StringInputType,
  volume: StringInputType,
  proportion: StringInputType,
  ad: StringInputType,
  dfs: StringInputType,
  dfu: StringInputType,
  dfw: StringInputType,
  dsb: StringInputType,
  dsc: StringInputType,
  gvo: StringInputType,
  wdu: StringInputType,
  wwd: StringInputType,
  dsg: StringInputType,
  iws: StringInputType,
  w_ad: StringInputType,
  w_dfs: StringInputType,
  w_dfu: StringInputType,
  w_dfw: StringInputType,
  w_dsb: StringInputType,
  w_dsc: StringInputType,
  w_gvo: StringInputType,
  w_wdu: StringInputType,
  w_wwd: StringInputType,
  w_dsg: StringInputType,
  w_iws: StringInputType,
  meanDegLat: StringInputType,
  meanMinLat: StringInputType,
  meanDegLong: StringInputType,
  meanMinLong: StringInputType,
  meanElevation: StringInputType,
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

export type GeneticWorthDictType = {
  [key: string]: Array<string>
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

export type AllParentTreeMap = {
  [key: string]: ParentTreeGeneticQualityType
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
  state: ParentTreeStepDataObj,
  setStepData: Function,
  seedlotSpecies: MultiOptionsObj,
  readOnly: boolean
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
