export enum GenWorthCodeEnum {
  AD = 'ad',
  DFS = 'dfs',
  DFU = 'dfu',
  DFW = 'dfw',
  DSB = 'dsb',
  DSC = 'dsc',
  DSG = 'dsg',
  GVO = 'gvo',
  IWS = 'iws',
  WDU = 'wdu',
  WWD = 'wwd'
}

export type SingleParentTreeGeneticObj = {
  geneticTypeCode: 'BV' | 'CV';
  geneticWorthCode: keyof typeof GenWorthCodeEnum;
  geneticQualityValue: number | null;
};
