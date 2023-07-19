import orchardModalOptions from './definitions';

const modalConfig: orchardModalOptions = {
  add: {
    label: 'Add orchard',
    title: 'Are you sure you want to add another orchard? If yes, then you might lose the parent tree and SMP information',
    buttons: {
      primary: 'Add another orchard',
      secondary: 'Cancel'
    }
  },
  delete: {
    label: 'Delete orchard',
    title: 'Are you sure you want to delete the additional orchard? If yes, then you might lose the parent tree and SMP information',
    buttons: {
      primary: 'Delete additional orchard',
      secondary: 'Cancel'
    }
  },
  change: {
    label: 'Change orchard',
    title: 'Are you sure you want to change the orchard? If yes, then you might lose the parent tree and SMP information',
    buttons: {
      primary: 'Change orchard',
      secondary: 'Cancel'
    }
  }
};

export default modalConfig;
