/* eslint-disable max-len */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeaderObj, RowItem, NotifCtrlType, GeneticWorthDictType
} from './definitions';

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

export const notificationCtrlObj: NotifCtrlType = {
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

export const geneticWorthDict: GeneticWorthDictType = {
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
  cloneNumber: '',
  cloneCount: null,
  pollenCount: null,
  smpSuccessPerc: null,
  ad: null,
  dfs: null,
  dfu: null,
  dfw: null,
  dsb: null,
  dsc: null,
  dsg: null,
  gvo: null,
  iws: null,
  wdu: null,
  wwd: null,
  nonOrchardPollenContam: null,
  meanDegLat: null,
  meanMinLat: null,
  meanDegLong: null,
  meanMinLong: null,
  meanElevation: null,
  volume: null,
  proportion: null
};

export const headerTemplate: Array<HeaderObj> = [
  {
    id: 'cloneNumber',
    name: 'Clone number',
    description: 'Clone number',
    enabled: true,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'cloneCount',
    name: 'Cone count',
    description: 'Cone count',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: ['coneTab']
  },
  {
    id: 'pollenCount',
    name: 'Pollen count',
    description: 'Pollen count',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: ['coneTab']
  },
  {
    id: 'smpSuccessPerc',
    name: 'SMP success on parent (%)',
    description: 'SMP success on parent (%)',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab']
  },
  {
    id: 'ad',
    name: 'AD',
    description: 'Animal browse resistance (deer)',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dfs',
    name: 'DFS',
    description: 'Disease resistance for Dothistroma needle blight',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dfu',
    name: 'DFU',
    description: 'Disease resistance for Redcedar leaf blight',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dfw',
    name: 'DFW',
    description: 'Disease resistance Swiss needle cast',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dsb',
    name: 'DSB',
    description: 'Disease resistance for white pine blister rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dsc',
    name: 'DSC',
    description: 'Disease resistance for Commandra blister rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'dsg',
    name: 'DSG',
    description: 'Disease resistance Western gall rust',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'gvo',
    name: 'GVO',
    description: 'Volume growth',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'iws',
    name: 'IWS',
    description: 'Spruce terminal weevil',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'wdu',
    name: 'WDU',
    description: 'Wood durability',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'wwd',
    name: 'WWD',
    description: 'Wood quality',
    enabled: false,
    editable: false,
    isAnOption: false,
    availableInTabs: ['coneTab', 'successTab', 'mixTab']
  },
  {
    id: 'nonOrchardPollenContam',
    name: 'Non-orchard pollen contam. (%)',
    description: 'Non-orchard pollen contam. (%)',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanDegLat',
    name: 'Mean degrees latitude',
    description: 'Mean degrees latitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanMinLat',
    name: 'Mean minutes latitude',
    description: 'Mean minutes latitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanDegLong',
    name: 'Mean degrees longitude',
    description: 'Mean degrees longitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanMinLong',
    name: 'Mean minutes longitude',
    description: 'Mean minutes longitude',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'meanElevation',
    name: 'Mean elevation',
    description: 'Mean elevation',
    enabled: false,
    editable: false,
    isAnOption: true,
    availableInTabs: [undefined, 'successTab']
  },
  {
    id: 'volume',
    name: 'Volume (ml)',
    description: 'Volume (ml)',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  },
  {
    id: 'proportion',
    name: 'Proportion',
    description: 'Proportion',
    enabled: true,
    editable: true,
    isAnOption: false,
    availableInTabs: [undefined, undefined, 'mixTab']
  }
];
