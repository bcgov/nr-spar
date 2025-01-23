import { HeaderProps, Department } from './definitions';

export const textConfig = {
  title: 'Add favourite activity',
  description: 'You can select up to 12 activities',
  buttons: {
    cancel: 'Cancel',
    confirm: 'Add to favourites'
  }
};

export const favActHeaders: HeaderProps[] = [
  {
    key: 'activityName',
    header: 'Activity Name'
  },
  {
    key: 'department',
    header: 'Department'
  }];

export const searchOptions: Array<string> = [
  'All departments', 'Testing', 'Administrative', 'Withdrawal', 'Processing', 'Seed and family lot'
];

export const headerIconMap: Record<Department, string> = {
  Testing: 'Chemistry',
  Administrative: 'Tools',
  Withdrawal: 'StayInside',
  Processing: 'Industry',
  'Seed and family lot': 'SoilMoistureGlobal'
};
