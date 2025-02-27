export const DATE_FORMAT = 'Y/m/d';
export const MOMENT_DATE_FORMAT = 'YYYY/MM/DD';

export const fieldsConfig = {
  titleSection: {
    title: 'Moisture content oven for seedlot 64132'
  },
  MoistureContentConesTitle: {
    title: 'Moisture content cones data entry '
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
