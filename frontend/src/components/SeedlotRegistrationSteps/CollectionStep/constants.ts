const DATE_FORMAT = 'Y/m/d';
const MOMENT_DATE_FORMAT = 'YYYY/MM/DD';

const fieldsConfig = {
  titleSection: {
    title: 'Collector agency',
    subtitle: 'Enter the collector agency information'
  },
  checkbox: {
    name: 'applicant',
    labelText: 'Use applicant agency as collector agency'
  },
  collector: {
    name: 'collectorAgency',
    placeholder: 'Enter or choose your agency',
    titleText: 'Cone Collector agency',
    helperText: 'You can enter the agency number, name or acronym',
    invalidText: 'Please choose a valid collector agency, filter with agency number, name or acronym'
  },
  code: {
    name: 'locationCode',
    placeholder: 'Example: 123',
    label: 'Cone Collector location code',
    helperText: '2-digit code that identifies the address of operated office or division',
    invalidText: 'Please enter a valid 2-digit code that identifies the address of operated office or division'
  },
  collectionTitle: {
    title: 'Collection information',
    subtitle: 'Enter the collection information about this seedlot'
  },
  startDate: {
    name: 'startDate',
    placeholder: 'yyyy/mm/dd',
    labelText: 'Collection start date',
    helperText: 'year/month/day',
    invalidText: 'Please enter a valid date'
  },
  endDate: {
    name: 'endDate',
    placeholder: 'yyyy/mm/dd',
    labelText: 'Collection end date',
    helperText: 'year/month/day',
    invalidText: 'Please enter a valid date'
  },
  numberOfContainers: {
    name: 'numberOfContainers',
    labelText: 'Number of Containers',
    invalidText: 'Number is not valid'
  },
  volumePerContainers: {
    name: 'volumePerContainers',
    labelText: 'Volume per Containers (HI)',
    invalidText: 'Number is not valid'
  },
  volumeOfCones: {
    name: 'volumeOfCones',
    labelText: 'Volume of Cones (HI)',
    invalidText: 'Number is not valid',
    helperText: 'This value should be the "Volume per container" X "Number of containers".',
    warnText: 'The total volume of cones does not equal, please note that this value should be the "Volume per container" x "Number of containers"'
  },
  collectionMethodOptionsLabel: 'Collection methods (Select at least one method used to collect the cones)',
  collectionMethod: {
    name: 'collectionMethodName',
    labelText: 'Collection method name',
    placeholder: 'Enter the collection method name',
    helperText: 'Describe the new collection method used'
  },
  comments: {
    name: 'comments',
    labelText: 'Comments (optional)',
    placeholder: 'Additional comments about the seedlot'
  }
};

export { DATE_FORMAT, MOMENT_DATE_FORMAT, fieldsConfig };
