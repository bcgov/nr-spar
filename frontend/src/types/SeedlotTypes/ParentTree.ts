export type ConeAndPollenEntriesType = {
  parentTreeNumber: string;
  coneCount: string;
  pollenCount: string;
  smpSuccess: string;
  [genTrait: string]: string;
};

export type SMPSuccessEntriesType = {
  parentTreeNumber: string;
  successOnParent: string;
  nonOrchardPollenContam: string;
  [genTrait: string]: string;
};

export type SMPMixEntriesType = {
  parentTreeNumber: string;
  volume: string;
  proportion: string;
  [genTrait: string]: string;
};

type GeneticWorthType = {
  populationSize: number;
  testedParentTree: number;
  coancestry: number;
  smpParents: number;
  [genTraitTotal: string]: number;
}

type SMPMixGenTraitType = {
  [genTraitTotal: string]: number;
}

export type ConeAndPollenType = {
  coneAndPollenEntries: ConeAndPollenEntriesType[];
  totalParentTreesConeAndPollen: number;
  totalConeCount: number;
  totalPollenCount: number;
  averageSMP: number;
  geneticWorth: GeneticWorthType;
};

export type SMPSuccessType = {
  smpSuccessEntries: SMPSuccessEntriesType[];
  totalParentTreesSMPSuccess: number;
  averageNumberSMPSuccess: number;
  averageNonOrchardPollenContam: number;
  geneticWorth: GeneticWorthType;
};

export type SMPMixType = {
  smpMixEntries: SMPMixEntriesType[];
  totalParentTreesFromOutside: number;
  totalVolume: number;
  geneticWorth: SMPMixGenTraitType
};

export type ParentTreeType = {
  coneAndPollen: ConeAndPollenType;
  smpSuccess?: SMPSuccessType;
  smpMix?: SMPMixType;
};
