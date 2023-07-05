// eslint-disable-next-line import/prefer-default-export
export const MAX_ORCHARDS = 2;

export const orcharStepText = {
  orchardSection: {
    title: 'Orchard information',
    subtitle: 'Enter the contributing orchard information',
    orchardInput: {
      label: 'Orchard ID or number',
      optLabel: 'Additional orchard ID (optional)',
      placeholder: 'Example: 123',
      invalid: 'Please insert a valid orchard id between 100 and 999'
    },
    orchardName: {
      label: 'Orchard name',
      optLabel: 'Orchard name (optional)'
    },
    buttons: {
      add: 'Add orchard',
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
      label: 'Male gametic contribution methodology'
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
    noPollenContamination: {
      label: 'Was pollen contamination present?',
      checkbox: 'No, there was no pollen contamination present in the seed orchard'
    },
    breedingPercentage: {
      label: 'Contaminant pollen breeding value (optional)',
      helper: 'If contaminant pollen was present and the contaminant pollen has a breeding value',
      invalid: 'Please enter a valid value between 0 and 100'
    },
    pollenMethodology: {
      label: 'Contaminant pollen methodology',
      checkbox: 'Regional pollen monitoring'
    }
  }
};
