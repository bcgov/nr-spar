export type GermTrayCreateResponseType = {
  activityTypeCd: string;
  germinatorTrayId: number;
  actualStartDate: string;
};

export type GerminatorIdAssignResponseDto = {
  germinatorTrayId: number;
  germinatorId: string | null;
};

export type GermTrayTestType = {
  germinatorTrayId: number;
  requestId: string;
  seedlotNumber: string;
  warmStratStartDate: string | null;
  drybackStartDate: string | null;
  germinatorEntry: string | null;
  stratStartDate: string | null;
  testCompleteInd: -1 | 0;
  acceptResultInd: -1 | 0;
  riaSkey: number | null;
  updateTimestamp: string | null;
};

export type GermTrayDeleteContentType = {
  riaSkey: number;
  updateTimestamp: string;
};
