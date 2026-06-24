import { env } from '../../env';
import ROUTES from '../../routes/constants';
import { RightPanelType } from './definitions';

// Defensive fallback: `env.VITE_NRSPARWEBAPP_VERSION` is undefined in the
// DEV-LOCAL POC container where the build-time substitution doesn't run,
// which previously surfaced as a literal "undefined" in the sidebar
// footer. Use the string 'DEV-LOCAL' so the version label still reads
// correctly when the var is missing.
export const VERSION: string = env.VITE_NRSPARWEBAPP_VERSION
  ? `${env.VITE_NRSPARWEBAPP_VERSION}`
  : 'DEV-LOCAL';

export const HOME_LINK = ROUTES.DASHBOARD;

export const defaultPanelState: RightPanelType = {
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
      }
      // Uncomment these as necessary :)
      // {
      //   name: 'Seedlings',
      //   icon: 'CropGrowth',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Nurseries',
      //   icon: 'CropHealth',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Orchards',
      //   icon: 'MapBoundaryVegetation',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Reports',
      //   icon: 'Report',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Tests',
      //   icon: 'Chemistry',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Parent tree',
      //   icon: 'Tree',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Tree seed centre',
      //   icon: 'Enterprise',
      //   link: '#',
      //   disabled: true
      // },
      // {
      //   name: 'Financial',
      //   icon: 'Money',
      //   link: '#',
      //   disabled: true
      // }
    ]
  }
  // Uncomment these as necessary :)
  // {
  //   name: 'Management',
  //   items: [
  //     {
  //       name: 'Notifications',
  //       icon: 'Notification',
  //       link: '#',
  //       disabled: true
  //     },
  //     {
  //       name: 'Settings',
  //       icon: 'Settings',
  //       link: '#',
  //       disabled: true
  //     }
  //   ]
  // }
];

export const supportItems = {
  name: 'Support',
  items: [
  // Uncomment these as necessary :)
  //     {
  //       name: 'Need help?',
  //       icon: 'Help',
  //       link: '#',
  //       disabled: true
  //     },
    {
      name: 'Service status',
      icon: 'CloudMonitoring',
      link: '/service-status',
      disabled: false
    }
  ]
};

export const componentTexts = {
  headerTitle: 'SPAR',
  completeTitle: ' Seed Planning and Registry System',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  sideMenuAriaLabel: 'Side menu',
  searchAriaLabel: 'Search',
  notifications: {
    title: 'Notifications',
    headerAriaLabel: 'Notifications Tab'
  },
  profile: {
    title: 'My Profile',
    headerAriaLabel: 'My Profile',
    controllerAriaLabel: 'User Settings'
  }
};
