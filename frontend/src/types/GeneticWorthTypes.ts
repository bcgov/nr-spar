export type GeneticTrait = {
  traitCode: string,
  traitValue?: number,
  // The fields below are used for data returned from API
  calculatedValue?: number,
  testedParentTreePerc?: number
}

export type GenWorthCalcPayload = {
  parentTreeNumber: string,
  coneCount: number,
  pollenCount: number,
  geneticTraits: GeneticTrait[]
}
