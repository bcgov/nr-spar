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

export type OrchardParentTreeValsType = {
  parentTreeId: number,
  parentTreeNumber: string,
  smpSuccessPerc: number,
  coneCount: number,
  pollenCount: number,
  geneticTraits: GeneticTrait[]
}

export type GeospatialRequestDto = {
  parentTreeId: number,
  proportion: number
}

export type PtValsCalcReqPayload = {
  orchardPtVals: OrchardParentTreeValsType[],
  smpMixIdAndProps: GeospatialRequestDto[]
}
