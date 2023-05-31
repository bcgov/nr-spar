/* eslint-disable max-len */
import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderConfigObj, RowItem } from './definitions';

// Placeholder function to generate download URL for future
const getDownloadUrl = (tabType: string) => `#TODO-${tabType.split(' ')[0]}`;

const getTabDescription = (tabType: string) => (
  <>
    {
      `Enter the ${tabType} manually or upload a spreadsheet file with the template for the ${tabType} table. `
      + 'Remember to keep your orchard updated, you can '
    }
    <Link to="#TODO-orchard-management-link">go to orchard&apos;s management page</Link>
    &nbsp;to edit the listed parent trees in your orchard.
  </>
);

const getNotificationSubtitle = (tabType: string) => (
  <>
    {
      `You can import one spreadsheet file for the ${tabType} table with the data you want to use. `
    }
    <br />
    {
      'For further guidance on how to organize the data, '
      + "do use the SPAR's spreadsheet template. "
    }
    <Link className="notification-link" to={getDownloadUrl(tabType)}>{`Download ${tabType} template`}</Link>
  </>
);

const errorDescription = (
  <>
    To see your orchard&apos;s composition, you must first fill the orchard id field in the previous step, “Orchard”.
    <br />
    Please, fill the orchard ID to complete the cone and pollen table.
  </>
);

export const getPageText = () => ({
  notificationTitle: 'Upload spreadsheet to table',
  errorNotifTitle: 'No orchard ID linked yet!',
  errorDescription,
  coneTab: {
    tabTitle: 'Cone and pollen count',
    tabDescription: getTabDescription('cone and pollen count'),
    notificationSubtitle: getNotificationSubtitle('cone and pollen count'),
    tableDescription: "Enter the estimative of cone and pollen count for the orchard's seedlot (*required)"
  },
  successTab: {
    tabTitle: 'SMP success on parent',
    tabDescription: getTabDescription('SMP success on parent'),
    notificationSubtitle: getNotificationSubtitle('SMP success on parent'),
    tableDescription: "Enter the estimative of SMP success for the orchard's seedlot"
  },
  mixTab: {
    tabTitle: 'Calculation of SMP mix',
    tabDescription: getTabDescription('calculation of SMP mix'),
    notificationSubtitle: getNotificationSubtitle('calculation of SMP mix'),
    tableDescription: 'Enter the estimative volume of SMP mix used for each clone'
  }
});

export const notificationCtrlObj = {
  coneTab: {
    showInfo: true,
    showError: true
  },
  successTab: {
    showInfo: true,
    showError: true
  },
  mixTab: {
    showInfo: true,
    showError: true
  }
};

export const geneticWorthDict = {
  CW: ['ad', 'dfu', 'gvo', 'wdu'],
  PLI: ['dfs', 'dsc', 'dsg', 'gvo'],
  FDC: ['dfw', 'gvo', 'wwd'],
  PW: ['dsb'],
  DR: ['gvo'],
  EP: ['gvo'],
  FDI: ['gvo'],
  HW: ['gvo'],
  LW: ['gvo'],
  PY: ['gvo'],
  SS: ['gvo', 'iws'],
  SX: ['gvo', 'iws']
};

export const rowTemplate: RowItem = {
  clone_number: 0,
  cone_count: 0,
  pollen_count: 0,
  smp_success_perc: 0,
  ad: 0,
  dfs: 0,
  dfu: 0,
  dfw: 0,
  dsb: 0,
  dsc: 0,
  dsg: 0,
  gvo: 0,
  iws: 0,
  wdu: 0,
  wwd: 0,
  non_orchard_pollen_contam: 0,
  mean_deg_lat: 0,
  mean_min_lat: 0,
  mean_deg_long: 0,
  mean_min_long: 0,
  mean_elevation: 0,
  volume: 0,
  proportion: 0
};

export const headerTemplate: HeaderConfigObj = {
  clone_number: {
    id: 'clone_number',
    name: 'Clone number',
    description: 'Clone number',
    enabled: true,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  cone_count: {
    id: 'cone_count',
    name: 'Cone count',
    description: 'Cone count',
    enabled: true,
    isAnOption: false,
    availableInTabs: ['coneTab']
  },
  pollen_count: {
    id: 'pollen_count',
    name: 'Pollen count',
    description: 'Pollen count',
    enabled: true,
    isAnOption: false,
    availableInTabs: ['coneTab']
  },
  smp_success_perc: {
    id: 'smp_success_perc',
    name: 'SMP success on parent (%)',
    description: 'SMP success on parent (%)',
    enabled: true,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab']
  },
  ad: {
    id: 'ad',
    name: 'AD',
    description: 'Animal browse resistance (deer)',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  dfs: {
    id: 'dfs',
    name: 'DFS',
    description: 'Disease resistance for Dothistroma needle blight',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  dfu: {
    id: 'dfu',
    name: 'DFU',
    description: 'Disease resistance for Redcedar leaf blight',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  dfw: {
    id: 'dfw',
    name: 'DFW',
    description: 'Disease resistance Swiss needle cast',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  dsb: {
    id: 'dsb',
    name: 'DSB',
    description: 'Disease resistance for white pine blister rust',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  dsc: {
    id: 'dsc',
    name: 'DSC',
    description: 'Disease resistance for Commandra blister rust',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  dsg: {
    id: 'dsg',
    name: 'DSG',
    description: 'Disease resistance Western gall rust',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  gvo: {
    id: 'gvo',
    name: 'GVO',
    description: 'Volume growth',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  iws: {
    id: 'iws',
    name: 'IWS',
    description: 'Spruce terminal weevil',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  wdu: {
    id: 'wdu',
    name: 'WDU',
    description: 'Wood durability',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  wwd: {
    id: 'wwd',
    name: 'WWD',
    description: 'Wood quality',
    enabled: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  non_orchard_pollen_contam: {
    id: 'non_orchard_pollen_contam',
    name: 'Non-orchard pollen contam. (%)',
    description: 'Non-orchard pollen contam. (%)',
    enabled: true,
    isAnOption: false,
    availableInTabs: [undefined, 'successTab']
  },
  mean_deg_lat: {
    id: 'mean_deg_lat',
    name: 'Mean degrees latitude',
    description: 'Mean degrees latitude',
    enabled: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  mean_min_lat: {
    id: 'mean_min_lat',
    name: 'Mean minutes latitude',
    description: 'Mean minutes latitude',
    enabled: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  mean_deg_long: {
    id: 'mean_deg_long',
    name: 'Mean degrees longitude',
    description: 'Mean degrees longitude',
    enabled: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  mean_min_long: {
    id: 'mean_min_long',
    name: 'Mean minutes longitude',
    description: 'Mean minutes longitude',
    enabled: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  mean_elevation: {
    id: 'mean_elevation',
    name: 'Mean elevation',
    description: 'Mean elevation',
    enabled: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  volume: {
    id: 'volume',
    name: 'Volume (ml)',
    description: 'Volume (ml)',
    enabled: true,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  proportion: {
    id: 'proportion',
    name: 'Proportion',
    description: 'Proportion',
    enabled: true,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  }
};
