import { StringInputType } from '@/types/FormInputType';
import ClientAndCodeInputTextType from '../../types/ClientAndCodeInputTextType';
import { ComboBoxPropsType } from './definitions';

export const clientAndCodeInputText = (
  isReview: boolean | undefined
): ClientAndCodeInputTextType => ({
  useDefaultCheckbox: {
    name: '',
    labelText: ''
  },
  agencyInput: {
    titleText: `Applicant agency ${isReview ? '' : 'acronym'}`,
    invalidText: 'Acronym that identifies the agency'
  },
  locationCode: {
    name: 'seedlotCreationLocationCode',
    labelText: 'Agency location code'
  }
});

export const speciesFieldConfig: ComboBoxPropsType = {
  placeholder: 'Enter or choose an species for the seedlot',
  titleText: 'Seedlot species',
  invalidText: 'Please select a species',
  helperText: 'Type or search for the seedlot species using the dropdown list.'
};

// Template data for vegLot:
export const vegLotAgency: StringInputType = { id: '', isInvalid: false, value: '' };
export const vegLotLocationCode: StringInputType = { id: '', isInvalid: false, value: '' };

// Remove VegCodes with these codes
export const VegCodesToFilter: Array<string> = [
  'AMELALN',
  'ARCTUVA',
  'CEANSAN',
  'CEANVEL',
  'CORNSTO',
  'DG',
  'DRYADRU',
  'LA',
  'LARIDEC',
  'LARIKAE',
  'LD',
  'MAHOREP',
  'PINUSYL',
  'POTEFRU',
  'PRUNVIR',
  'SA',
  'SHEPCAN',
  'SPIRBET'
];
