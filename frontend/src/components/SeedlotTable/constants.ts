import { HeaderObj } from './definitions';

export const HeaderConfig: HeaderObj[] = [
  {
    id: 'seedlotNumber',
    label: 'Seedlot number'
  },
  {
    id: 'seedlotClass',
    label: 'Seedlot class'
  },
  {
    id: 'seedlotSpecies',
    label: 'Seedlot species'
  },
  {
    id: 'seedlotStatus',
    label: 'Status'
  },
  {
    id: 'entryUserId',
    label: 'Submitted by'
  },
  {
    id: 'entryTimestamp',
    label: 'Submitted at'
  },
  {
    id: 'applicantAgency',
    label: 'Applicant agency'
  },
  {
    id: 'locationCode',
    label: ''
  },
  {
    id: 'createdAt',
    label: 'Created at'
  },
  {
    id: 'lastUpdatedAt',
    label: 'Last updated'
  },
  {
    id: 'approvedAt',
    label: 'Approved at'
  }
];

export const TableText = {
  emptyPictogram: 'Cafe',
  emptyTitle: 'There is no seedlot to show yet!',
  emptyDescription: 'Your recent seedlots will appear here once you generate one',
  errorTitle: 'Network errors...',
  errorDescription: 'Could not display seedlot data',
  errorIcon: 'InProgressError',
  unknownIcon: 'WatsonHealthImageAvailabilityUnavailable',
  unknownTitle: 'Something went wrong...',
  admin: {
    emptyTitle: 'All seedlots reviewed!',
    emptyDescription: 'All seedlots have been reviewed, good job! Seedltos that are waiting for approval will be show here once they are submitted.'
  }
};

export const PageSizesConfig = [
  50, 100, 150, 200, 250
];

export const ExclusiveAdminRows: Array<string> = [
  'entryUserId',
  'entryTimestamp',
  'applicantAgency',
  'locationCode'
];
