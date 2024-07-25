import ClientAndCodeInputTextType from '../../../types/ClientAndCodeInputTextType';

export const DATE_FORMAT = 'Y/m/d';

export const MAX_FACILITY_DESC_CHAR = 50;

export const agencyFieldsProps: ClientAndCodeInputTextType = {
  useDefaultCheckbox: {
    name: 'useCollectorAgency',
    labelText: 'Use applicant collector agency as interim storage agency'
  },
  agencyInput: {
    titleText: 'Interim agency acronym',
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
    otherValue: 'OTH',
    otherInput: {
      placeholder: 'Enter the storage facility type',
      helperText: 'Describe the new storage facility used',
      invalidText: `Storage facility type length must be <= ${MAX_FACILITY_DESC_CHAR}.`
    }
  }
};
