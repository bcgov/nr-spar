export enum GenWorthCodeEnum{
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

type SingleParentTreeGeneticObj = {
  geneticTypeCode: string;
  geneticWorthCode: keyof typeof GenWorthCodeEnum;
  geneticQualityValue: number;
};

type ParentTreeType = {
  [key: string]: any;
  parentTreeId: number;
  parentTreeNumber: string;
  parentTreeGeneticQualities: Array<SingleParentTreeGeneticObj>;
}

export type ParentTreeGeneticQualityType = {
  [key: string]: any;
  orchardId:string;
  vegetationCode: string;
  seedPlanningUnitId: number;
  parentTrees: Array<ParentTreeType>;
}
