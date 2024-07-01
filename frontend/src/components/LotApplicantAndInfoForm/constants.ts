import { EmptyMultiOptObj } from '../../shared-constants/shared-constants';
import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { OptionsInputType, StringInputType } from '../../types/FormInputType';
import { ComboBoxPropsType } from './definitions';

export const agencyFieldsProp: AgencyTextPropsType = {
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
export const vegLotAgency: OptionsInputType = { id: '', isInvalid: false, value: EmptyMultiOptObj };
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
