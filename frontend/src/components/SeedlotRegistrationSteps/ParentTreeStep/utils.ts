import React from 'react';
import {
  ConeAndPollenEntriesType,
  ConeAndPollenType,
  SMPMixEntriesType,
  SMPMixType,
  SMPSuccessEntriesType,
  SMPSuccessType
} from '../../../types/SeedlotTypes/ParentTree';
import { geneticTraits } from './constants';
import { GeneticTraitsType, ParentTreesType } from './definitions';

export const clearTable = (refControl: any) => {
  // eslint-disable-next-line array-callback-return
  Object.entries(refControl.current).map((inputElem: any) => {
    // eslint-disable-next-line no-param-reassign
    inputElem[1].value = '';
  });
};

export const getGeneticWorths = (seedlotSpecies: string):Array<GeneticTraitsType> => {
  const genenticTraitsForSpecies:Array<GeneticTraitsType> = [];
  switch (seedlotSpecies) {
    case 'CW':
      genenticTraitsForSpecies.push(
        geneticTraits.ad,
        geneticTraits.dfu,
        geneticTraits.gvo,
        geneticTraits.wdu
      );
      break;
    case 'PLI':
      genenticTraitsForSpecies.push(
        geneticTraits.dfs,
        geneticTraits.dsc,
        geneticTraits.dsg,
        geneticTraits.gvo
      );
      break;
    case 'FDC':
      genenticTraitsForSpecies.push(
        geneticTraits.dfw,
        geneticTraits.gvo,
        geneticTraits.wwd
      );
      break;
    case 'PW':
      genenticTraitsForSpecies.push(
        geneticTraits.dsb
      );
      break;
    case 'SS':
    case 'SX':
      genenticTraitsForSpecies.push(
        geneticTraits.iws
      );
      genenticTraitsForSpecies.push(
        geneticTraits.gvo
      );
      break;
    case 'DR':
    case 'EP':
    case 'FDI':
    case 'HW':
    case 'LW':
    case 'PY':
      genenticTraitsForSpecies.push(
        geneticTraits.gvo
      );
      break;
    default:
  }
  return genenticTraitsForSpecies;
};

export const disableWheelEvent = (e: React.WheelEvent) => {
  (e.target as HTMLElement).blur();
};

// This function will be removed after the connection with the API
const getRandomFloatString = (): string => (Math.random() * (10 - 1) + 1).toFixed(4);
const getRandomFloat = ():number => parseFloat(getRandomFloatString());

// The initial state for all data should be zero, the only changes are
// on the specific traits of the species the seedlot belongs to, which
// are defined by the orchards parent tree object, so this function needs to be
// modified to map the correct values to the genetic traits
export const createEmptyConeAndPollen = (parentTrees: Array<ParentTreesType>) => {
  const parentTreeEntries: ConeAndPollenEntriesType[] = [];
  parentTrees.forEach((element) => {
    const parentTreeEntry: ConeAndPollenEntriesType = {
      cloneNumber: element.value,
      coneCount: '',
      pollenCount: '',
      smpSuccess: '',
      ad: getRandomFloatString(),
      dfs: getRandomFloatString(),
      dfu: getRandomFloatString(),
      dfw: getRandomFloatString(),
      dsb: getRandomFloatString(),
      dsc: getRandomFloatString(),
      dsg: getRandomFloatString(),
      gvo: getRandomFloatString(),
      iws: getRandomFloatString(),
      wdu: getRandomFloatString(),
      wwd: getRandomFloatString(),
      wve: getRandomFloatString()
    };
    parentTreeEntries.push(parentTreeEntry);
  });

  const coneAndPollenEmptyData: ConeAndPollenType = {
    coneAndPollenEntries: parentTreeEntries,
    totalParentTreesConeAndPollen: 0,
    totalConeCount: 0,
    totalPollenCount: 0,
    averageSMP: 0,
    geneticWorth: {
      populationSize: 0,
      testedParentTree: 0,
      coancestry: 0,
      smpParents: 0,
      adTotal: 0,
      dfsTotal: 0,
      dfuTotal: 0,
      dfwTotal: 0,
      dsbTotal: 0,
      dscTotal: 0,
      dsgTotal: 0,
      gvoTotal: 0,
      iwsTotal: 0,
      wduTotal: 0,
      wwdTotal: 0,
      wveTotal: 0
    }
  };

  return coneAndPollenEmptyData;
};

