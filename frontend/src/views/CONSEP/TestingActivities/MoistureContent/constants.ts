export const DATE_FORMAT = 'Y/m/d';

export const fieldsConfig = {
  titleSection: {
    title: 'Moisture content cones for seedlot'
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
    options: ['Quality assurance', 'Standard']
  },
  comments: {
    name: 'comments',
    labelText: 'Comments (optional)',
    placeholder: 'My comments about this activity'
  }
};
