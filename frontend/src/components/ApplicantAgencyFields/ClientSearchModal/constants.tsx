import React from 'react';

export const clientSearchOptions: Array<string> = [
  'Full name',
  'Acronym',
  'Number'
];

export const getEmptySectionDescription = () => (
  <span>
    Start by searching for a client or agency acronym,
    <br />
    number, or name. The matching results will be
    <br />
    shown here.
  </span>
);