export const createEmptySMPSuccess = (parentTrees: Array<ParentTreesType>) => {
  const parentTreeEntries: SMPSuccessEntriesType[] = [];
  parentTrees.forEach((element) => {
    const parentTreeEntry: SMPSuccessEntriesType = {
      cloneNumber: element.value,
      successOnParent: '',
      nonOrchardPollenContam: '',
      ad: getRandomFloatString(),
      dfs: getRandomFloatString(),
      dfu: getRandomFloatString(),
      dfw: getRandomFloatString(),
      dsb: getRandomFloatString(),
      dsc: getRandomFloatString(),
      dsg: getRandomFloatString(),
      gvo: getRandomFloatString(),
      iws: getRandomFloatString(),
      wdu: getRandomFloatString(),
      wwd: getRandomFloatString(),
      wve: getRandomFloatString(),
      meanDegreesLat: getRandomFloatString(),
      meanMinutesLat: getRandomFloatString(),
      meanDegreesLong: getRandomFloatString(),
      meanMinutesLong: getRandomFloatString(),
      meanElevation: getRandomFloatString()
    };
    parentTreeEntries.push(parentTreeEntry);
  });

  const smpSuccessEmptyData: SMPSuccessType = {
    smpSuccessEntries: parentTreeEntries,
    totalParentTreesSMPSuccess: 0,
    averageNumberSMPSuccess: 0,
    averageNonOrchardPollenContam: 0,
    geneticWorth: {
      populationSize: 0,
      testedParentTree: 0,
      coancestry: 0,
      smpParents: 0,
      adTotal: 0,
      dfsTotal: 0,
      dfuTotal: 0,
      dfwTotal: 0,
      dsbTotal: 0,
      dscTotal: 0,
      dsgTotal: 0,
      gvoTotal: 0,
      iwsTotal: 0,
      wduTotal: 0,
      wwdTotal: 0,
      wveTotal: 0
    }
  };

  return smpSuccessEmptyData;
};

export const createEmptySMPMix = (length: number) => {
  const parentTreeEntries: SMPMixEntriesType[] = [];
  for (let i = 0; i < length; i += 1) {
    const parentTreeEntry: SMPMixEntriesType = {
      cloneNumber: '',
      volume: '',
      proportion: '',
      adClonal: '',
      dfsClonal: '',
      dfuClonal: '',
      dfwClonal: '',
      dsbClonal: '',
      dscClonal: '',
      dsgClonal: '',
      gvoClonal: '',
      iwsClonal: '',
      wduClonal: '',
      wwdClonal: '',
      wveClonal: '',
      adWeighted: '',
      dfsWeighted: '',
      dfuWeighted: '',
      dfwWeighted: '',
      dsbWeighted: '',
      dscWeighted: '',
      dsgWeighted: '',
      gvoWeighted: '',
      iwsWeighted: '',
      wduWeighted: '',
      wwdWeighted: '',
      wveWeighted: ''
    };
    parentTreeEntries.push(parentTreeEntry);
  }

  const smpSuccessEmptyData: SMPMixType = {
    smpMixEntries: parentTreeEntries,
    totalParentTreesFromOutside: 0,
    totalVolume: 0,
    geneticWorth: {
      adTotal: 0,
      dfsTotal: 0,
      dfuTotal: 0,
      dfwTotal: 0,
      dsbTotal: 0,
      dscTotal: 0,
      dsgTotal: 0,
      gvoTotal: 0,
      iwsTotal: 0,
      wduTotal: 0,
      wwdTotal: 0,
      wveTotal: 0
    }
  };

  return smpSuccessEmptyData;
};

// This function will be removed after the connection with the API
export const createRandomConeAndPollen = (
  parentTrees: Array<ParentTreesType>
) => {
  const parentTreeEntries: ConeAndPollenEntriesType[] = [];

  parentTrees.forEach((element: ParentTreesType) => {
    const parentTreeEntry: ConeAndPollenEntriesType = {
      cloneNumber: element.value,
      coneCount: getRandomFloatString(),
      pollenCount: getRandomFloatString(),
      smpSuccess: getRandomFloatString(),
      ad: getRandomFloatString(),
      dfs: getRandomFloatString(),
      dfu: getRandomFloatString(),
      dfw: getRandomFloatString(),
      dsb: getRandomFloatString(),
      dsc: getRandomFloatString(),
      dsg: getRandomFloatString(),
      gvo: getRandomFloatString(),
      iws: getRandomFloatString(),
      wdu: getRandomFloatString(),
      wwd: getRandomFloatString(),
      wve: getRandomFloatString()
    };
    parentTreeEntries.push(parentTreeEntry);
  });

  const coneAndPollenEmptyData: ConeAndPollenType = {
    coneAndPollenEntries: parentTreeEntries,
    totalParentTreesConeAndPollen: getRandomFloat(),
    totalConeCount: getRandomFloat(),
    totalPollenCount: getRandomFloat(),
    averageSMP: getRandomFloat(),
    geneticWorth: {
      populationSize: getRandomFloat(),
      testedParentTree: getRandomFloat(),
      coancestry: getRandomFloat(),
      smpParents: getRandomFloat(),
      adTotal: getRandomFloat(),
      dfsTotal: getRandomFloat(),
      dfuTotal: getRandomFloat(),
      dfwTotal: getRandomFloat(),
      dsbTotal: getRandomFloat(),
      dscTotal: getRandomFloat(),
      dsgTotal: getRandomFloat(),
      gvoTotal: getRandomFloat(),
      iwsTotal: getRandomFloat(),
      wduTotal: getRandomFloat(),
      wwdTotal: getRandomFloat(),
      wveTotal: getRandomFloat()
    }
  };

  return coneAndPollenEmptyData;
};

