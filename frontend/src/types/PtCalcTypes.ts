export type GeneticTrait = {
  traitCode: string;
  traitValue?: number;
  // The fields below are used for data returned from API
  calculatedValue?: number;
  testedParentTreePerc?: number;
};

export type MeanGeomDataType = {
  meanLatitudeDegree: number;
  meanLatitudeMinute: number | null;
  meanLatitudeSecond: number | null;
  meanLongitudeDegree: number;
  meanLongitudeMinute: number | null;
  meanLongitudeSecond: number | null;
  meanLatitude: number | null;
  meanLongitude: number | null;
  meanElevation: number | null;
};

export type CalcPayloadResType = {
  geneticTraits: GeneticTrait[];
  calculatedPtVals: {
    neValue: number | null;
    geospatialData: MeanGeomDataType;
  };
  smpMixMeanGeoData: MeanGeomDataType;
};

export type OrchardParentTreeValsType = {
  parentTreeId: number;
  parentTreeNumber: string;
  smpSuccessPerc: number;
  nonOrchardPollenContamPct: number;
  coneCount: number;
  pollenCount: number;
  geneticTraits: GeneticTrait[];
};

export type GeospatialRequestDto = {
  parentTreeId: number;
  proportion: number;
};

export type PtValsCalcReqPayload = {
  orchardPtVals: OrchardParentTreeValsType[];
  smpMixIdAndProps: GeospatialRequestDto[];
  smpParentsOutside: number;
  contaminantPollenBv: number;
  smpBv: Record<string, number>;
};
