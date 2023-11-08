import { SeedlotRegFormType, SeedlotRegPayloadType } from '../../../../types/SeedlotRegistrationTypes';

export const convertToPayload = (formData: SeedlotRegFormType): SeedlotRegPayloadType => ({
  applicantClientNumber: formData.client.value.code,
  applicantLocationCode: formData.locationCode.value,
  applicantEmailAddress: formData.email.value,
  vegetationCode: formData.species.value.code,
  seedlotSourceCode: formData.sourceCode.value,
  toBeRegistrdInd: formData.willBeRegistered.value,
  bcSourceInd: formData.isBcSource.value,
  geneticClassCode: 'A'
});
