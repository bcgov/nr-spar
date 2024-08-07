import { SingleParentTreeGeneticObj } from './ParentTreeGeneticQualityType';

export type ParentTreeByVegCodeDto = {
  parentTreeId: number,
  testedInd: boolean,
  orchardIds: string[],
  geneticQualitiesBySpu: {
    [spuId: number]: SingleParentTreeGeneticObj
  }
}

export type ParentTreeByVegCodeResType = {
  [parentTreeNumber: string]: ParentTreeByVegCodeDto
}
