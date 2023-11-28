import AgencyTextPropsType from '../../../types/AgencyTextPropsType';

export const DATE_FORMAT = 'Y/m/d';

export const agencyFieldsProps: AgencyTextPropsType = {
  useDefaultCheckbox: {
    name: 'useCollectorAgency',
    labelText: 'Use applicant collector agency as interim storage agency'
  },
  agencyInput: {
    name: 'interimAgency',
    labelText: 'Interim agency',
    invalidText: 'Please choose a valid interim agency, filter with agency number, name or acronym'
  },
  locationCode: {
    name: 'locationCode',
    labelText: 'Interim agency location code'
  }
};

export const pageTexts = {
  interimTitleSection: {
    title: 'Interim agency',
    subtitle: 'Enter the interim agency information here, or skip to the interim storage information below. Only one of the two sections needs to be completed.'
  },
  storageTitleSection: {
    title: 'Storage information',
    subtitle: 'Enter the interim storage information here, or skip to the interim agency information above. Only one of the two sections needs to be completed.'
  },
  storageDate: {
    labelTextStart: 'Storage start date (optional)',
    labelTextEnd: 'Storage end date (optional)',
    placeholder: 'yyyy/mm/dd',
    helperText: 'year/month/day',
    invalidText: 'Please enter a valid date'
  },
  storageLocation: {
    labelText: 'Storage location',
    helperText: 'Enter a short name or description of the location where the cones are being temporarily stored'
  },
  storageFacility: {
    labelText: 'Storage facility type (optional)',
    outsideLabel: 'Outside covered - OCV',
    outsideValue: 'OCV',
    ventilatedLabel: 'Ventilated room - VRM',
    ventilatedValue: 'VRM',
    reeferLabel: 'Reefer - RFR',
    reeferValue: 'RFR',
    otherLabel: 'Other - OTH',
    otherValue: 'OTH'
  }
};
