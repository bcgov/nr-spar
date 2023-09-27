type GeneticTrait = {
  traitCode: string,
  traitValue?: number,
  // The fields below are used for data returned from API
  calculatedValue?: number,
  testedParentTreePerc?: number
}

export type CalcPayloadResType = {
  geneticTraits: GeneticTrait[],
  neValue: number
};

export type GenWorthCalcPayload = {
  parentTreeNumber: string,
  coneCount: number,
  pollenCount: number,
  geneticTraits: GeneticTrait[]
}
