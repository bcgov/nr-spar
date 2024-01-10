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
  geneticTypeCode: string;
  geneticWorthCode: keyof typeof GenWorthCodeEnum;
  geneticQualityValue: number;
};

export type ParentTreeGeneticQualityType = {
  [key: string]: any;
  parentTreeId: number;
  parentTreeNumber: string;
  orchardId: string;
  spu: number;
  parentTreeGeneticQualities: Array<SingleParentTreeGeneticObj>;
}
