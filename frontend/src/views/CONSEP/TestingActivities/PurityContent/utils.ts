import { PurityReplicateType } from '../../../../types/consep/TestingActivityType';
import { ImpurityDisplayType, RichImpurityType } from './definitions';

export const impuritiesPerReplicate = (impurities: RichImpurityType[]): ImpurityDisplayType => {
  const impPerRep: ImpurityDisplayType = {};

  impurities.forEach((impurity) => {
    const entry = {
      debrisRank: impurity.debrisRank,
      debrisCategory: impurity.debrisTypeCode
    };

    if (!impPerRep[impurity.replicateNumber]) {
      impPerRep[impurity.replicateNumber] = [entry];
    } else {
      const index = impPerRep[impurity.replicateNumber].findIndex(
        (e) => impurity.debrisRank > e.debrisRank
      );

      if (index === -1) {
        impPerRep[impurity.replicateNumber].push(entry);
      } else {
        impPerRep[impurity.replicateNumber].splice(index, 0, entry);
      }
    }
  });

  return impPerRep;
};

export const purityReplicatesChecker = (
  replicates: PurityReplicateType[]
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
      rep.pureSeedWeight,
      'pureSeedWeight',
      'Pure Seed Weight must be greater than or equal to 0 and less than 1,000',
      !!rep.replicateAccInd
    );

    validateWeight(
      rep.inertMttrWeight,
      'inertMttrWeight',
      'Inert Matter Weight must be greater than or equal to 0 and less than 1,000',
      !!rep.replicateAccInd
    );

    validateWeight(
      rep.otherSeedWeight,
      'otherSeedWeight',
      'Other Seed Weight must be greater than or equal to 0 and less than 1,000',
      !!rep.replicateAccInd
    );
  });

  return validationErrors;
};
