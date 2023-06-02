export type TabTypes = {
  coneTab: 'coneTab',
  successTab: 'successTab',
  mixTab: 'mixTab'
};

export type RowItem = {
  [key: string]: any,
  cloneNumber: string,
  cloneCount: number | null,
  pollenCount: number | null,
  smpSuccessPerc: number | null,
  ad: number | null,
  dfs: number | null,
  dfu: number | null,
  dfw: number | null,
  dsb: number | null,
  dsc: number | null,
  gvo: number | null,
  wdu: number | null,
  wwd: number | null,
  dsg: number | null,
  iws: number | null,
  nonOrchardPollenContam: number | null,
  meanDegLat: number | null,
  meanMinLat: number | null,
  meanDegLong: number | null,
  meanMinLong: number | null,
  meanElevation: number | null,
  volume: number | null,
  proportion: number | null
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
