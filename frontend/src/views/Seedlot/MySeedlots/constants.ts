export const tableText = {
  pageTitle: 'My Seedlots',
  pageSubtitle: 'Check and manage your own seedlots',
  buttonText: 'Register a new seedlot',
  admin: {
    title: 'Review seedlots',
    subtitle: 'Check all seedlots that are waiting for approval'
  }
};

export const getTitle = (isAdmin: boolean) => (
  isAdmin
    ? tableText.admin.title
    : tableText.pageTitle
);

export const getSubTitle = (isAdmin: boolean) => (
  isAdmin
    ? tableText.admin.subtitle
    : tableText.pageSubtitle
);

export const headerData = [
  {
    key: 'number',
    header: 'Seedlot number'
  },
  {
    key: 'class',
    header: 'Seedlot class'
  },
  {
    key: 'lot_species',
    header: 'Seedlot species'
  },
  {
    key: 'form_step',
    header: 'Form step'
  },
  {
    key: 'status',
    header: 'Status'
  },
  {
    key: 'participants',
    header: 'Participants'
  },
  {
    key: 'created_at',
    header: 'Created at'
  },
  {
    key: 'last_modified',
    header: 'Last updated'
  },
  {
    key: 'approved_at',
    header: 'Approved at'
  }
];
