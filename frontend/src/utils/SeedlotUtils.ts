import { DateTime as luxon } from 'luxon';

import { SeedlotApplicantType, SeedlotDisplayType, SeedlotType } from '../types/SeedlotType';
import { MONTH_DAY_YEAR } from '../config/DateFormat';
import { ForestClientType } from '../types/ForestClientType';
import MultiOptionsObj from '../types/MultiOptionsObject';

/**
 * Generate a species label in the form of `{code} - {description}`.
 */
const getSpeciesNameByCode = (code: string, vegCodeData: MultiOptionsObj[]): string => {
  const filtered = vegCodeData.filter((veg) => veg.code === code);
  if (filtered.length) {
    return filtered[0].description;
  }
  return code;
};

/**
 * Covert the raw seedlot data into an object to be displayed on seedlot detail page.
 */
export const covertRawToDisplayObj = (seedlot: SeedlotType, vegCodeData: MultiOptionsObj[]) => ({
  seedlotNumber: seedlot.id,
  seedlotClass: `${seedlot.geneticClass.geneticClassCode}-class`,
  seedlotSpecies: getSpeciesNameByCode(seedlot.vegetationCode, vegCodeData),
  seedlotStatus: seedlot.seedlotStatus.description,
  createdAt: luxon.fromISO(seedlot.auditInformation.entryTimestamp).toFormat(MONTH_DAY_YEAR),
  lastUpdatedAt: luxon.fromISO(seedlot.auditInformation.updateTimestamp)
    .toFormat(MONTH_DAY_YEAR),
  approvedAt: seedlot.seedlotStatus.seedlotStatusCode === 'APP'
    ? luxon.fromISO(seedlot.seedlotStatus.updateTimestamp).toFormat(MONTH_DAY_YEAR)
    : '--'
});

/**
 * Covert the raw seedlot data into an array of objects to be displayed in tables.
 */
export const covertRawToDisplayObjArray = (
  seedlots: SeedlotType[],
  vegCodeData: MultiOptionsObj[]
): SeedlotDisplayType[] => {
  const converted: SeedlotDisplayType[] = [];

  seedlots.forEach((seedlot) => {
    converted.push(covertRawToDisplayObj(seedlot, vegCodeData));
  });

  // Show most recently updated first
  converted.sort((a, b) => {
    if (luxon.fromFormat(a.lastUpdatedAt, MONTH_DAY_YEAR)
      < luxon.fromFormat(b.lastUpdatedAt, MONTH_DAY_YEAR)) {
      return 1;
    }
    if (luxon.fromFormat(a.lastUpdatedAt, MONTH_DAY_YEAR)
      > luxon.fromFormat(b.lastUpdatedAt, MONTH_DAY_YEAR)) {
      return -1;
    }
    return 0;
  });

  return converted;
};

export const convertToApplicantInfoObj = (
  seedlot: SeedlotType,
  vegCodeData: MultiOptionsObj[],
  forestClient: ForestClientType
): SeedlotApplicantType => ({
  agency: `${forestClient.clientNumber} - ${forestClient.clientName} - ${forestClient.acronym}`,
  locationCode: seedlot.applicantLocationCode,
  email: seedlot.applicantEmailAddress,
  species: getSpeciesNameByCode(seedlot.vegetationCode, vegCodeData),
  source: seedlot.seedlotSource.description,
  willRegister: seedlot.intendedForCrownLand,
  isBcSource: seedlot.sourceInBc
});
