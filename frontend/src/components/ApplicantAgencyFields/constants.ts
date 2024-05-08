const supportTexts = {
  agency: {
    helperText: '3-8 letter code identifying the agency',
    invalidAcronym: 'Please enter a valid acronym that identifies the agency',
    invalidTextInterimSpecific: 'Please specify a collector agency to proceed'
  },
  locationCode: {
    placeholder: 'Example: 00',
    helperTextDisabled: 'Please enter an agency before setting the location code',
    helperTextEnabled: '2-digit code identifying the agency\'s address',
    invalidLocationForSelectedAgency: 'This location code is not valid for the selected agency, please enter a valid one or change the agency',
    invalidText: 'Please enter a valid 2-digit code identifying the agency\'s address',
    invalidTextInterimSpecific: 'Please specify a collector location code to proceed'
  }
};

export const getErrorMessageTitle = (field: string) => `${field} verification failed:`;

export default supportTexts;
