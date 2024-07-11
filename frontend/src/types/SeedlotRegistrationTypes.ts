import {
  BooleanInputType,
  OptionsInputType,
  StringInputType
} from './FormInputType';

/**
 * The form data obj used in seedlot creation.
 */
export type SeedlotRegFormType = {
  client: OptionsInputType;
  locationCode: StringInputType;
  email: StringInputType;
  species: OptionsInputType;
  sourceCode: StringInputType;
  willBeRegistered: BooleanInputType;
  isBcSource: BooleanInputType;
};

/**
 * The object that will be sent in a POST call.
 */
export type SeedlotRegPayloadType = {
  applicantClientNumber: string;
  applicantLocationCode: string;
  applicantEmailAddress: string;
  vegetationCode: string;
  seedlotSourceCode: string;
  toBeRegistrdInd: boolean;
  bcSourceInd: boolean;
  geneticClassCode: 'A' | 'B';
}

export type SeedlotPatchPayloadType = {
  applicantEmailAddress: string;
  seedlotSourceCode: string;
  toBeRegistrdInd: boolean;
  bcSourceInd: boolean;
  revisionCount: number | undefined;
}
