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
    titleText: 'Applicant agency name',
    invalidText: 'Please select an agency'
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
