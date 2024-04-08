type GeneticTrait = {
  traitCode: string,
  traitValue?: number,
  // The fields below are used for data returned from API
  calculatedValue?: number,
  testedParentTreePerc?: number
}

export type CalcPayloadResType = {
  geneticTraits: GeneticTrait[],
  calculatedPtVals: {
    neValue: number | null,
    meanLatitudeDegree: number | null,
    meanLatitudeMinute: number | null,
    meanLatitudeSecond: number | null,
    meanLongitudeDegree: number | null,
    meanLongitudeMinute: number | null,
    meanLongitudeSecond: number | null,
    meanLatitude: number | null,
    meanLongitude: number | null,
    meanElevation: number | null
  }
};

export type GenWorthCalcPayload = {
  parentTreeId: number,
  parentTreeNumber: string,
  coneCount: number,
  pollenCount: number,
  geneticTraits: GeneticTrait[]
}
