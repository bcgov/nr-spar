/** GET /api/dryback/{riaSkey}: the G64 Dryback Calculation screen data. */
export type DrybackScreenType = {
  riaSkey: number;
  requestId?: string;
  itemId?: string;
  seedlotNumber?: string;
  familyLotNumber?: string;
  activityTypeCode?: string;
  actualBeginDateTime?: string | null; // 'YYYY-MM-DDTHH:mm:ss'
  actualEndDateTime?: string | null;
  dryWeight?: number | null;
  imbibedWeight?: number | null;
  drybackWeight?: number | null;
  drybackMoist?: number | null;
  drybackTime?: number | null;
  targetThirtyMoist?: number | null;
  targetThirtyFiveMoist?: number | null;
  stratEndWeight?: number | null;
  // The seedlot's current accepted MC test result; null when there is none.
  storageMc?: number | null;
  riaComment?: string | null;
  updateTimestamp: string;
};

/** PUT /api/dryback/{riaSkey}: replaces the whole record, a null clears a field. */
export type DrybackSavePayload = {
  actualBeginDateTime: string | null;
  actualEndDateTime: string | null;
  drybackMoist: number | null;
  imbibedWeight: number | null;
  drybackWeight: number | null;
  dryWeight: number | null;
  drybackTime: number | null;
  targetThirtyMoist: number | null;
  targetThirtyFiveMoist: number | null;
  stratEndWeight: number | null;
  riaComment: string | null;
};
