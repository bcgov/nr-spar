import InfoDisplayObj from '../../../types/InfoDisplayObj';

export type TabTypes = {
  coneTab: 'coneTab',
  successTab: 'successTab',
  mixTab: 'mixTab'
};

export type RowItem = {
  [key: string]: any,
  parentTreeNumber: string,
  coneCount: string | null,
  pollenCount: string | null,
  smpSuccessPerc: string | null,
  ad: string | null,
  dfs: string | null,
  dfu: string | null,
  dfw: string | null,
  dsb: string | null,
  dsc: string | null,
  gvo: string | null,
  wdu: string | null,
  wwd: string | null,
  dsg: string | null,
  iws: string | null,
  nonOrchardPollenContam: string | null,
  meanDegLat: string | null,
  meanMinLat: string | null,
  meanDegLong: string | null,
  meanMinLong: string | null,
  meanElevation: string | null,
  volume: string | null,
  proportion: string | null
  isMixTab: boolean
};

/**
 * id: referencing the property's name
 * name: displayed header name
 * description: used for tooltip
 * isAnoption: true if the option belongs to this species
 * enabled: whether to display in header row, can be toggled by user
 * availableInTabs: this header item can be seen in one or more of these tabs
 */
export type HeaderObj = {
  id: keyof RowItem,
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
