export type RichImpurityType = {
  riaKey: number;
  replicateNumber: number;
  debrisSeqNumber: number;
  debrisRank: number;
  debrisTypeCode: string;
};

export type SingleImpurityType = {
  debrisRank: number;
  debrisCategory: string;
}

export type ImpurityDisplayType = {
  [replicateNumber: number]: SingleImpurityType[]
};

export type ImpurityPayload = {
  replicateNumber: number;
  debrisRank: number;
  debrisTypeCode: string;
};
