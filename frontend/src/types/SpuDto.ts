export type SpuDto = {
  seedPlanUnitId: number,
  primaryInd: boolean,
  seedPlanZoneId: number,
  elevationBand: string | null,
  elevationMax: number | null,
  elevationMin: number | null,
  createDate: Date,
  latitudeBand: string | null,
  latitudeDegreesMin: number | null,
  latitudeMinutesMin: number | null,
  latitudeDegreesMax: number | null,
  latitudeMinutesMax: number | null,
  seedPlanZoneCode: string | null
};
