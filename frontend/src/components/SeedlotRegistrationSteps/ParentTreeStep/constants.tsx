/* eslint-disable max-len */
import React from 'react';
import { Link } from 'react-router-dom';

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
  CW: ['AD', 'DFU', 'GVO', 'WDU'],
  PLI: ['DFS', 'DSC', 'DSG', 'GVO'],
  FDC: ['DFW', 'GVO', 'WWD'],
  PW: ['DSB'],
  DR: ['GVO'],
  EP: ['GVO'],
  FDI: ['GVO'],
  HW: ['GVO'],
  LW: ['GVO'],
  PY: ['GVO'],
  SS: ['GVO', 'IWS'],
  SX: ['GVO', 'IWS']
};
