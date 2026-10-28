import ClientAndCodeInputTextType from '../../../types/ClientAndCodeInputTextType';
import { fieldsConfig as aClassFieldsConfig, agencyFieldsProps as aClassAgencyFields } from '../CollectionStep/constants';

export const DATE_FORMAT = 'Y/m/d';

export const agencyFieldsProps: ClientAndCodeInputTextType = {
  ...aClassAgencyFields,
  useDefaultCheckbox: {
    name: 'applicant',
    labelText: 'Use applicant agency as collector agency'
  },
  agencyInput: {
    titleText: 'Cone collector agency',
    invalidText: 'Please choose a valid collector agency, filter with agency number, name or acronym'
  },
  locationCode: {
    name: 'locationCode',
    labelText: 'Cone collector location code'
  }
};

export const fieldsConfig = {
  latLongSection: {
    title: 'Latitude and longitude',
    subtitle: 'Enter the latitude information',
    latLabel: 'Collection latitude mean',
    latHelper: 'Enter the mean lat. degrees, minutes, and seconds.',
    longLabel: 'Collection longitude mean',
    longHelper: 'Enter the mean long. degrees, minutes, and seconds.',
    degreePlaceholder: 'Enter degrees',
    minutePlaceholder: 'Enter minutes',
    secondPlaceholder: 'Enter seconds'
  },
  becSection: {
    title: 'BEC zone',
    subtitle: 'Enter the BEC zone information',
    useLatLongCheckbox: 'Use collection latitude and longitude to BEC information',
    zoneLabel: 'BEC zone',
    subzoneLabel: 'Subzone',
    variantLabel: 'Variant',
    becSearchLink: 'If you don\'t remember the BEC information you can go to BEC search'
  },
  collectorSection: {
    title: 'Collector agency',
    subtitle: 'Enter the collector agency information'
  },
  collectionInformationSection: {
    title: 'Collection information',
    subtitle: 'Enter the collection information about this seedlot'
  },
  orgUnit: {
    labelText: 'Collection org unit',
    placeholder: 'Enter or choose organizational unit',
    helperText: 'Type or search for the organizational unit'
  },
  locationArea: {
    labelText: 'Location area (optional)',
    placeholder: 'Enter the location',
    helperText: 'Type the collection area or closest geographic feature'
  },
  collectionRadius: {
    labelText: 'Radius of collection area (km)',
    placeholder: 'Enter radius',
    helperText: 'The radius cannot be greater than 8 kilometers'
  },
  elevation: {
    labelText: 'Collection min, max and mean elevation',
    minPlaceholder: 'Enter minimum',
    maxPlaceholder: 'Enter maximum',
    meanPlaceholder: 'Enter mean',
    helperText: 'Enter the elevation in metres from the original cone collection or vegetative material collection was made'
  },
  captureMethod: {
    labelText: 'Capture Method',
    placeholder: 'Enter or choose the capture method',
    helperText: 'Type or search the geographic location of the collection'
  },
  numberTreesFrom: {
    legendText: 'Number of trees collected from'
  },
  ...aClassFieldsConfig
};
