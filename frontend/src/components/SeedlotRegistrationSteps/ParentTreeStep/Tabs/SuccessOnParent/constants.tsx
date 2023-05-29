import React from 'react';
import { Link } from 'react-router-dom';

const tabDescription = (
  <>
    {
      'Enter the SMP success on parent manually or upload a spreadsheet file with the template for the SMP Success on parent table. '
      + 'Remember to keep your orchard updated, you can '
    }
    <Link to="#TODO">go to orchard&apos;s management page</Link>
    &nbsp;to edit the listed parent trees in your orchard.
  </>
);

const notificationSubtitle = (
  <>
    {
      'You can import one spreadsheet file for the SMP success on parent table with the data you want to use. '
      + "For further guidance on how to organize the data, do use the SPAR's spreadsheet template. "
    }
    <Link className="notification-link" to="#TODO">Download SMP success on parent template</Link>
  </>
);

const textConfig = {
  tabTitle: 'SMP success on parent ',
  tabDescription,
  notificationTitle: 'Upload spreadsheet to table',
  notificationSubtitle
};

export default textConfig;
