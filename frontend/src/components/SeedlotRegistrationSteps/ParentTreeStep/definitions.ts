export type TabTypes = {
  coneTab: 'coneTab',
  successTab: 'successTab',
  mixTab: 'mixTab'
};

export type RowItem = {
  clone_number: number,
  cone_count: number,
  pollen_count: number,
  smp_success_perc: number,
  ad: number,
  dfs: number,
  dfu: number,
  dfw: number,
  dsb: number,
  dsc: number,
  gvo: number,
  wdu: number,
  wwd: number,
  dsg: number,
  iws: number,
  non_orchard_pollen_contam: number,
  mean_deg_lat: number,
  mean_min_lat: number,
  mean_deg_long: number,
  mean_min_long: number,
  mean_elevation: number,
  volume: number,
  proportion: number
};

/**
 * id: self-referencing the property's name
 * name: displayed header name
 * description: used for tooltip
 * isAnoption: true if the option belongs to this species
 * enabled: whether to display in header row, can be toggled by user
 * availableInTabs: this header item can be seen in one or more of these tabs
 */
type HeaderObj = {
  id: keyof RowItem,
  name: string,
  description: string,
  enabled: boolean,
  isAnOption: boolean,
  availableInTabs: ['coneTab'?, 'successTab'?, 'mixTab'?]
};

export type HeaderConfigObj = {
  [Property in keyof RowItem]: HeaderObj
};
