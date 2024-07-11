const recentSeedlotsText = {
  tableTitle: 'My seedlots',
  tableSubtitle: 'Check a summary of your recent seedlots',
  admin: {
    title: 'Review seedlots',
    subtitle: 'Check all submitted seedlots that are waiting for approval'
  }
};

export const getTitle = (isAdmin: boolean) => (
  isAdmin
    ? recentSeedlotsText.admin.title
    : recentSeedlotsText.tableTitle
);

export const getSubTitle = (isAdmin: boolean) => (
  isAdmin
    ? recentSeedlotsText.admin.subtitle
    : recentSeedlotsText.tableSubtitle
);
