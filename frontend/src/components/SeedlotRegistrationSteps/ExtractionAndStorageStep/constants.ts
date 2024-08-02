import ClientAndCodeInputTextType from '../../../types/ClientAndCodeInputTextType';

export const DATE_FORMAT = 'Y/m/d';

export const extractorTextConfig: ClientAndCodeInputTextType = {
  useDefaultCheckbox: {
    name: 'extractor-use-tsc',
    labelText: 'The extractory agency is the Tree Seed Center (TSC)'
  },
  agencyInput: {
    titleText: 'Extractory agency acronym',
    invalidText: 'Please choose a valid extractory agency, filter with agency number, name or acronym'
  },
  locationCode: {
    name: 'extractor-locationCode',
    labelText: 'Extractory agency location code'
  }
};

export const storageTextConfig: ClientAndCodeInputTextType = {
  useDefaultCheckbox: {
    name: 'storage-use-tsc',
    labelText: 'The seed storage agency is the Tree Seed Center (TSC)'
  },
  agencyInput: {
    titleText: 'Seed storage agency acronym',
    invalidText: 'Please choose a valid seed storage agency, filter with agency number, name or acronym'
  },
  locationCode: {
    name: 'storage-locationCode',
    labelText: 'Seed storage location code'
  }
};

export const inputText = (isReview?: boolean) => ({
  extractionTitle: {
    titleText: 'Extraction information',
    subtitleText: 'Enter the extractory agency information and extraction\'s start and end dates for this seedlot'
  },
  date: {
    extraction: {
      labelText: {
        start: `Extraction start date${!isReview ? ' (optional' : ''}`,
        end: `Extraction end date${!isReview ? ' (optional' : ''}`
      },
      notification: {
        title: 'Extraction start and end dates',
        subtitle: 'The extraction start and end dates will be filled by the TSC. You will receive a notification once it\'s completed.'
      }
    },
    storage: {
      labelText: {
        start: `Storage start date${!isReview ? ' (optional' : ''}`,
        end: `Storage end date${!isReview ? ' (optional' : ''}`
      },
      notification: {
        title: 'Storage start and end dates',
        subtitle: 'The storage start and end dates will be filled by the TSC. You will receive a notification once it\'s completed.'
      }
    },
    helperText: 'year/month/day',
    placeholder: 'yyyy/mm/dd',
    invalidText: 'Please enter a valid date'
  },
  storageTitle: {
    titleText: 'Temporary seed storage',
    subtitleText: 'Enter the seed storage agency information and storage\'s start and end dates for this seedlot'
  }
});
