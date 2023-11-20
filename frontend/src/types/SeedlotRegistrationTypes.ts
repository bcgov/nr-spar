import { FormInputType } from './FormInputType';
import MultiOptionsObj from './MultiOptionsObject';

/**
 * The form data obj used in seedlot creation.
 */
export type SeedlotRegFormType = {
  client: FormInputType & { value: MultiOptionsObj };
  locationCode: FormInputType & { value: string };
  email: FormInputType & { value: string };
  species: FormInputType & { value: MultiOptionsObj };
  sourceCode: FormInputType & { value: string };
  willBeRegistered: FormInputType & { value: boolean };
  isBcSource: FormInputType & { value: boolean };
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
