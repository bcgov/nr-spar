export type GermTrayCreateResponseType = {
  activityTypeCd: string;
  germinatorTrayId: number;
  actualStartDate: string;
};

/** A tray as stored, from `GET /api/germinator-trays?ids=` or the tray search. */
export type GermTrayType = {
  germinatorTrayId: number;
  activityTypeCd: string;
  actualStartDate: string | null;
  dateCreated: string | null;
  revisionCount: number;
  systemTrayNo: number | null;
  germinatorId: string | null;
};

export type GerminatorIdAssignResponseDto = {
  germinatorTrayId: number;
  germinatorId: string | null;
  /** The tray's revision after the update; send it with the next change. */
  revisionCount: number;
};

export type GermTrayTestType = {
  germinatorTrayId: number;
  requestId: string;
  seedlotNumber: string;
  soakEndDate: string | null;
  warmStratStartDate: string | null;
  drybackStartDate: string | null;
  germinatorEntry: string | null;
  stratStartDate: string | null;
  testCompleteInd: -1 | 0;
  acceptResultInd: -1 | 0;
  vegetationSt: string | null;
  germinatorId: string | null;
  riaSkey: number | null;
  updateTimestamp: string | null;
};

export type GermTrayDeleteContentType = {
  riaSkey: number;
  updateTimestamp: string;
};
