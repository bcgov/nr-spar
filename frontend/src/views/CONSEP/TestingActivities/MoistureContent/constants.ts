export const DATE_FORMAT = 'Y/m/d';

export const fieldsConfig = {
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
    options: ['QA', 'STD', 'QAK', 'QAR']
  },
  comments: {
    name: 'comments',
    labelText: 'Comments (optional)',
    placeholder: 'My comments about this activity'
  }
};

export const mccVariations = {
  MCC: {
    defaultCategory: 'QA',
    description: 'Moisture content cones',
    defaultNumberOfRows: 4
  },
  MCK: {
    defaultCategory: 'QAK',
    description: 'Moisture content unkilned seed',
    defaultNumberOfRows: 1
  },
  MCR: {
    defaultCategory: 'QAR',
    description: 'Moisture content QAR',
    defaultNumberOfRows: 8
  },
  MC: {
    defaultCategory: 'STD',
    description: 'Moisture content oven',
    defaultNumberOfRows: 2
  },
  MCQ: {
    defaultCategory: 'QA',
    description: 'Moisture content QA',
    defaultNumberOfRows: 2
  },
  MCM: {
    defaultCategory: 'QA',
    description: 'Moisture content meter',
    defaultNumberOfRows: 1
  }
};
