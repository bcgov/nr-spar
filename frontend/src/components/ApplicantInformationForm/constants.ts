import ComboBoxPropsType from './definitions';

export const LOCATION_CODE_LIMIT = 2;

export const pageTexts = {
  invalidLocationValue: 'Please enter a valid value between 0 and 99',
  invalidLocationForSelectedAgency: 'This agency number is not valid for the selected client, please enter a valid one'
};

export const applicantAgencyFieldProps: ComboBoxPropsType = {
  id: 'applicant-info-combobox',
  className: '',
  placeholder: 'Select an agency...',
  titleText: 'Applicant agency name',
  invalidText: '',
  helperText: 'You can enter your agency number, name or acronym'
};

export const speciesFieldProps: ComboBoxPropsType = {
  id: 'seedlot-species-combobox',
  className: 'applicant-info-combobox-species',
  placeholder: 'Enter or choose an species for the seedlot',
  titleText: 'Seedlot species',
  invalidText: 'Please select a species',
  helperText: ''
};
