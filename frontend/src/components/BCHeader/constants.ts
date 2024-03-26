import { env } from '../../env';
import ROUTES from '../../routes/constants';

export const VERSION: string = `Version: ${env.VITE_NRSPARWEBAPP_VERSION}`;

export const HOME_LINK = ROUTES.DASHBOARD;

export const clearPanelState = {
  notifications: false,
  myProfile: false
};

export const navItems = [
  {
    name: 'Main activities',
    items: [
      {
        name: 'Dashboard',
        icon: 'Dashboard',
        link: ROUTES.DASHBOARD,
        disabled: false
      },
      {
        name: 'Seedlots',
        icon: 'SoilMoistureField',
        link: ROUTES.SEEDLOTS,
        disabled: false
      },
      {
        name: 'Seedlings',
        icon: 'CropGrowth',
        link: '#',
        disabled: true
      },
      {
        name: 'Nurseries',
        icon: 'CropHealth',
        link: '#',
        disabled: true
      },
      {
        name: 'Orchards',
        icon: 'MapBoundaryVegetation',
        link: '#',
        disabled: true
      },
      {
        name: 'Reports',
        icon: 'Report',
        link: '#',
        disabled: true
      },
      {
        name: 'Tests',
        icon: 'Chemistry',
        link: '#',
        disabled: true
      },
      {
        name: 'Parent tree',
        icon: 'Tree',
        link: '#',
        disabled: true
      },
      {
        name: 'Tree seed center',
        icon: 'Enterprise',
        link: '#',
        disabled: true
      },
      {
        name: 'Financial',
        icon: 'Money',
        link: '#',
        disabled: true
      }
    ]
  },
  {
    name: 'Management',
    items: [
      {
        name: 'Notifications',
        icon: 'Notification',
        link: '#',
        disabled: true
      },
      {
        name: 'Settings',
        icon: 'Settings',
        link: '#',
        disabled: true
      }
    ]
  }
];

export const supportItems = {
  name: 'Support',
  items: [
    {
      name: 'Need help?',
      icon: 'Help',
      link: '#',
      disabled: true
    }
  ]
};

export const componentTexts = {
  headerTitle: 'SPAR',
  completeTitle: ' Seed Planning and Registry System',
  openMenu: 'Open menu',
  sideMenuAriaLabel: 'Side menu',
  searchAriaLabel: 'Search',
  notifications: {
    title: 'Notifications',
    headerAriaLabel: 'Notifications Tab'
  },
  profile: {
    title: 'My Profile',
    headerAriaLabel: 'My Profile Tab',
    controllerAriaLabel: 'User Settings'
  }
};
