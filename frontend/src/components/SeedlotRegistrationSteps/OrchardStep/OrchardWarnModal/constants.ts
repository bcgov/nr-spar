import orchardModalOptions from './definitions';

const modalConfig: orchardModalOptions = {
  delete: {
    label: 'Delete orchard',
    title: 'Are you sure you want to delete the additional orchard? If yes, then you will lose the parent tree and SMP information in Step 5',
    buttons: {
      primary: 'Delete secondary orchard',
      secondary: 'Cancel'
    }
  },
  change: {
    label: 'Change orchard',
    title: 'Are you sure you want to change the orchard? If yes, then you will lose the parent tree and SMP information in Step 5',
    buttons: {
      primary: 'Change orchard',
      secondary: 'Cancel'
    }
  }
};

export default modalConfig;
