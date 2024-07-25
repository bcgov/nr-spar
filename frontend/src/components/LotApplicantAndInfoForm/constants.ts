import ClientAndCodeInputTextType from '../../types/ClientAndCodeInputTextType';
import { StringInputType } from '../../types/FormInputType';
import { ComboBoxPropsType } from './definitions';

export const clientAndCodeInputText: ClientAndCodeInputTextType = {
  useDefaultCheckbox: {
    name: '',
    labelText: ''
  },
  agencyInput: {
    titleText: 'Applicant agency acronym',
    invalidText: 'Acronym that identifies the agency'
  },
  locationCode: {
    name: 'seedlotCreationLocationCode',
    labelText: 'Applicant agency number'
  }
};

export const speciesFieldConfig: ComboBoxPropsType = {
  placeholder: 'Enter or choose an species for the seedlot',
  titleText: 'Type or search for the seedlot species using the drop-down list',
  invalidText: 'Please select a species',
  helperText: ''
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
