import { HeaderProps } from './definitions';

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
