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
      + 'For further guidance on how to organize the data, '
      + "do use the SPAR's spreadsheet template. "
    }
    <Link className="notification-link" to={getDownloadUrl(tabType)}>{`Download ${tabType} template`}</Link>
  </>
);

export const getPageText = () => ({
  notificationTitle: 'Upload spreadsheet to table',
  coneTab: {
    tabTitle: 'Cone and pollen count',
    tabDescription: getTabDescription('cone and pollen count'),
    notificationSubtitle: getNotificationSubtitle('cone and pollen count')
  },
  successTab: {
    tabTitle: 'SMP success on parent',
    tabDescription: getTabDescription('SMP success on parent'),
    notificationSubtitle: getNotificationSubtitle('SMP success on parent')
  },
  mixTab: {
    tabTitle: 'Calculation of SMP mix',
    tabDescription: getTabDescription('calculation of SMP mix'),
    notificationSubtitle: getNotificationSubtitle('calculation of SMP mix')
  }
});

export default getPageText;
