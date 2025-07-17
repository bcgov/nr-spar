export const DATE_FORMAT = 'Y/m/d';

export const fieldsConfig = {
  titleSection: {
    title: 'Purity for seedlot'
  },
  impuritySection: {
    title: 'Impurities',
    firstSubtitle: 'Replicate 1',
    secondSubtitle: 'Replicate 2',
    buttonText: 'Add Impurities',
    primaryfieldName: 'Rank',
    secondaryfieldName: 'Impurity type',
    placeholder: 'Select an option',
    label: 'impurityType',
    options: ['Impurity1', 'Impurity2', 'Impurity3']

  },
  startDate: {
    name: 'startDate',
    placeholder: 'yyyy/mm/dd',
    labelText: 'Start date',
    invalidText: 'Please enter a valid date'
  },
  endDate: {
    name: 'endDate',
    placeholder: 'yyyy/mm/dd',
    labelText: 'End date',
    invalidText: 'Please enter a valid date'
  },
  category: {
    title: 'Category',
    placeholder: 'Choose a category',
    label: 'category',
    invalid: 'Please select an option',
    options: ['Quality assurance', 'Quality control']
  },
  comments: {
    name: 'comments',
    labelText: 'Comments (optional)',
    placeholder: 'My comments about this activity'
  }
};

export const actionModalOptions = {
  complete: {
    modalLabel: 'Are you sure you want to complete the test?',
    modalHeading: 'Complete purity test',
    primaryButtonText: 'Yes',
    secondaryButtonText: 'Cancel'
  },
  accept: {
    modalLabel: 'Are you sure you want to accept the test result?',
    modalHeading: 'Accept purity test result',
    primaryButtonText: 'Yes',
    secondaryButtonText: 'Cancel'
  }
};

export const COMPLETE = 'complete';
export const ACCEPT = 'accept';
