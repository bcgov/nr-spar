import { MccReplicateType } from '../../../../types/consep/TestingActivityType';

export const mccReplicatesChecker = (
  replicates: MccReplicateType[]
): Record<string, string> => {
  const validationErrors: Record<string, string> = {};

  replicates.forEach((rep, index) => {
    const validateWeight = (
      weight: number | undefined,
      fieldName: string,
      errorMessage: string,
      isAccepted: boolean
    ) => {
      if (isAccepted && (!weight || weight < 0 || weight > 1000)) {
        validationErrors[`${index}_${fieldName}`] = errorMessage;
      }
    };

    validateWeight(
      rep.containerWeight,
      'containerWeight',
      'Container Weight must be greater than or equal to 0 and less than 1,000',
      !!rep.replicateAccInd
    );

    validateWeight(
      rep.freshSeed,
      'freshSeed',
      'Fresh seed must be greater than or equal to 0 and less than 1,000',
      !!rep.replicateAccInd
    );

    validateWeight(
      rep.containerAndDryWeight,
      'containerAndDryWeight',
      'Container and Dry Weight must be greater than or equal to 0 and less than 1,000',
      !!rep.replicateAccInd
    );
  });

  return validationErrors;
};
