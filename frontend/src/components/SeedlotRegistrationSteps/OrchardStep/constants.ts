import { OrchardObj } from './definitions';

export const MAX_ORCHARDS = 2;

export const initialStagedOrchard: OrchardObj = {
  inputId: -1,
  selectedItem: null,
  isInvalid: false
};

export const orchardStepText = {
  orchardSection: {
    title: 'Orchard information',
    subtitle: 'Enter the contributing orchard information',
    orchardInput: {
      label: 'Select an orchard',
      optLabel: 'Select an additional orchard',
      placeholder: 'ID - Name - Lot type - Stage code',
      fetchError: 'Failed to fetch orchard data'
    },
    orchardName: {
      label: 'Orchard name',
      optLabel: 'Orchard name (optional)'
    },
    buttons: {
      add: 'Add additional orchard',
      delete: 'Delete additional orchard'
    }
  },
  gameteSection: {
    title: 'Gamete information',
    subtitle: 'Enter the seedlot gamete information',
    seedlotSpecies: 'Seedlot species',
    femaleGametic: {
      label: 'Female gametic contribution methodology',
      placeholder: 'Choose a female contribution method',
      invalid: 'Please select an option'
    },
    maleGametic: {
      label: 'Male gametic contribution methodology',
      placeholder: 'Choose a male contribution method',
      invalid: 'Please select an option'
    },
    controlledCross: {
      label: 'Was the seedlot produced through controlled crosses?',
      checkbox: 'No, the seedlot was not produced through controlled crosses'
    },
    biotechProcess: {
      label: 'Have biotechnological processes been used to produce this seedlot?',
      checkbox: 'No, biotechnological processes have not been used to produce this seedlot'
    }
  },
  pollenSection: {
    title: 'Pollen information',
    subtitle: 'Enter the pollen contaminant information',
    pollenContamination: {
      label: 'Was pollen contamination present in the seed orchard?',
      checkbox: 'No, there was no pollen contamination present in the seed orchard'
    },
    breedingPercentage: {
      label: 'Contaminant pollen breeding value (optional) (%)',
      helper: 'If contaminant pollen was present and the contaminant pollen has a breeding value',
      invalid: 'Please enter a valid value between 0 and 100'
    },
    pollenMethodology: {
      label: 'Contaminant pollen methodology',
      checkbox: 'Regional pollen monitoring'
    }
  }
};
