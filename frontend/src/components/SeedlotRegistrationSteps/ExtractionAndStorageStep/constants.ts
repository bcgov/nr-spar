import { ValidateLocationType } from './definitions';

export const DATE_FORMAT = 'Y/m/d';

export const inputText = {
  extractionTitle: {
    titleText: 'Extraction information',
    subtitleText: 'Enter the extractory agency information and extraction’s star and end dates for this seedlot'
  },
  extractorCheckbox: {
    labelText: 'The extractory agency is the Tree Seed Center (TSC)'
  },
  extractor: {
    placeholder: 'Select Extractory agency name',
    titleText: 'Extractory agency',
    helperText: 'You can enter your agency number, name or acronym'
  },
  extractorCode: {
    labelText: 'Extractory agency location code',
    helperTextEnabled: '2-digit code that identifies the address of operated office or division',
    helperTextDisabled: 'Please select an extractory agency before setting the agency location code',
    invalidLocationValue: 'Please enter a valid value between 0 and 99',
    invalidLocationForSelectedAgency: 'This agency location code is not valid for the selected agency, please enter a valid one or change the agency'
  },
  date: {
    extraction: {
      labelText: {
        start: 'Extraction start date',
        end: 'Extraction end date'
      },
      notification: {
        title: 'Extraction start and end dates',
        subtitle: 'The extraction start and end dates will be filled by the TSC. You will receive a notification once it’s completed.'
      }
    },
    storage: {
      labelText: {
        start: 'Storage start date',
        end: 'Storage end date'
      },
      notification: {
        title: 'Storage start and end dates',
        subtitle: 'The storage start and end dates will be filled by the TSC. You will receive a notification once it’s completed.'
      }
    },
    helperText: 'year/month/day',
    placeholder: 'yyyy/mm/dd',
    invalidText: 'Please enter a valid date'
  },
  storageTitle: {
    titleText: 'Temporary seed storage',
    subtitleText: 'Enter the seed storage agency information and storage’s star and end dates for this seedlot'
  },
  storageCheckbox: {
    labelText: 'The seed storage agency is the Tree Seed Center (TSC)'
  },
  storage: {
    placeholder: 'Select Interim agency name',
    titleText: 'Seed storage agency',
    helperText: 'You can enter your agency number, name or acronym'
  },
  storageCode: {
    labelText: 'Seed storage location code',
    helperTextEnabled: '2-digit code that identifies the address of operated office or division',
    helperTextDisabled: 'Please select an extractory agency before setting the agency location code',
    invalidLocationValue: 'Please enter a valid value between 0 and 99',
    invalidLocationForSelectedAgency: 'This agency location code is not valid for the selected agency, please enter a valid one or change the agency'
  }
};

export const initLocationValidateObj: ValidateLocationType = {
  extractorFields: {
    forestClientNumber: '',
    invalidLocationMessage: '',
    locationCodeHelper: inputText.extractorCode.helperTextEnabled
  },
  storageFields: {
    forestClientNumber: '',
    invalidLocationMessage: '',
    locationCodeHelper: inputText.storageCode.helperTextEnabled
  }
};
