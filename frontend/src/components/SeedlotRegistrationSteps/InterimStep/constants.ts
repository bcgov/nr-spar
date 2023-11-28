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
    subtitle: 'Enter the interim agency and storage information'
  },
  storageDate: {
    labelTextStart: 'Storage start date',
    labelTextEnd: 'Storage end date',
    placeholder: 'yyyy/mm/dd',
    helperText: 'year/month/day',
    invalidText: 'Please enter a valid date'
  },
  storageFacility: {
    labelText: 'Storage facility type',
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
