export const DATE_FORMAT = 'Y/m/d';

export const fieldsConfig = {
  titleSection: {
    title: 'Purity for seedlot 64132'
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
  activityItem: {
    activity: 'PUR',
    seedlotNumber: '64132',
    requestId: 'CSP20240013',
    speciesAndClass: 'PLI | A',
    testResult: '7.80%'
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
    options: ['Quality Assurance', 'Quality Control']
  },
  comments: {
    name: 'comments',
    labelText: 'Comments (optional)',
    placeholder: 'My comments about this activity'
  }
};
