export const tableHeaders: string[] = [
  'Activity type',
  'Status',
  'Request ID',
  'Created at',
  'Last viewed',
  'View'
];

export const fileDocstableHeaders: string[] = [
  'File name',
  'File format',
  'Created at',
  'Last update',
  'Actions'
];

export const componentTexts = {
  title: 'My recent activities',
  subtitle: 'Check your recent requests and files',
  tabs: {
    ariaLabel: 'List of tabs',
    requests: 'Requests',
    files: 'Files & Docs.'
  }
};

export const getEmptySectionTitle = (currentTab: string) => (
  `There is no ${currentTab} to show yet!`
);

export const getEmptySectionDesc = (currentTab: string) => (
  `Your recent ${currentTab} will appear here once you generate one`
);
