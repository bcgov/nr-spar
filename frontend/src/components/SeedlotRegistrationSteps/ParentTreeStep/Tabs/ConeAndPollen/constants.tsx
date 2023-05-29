import React from 'react';
import { Link } from 'react-router-dom';

const tabDescription = (
  <>
    {
      'Enter the cone and pollen count manually or upload a spreadsheet file with the template for the cone and pollen count table. '
      + 'Remember to keep your orchard updated, you can '
    }
    <Link to="#TODO">go to orchard&apos;s management page</Link>
    &nbsp;to edit the listed parent trees in your orchard.
  </>
);

const notificationSubtitle = (
  <>
    {
      'You can import one spreadsheet file for the cone'
      + 'and pollen count table with the data you want to use. '
      + 'For further guidance on how to organize the data, '
      + "do use the SPAR's spreadsheet template. "
    }
    <Link className="notification-link" to="#TODO">Download cone and pollen count template</Link>
  </>
);

const textConfig = {
  tabTitle: 'Cone and pollen count',
  tabDescription,
  notificationSubtitle
};

export default textConfig;
