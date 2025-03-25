export const DATE_FORMAT = 'Y/m/d';

export const fieldsConfig = {
  titleSection: {
    title: 'Purity for seedlot 64132'
  },
  puritySection: {
    title: 'Purity data entry'
  },
  impuritySection: {
    title: 'Impurities'
  },
  activityItem: {
    activity: 'MC',
    seedlotNumber: 64132,
    requestId: 'CSP20240013',
    species: 'PLI | A',
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
