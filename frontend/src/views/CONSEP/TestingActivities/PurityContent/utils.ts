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
