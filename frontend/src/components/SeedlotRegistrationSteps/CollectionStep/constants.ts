import AgencyTextPropsType from '../../../types/AgencyTextPropsType';

export const DATE_FORMAT = 'Y/m/d';
export const MOMENT_DATE_FORMAT = 'YYYY/MM/DD';
export const MAX_INPUT_DECIMAL = 9999.999;

export const agencyFieldsProps: AgencyTextPropsType = {
  useDefaultCheckbox: {
    name: 'applicant',
    labelText: 'Use applicant agency as collector agency'
  },
  agencyInput: {
    titleText: 'Cone Collector agency',
    invalidText: 'Please choose a valid collector agency, filter with agency number, name or acronym'
  },
  locationCode: {
    name: 'locationCode',
    labelText: 'Cone Collector location code'
  }
};

export const fieldsConfig = {
  titleSection: {
    title: 'Collector agency',
    subtitle: 'Enter the collector agency information'
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
    invalidText: 'Number has more than 3 decimals or bigger than 9,999.999'
  },
  volumePerContainers: {
    name: 'volumePerContainers',
    labelText: 'Volume per Containers (HI)',
    invalidText: 'Number has more than 3 decimals or bigger than 9,999.999'
  },
  volumeOfCones: {
    name: 'volumeOfCones',
    labelText: 'Volume of Cones (HI)',
    invalidText: 'Number has more than 3 decimals',
    helperText: 'This value must be the "Volume per container" X "Number of containers".',
    warnText: 'The total volume of cones does not equal, please note that this value must be the "Volume per container" x "Number of containers"'
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
