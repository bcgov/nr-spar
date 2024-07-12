export type GeneticTrait = {
  traitCode: string,
  traitValue?: number,
  // The fields below are used for data returned from API
  calculatedValue?: number,
  testedParentTreePerc?: number
}

export type MeanGeomDataType = {
  meanLatitudeDegree: number,
  meanLatitudeMinute: number,
  meanLatitudeSecond: number,
  meanLongitudeDegree: number,
  meanLongitudeMinute: number,
  meanLongitudeSecond: number,
  meanLatitude: number,
  meanLongitude: number,
  meanElevation: number
};

export type CalcPayloadResType = {
  geneticTraits: GeneticTrait[],
  calculatedPtVals: {
    neValue: number | null,
    geospatialData: MeanGeomDataType
  },
  smpMixMeanGeoData: MeanGeomDataType
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
