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
  emptyPictogram: 'Magnify',
  emptyTitle: 'There is no seedlot to show yet!',
  emptyDescription: 'Your recent seedlots will appear here once you generate one',
  errorTitle: 'Network errors...',
  errorDescription: 'Could not display seedlot data',
  errorIcon: 'InProgressError',
  unknownIcon: 'WatsonHealthImageAvailabilityUnavailable',
  unknownTitle: 'Something went wrong...'
};

export const PageSizesConfig = [
  10, 20, 30, 40, 50
];
