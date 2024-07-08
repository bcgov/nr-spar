export const activitiesHeaders: string[] = [
  'Activity type',
  'Status',
  'Request ID',
  'Created at',
  'Last viewed',
  'View'
];

export const filesAndDocsHeaders: string[] = [
  'File name',
  'File format',
  'Created at',
  'Last update',
  'Actions'
];

export const componentTexts = {
  title: 'My recent activities',
  tabs: {
    ariaLabel: 'List of tabs',
    requests: 'Requests',
    files: 'Files & Docs'
  }
};

export const getEmptySectionTitle = (currentTab: string) => (
  `There is no ${currentTab} to show yet!`
);

export const getEmptySectionDesc = (currentTab: string) => (
  `Your recent ${currentTab} will appear here once you generate one`
);
