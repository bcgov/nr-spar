const supportTexts = {
  agency: {
    placeholder: 'Enter or choose your agency',
    helperText: 'You can enter the agency number, name or acronym',
    invalidTextInterimSpecific: 'Please specify a collector agency to proceed'
  },
  locationCode: {
    placeholder: 'Example: 00',
    helperTextDisabled: 'Please select an agency before setting the location code',
    helperTextEnabled: '2-digit code that identifies the address of operated office or division',
    invalidLocationForSelectedAgency: 'This location code is not valid for the selected agency, please enter a valid one or change the agency',
    invalidText: 'Please enter a valid 2-digit code that identifies the address of operated office or division',
    invalidTextInterimSpecific: 'Please specify a collector location code to proceed'
  }
};

export default supportTexts;