// This function will be removed after the connection with the API
export const createRandomSMPSuccess = (parentTrees: Array<ParentTreesType>) => {
  const parentTreeEntries: SMPSuccessEntriesType[] = [];
  parentTrees.forEach((element) => {
    const parentTreeEntry: SMPSuccessEntriesType = {
      cloneNumber: element.value,
      successOnParent: getRandomFloatString(),
      nonOrchardPollenContam: getRandomFloatString(),
      ad: getRandomFloatString(),
      dfs: getRandomFloatString(),
      dfu: getRandomFloatString(),
      dfw: getRandomFloatString(),
      dsb: getRandomFloatString(),
      dsc: getRandomFloatString(),
      dsg: getRandomFloatString(),
      gvo: getRandomFloatString(),
      iws: getRandomFloatString(),
      wdu: getRandomFloatString(),
      wwd: getRandomFloatString(),
      wve: getRandomFloatString(),
      meanDegreesLat: getRandomFloatString(),
      meanMinutesLat: getRandomFloatString(),
      meanDegreesLong: getRandomFloatString(),
      meanMinutesLong: getRandomFloatString(),
      meanElevation: getRandomFloatString()
    };
    parentTreeEntries.push(parentTreeEntry);
  });

  const smpSuccessEmptyData: SMPSuccessType = {
    smpSuccessEntries: parentTreeEntries,
    totalParentTreesSMPSuccess: getRandomFloat(),
    averageNumberSMPSuccess: getRandomFloat(),
    averageNonOrchardPollenContam: getRandomFloat(),
    geneticWorth: {
      populationSize: getRandomFloat(),
      testedParentTree: getRandomFloat(),
      coancestry: getRandomFloat(),
      smpParents: getRandomFloat(),
      adTotal: getRandomFloat(),
      dfsTotal: getRandomFloat(),
      dfuTotal: getRandomFloat(),
      dfwTotal: getRandomFloat(),
      dsbTotal: getRandomFloat(),
      dscTotal: getRandomFloat(),
      dsgTotal: getRandomFloat(),
      gvoTotal: getRandomFloat(),
      iwsTotal: getRandomFloat(),
      wduTotal: getRandomFloat(),
      wwdTotal: getRandomFloat(),
      wveTotal: getRandomFloat()
    }
  };

  return smpSuccessEmptyData;
};

// This function will be removed after the connection with the API
export const createRandomSMPMix = (length: number) => {
  const parentTreeEntries: SMPMixEntriesType[] = [];
  for (let i = 0; i < length; i += 1) {
    const parentTreeEntry: SMPMixEntriesType = {
      cloneNumber: getRandomFloatString(),
      volume: getRandomFloatString(),
      proportion: getRandomFloatString(),
      adClonal: getRandomFloatString(),
      dfsClonal: getRandomFloatString(),
      dfuClonal: getRandomFloatString(),
      dfwClonal: getRandomFloatString(),
      dsbClonal: getRandomFloatString(),
      dscClonal: getRandomFloatString(),
      dsgClonal: getRandomFloatString(),
      gvoClonal: getRandomFloatString(),
      iwsClonal: getRandomFloatString(),
      wduClonal: getRandomFloatString(),
      wwdClonal: getRandomFloatString(),
      wveClonal: getRandomFloatString(),
      adWeighted: getRandomFloatString(),
      dfsWeighted: getRandomFloatString(),
      dfuWeighted: getRandomFloatString(),
      dfwWeighted: getRandomFloatString(),
      dsbWeighted: getRandomFloatString(),
      dscWeighted: getRandomFloatString(),
      dsgWeighted: getRandomFloatString(),
      gvoWeighted: getRandomFloatString(),
      iwsWeighted: getRandomFloatString(),
      wduWeighted: getRandomFloatString(),
      wwdWeighted: getRandomFloatString(),
      wveWeighted: getRandomFloatString()
    };
    parentTreeEntries.push(parentTreeEntry);
  }

  const smpSuccessEmptyData: SMPMixType = {
    smpMixEntries: parentTreeEntries,
    totalParentTreesFromOutside: getRandomFloat(),
    totalVolume: getRandomFloat(),
    geneticWorth: {
      adTotal: getRandomFloat(),
      dfsTotal: getRandomFloat(),
      dfuTotal: getRandomFloat(),
      dfwTotal: getRandomFloat(),
      dsbTotal: getRandomFloat(),
      dscTotal: getRandomFloat(),
      dsgTotal: getRandomFloat(),
      gvoTotal: getRandomFloat(),
      iwsTotal: getRandomFloat(),
      wduTotal: getRandomFloat(),
      wwdTotal: getRandomFloat(),
      wveTotal: getRandomFloat()
    }
  };

  return smpSuccessEmptyData;
};
