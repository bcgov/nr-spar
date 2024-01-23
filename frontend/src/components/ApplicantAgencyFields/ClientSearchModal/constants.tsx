import React from 'react';
import { ClientSearchDropdown } from './definitions';

export const clientSearchOptions: Array<ClientSearchDropdown> = [
  {
    label: 'Full name',
    option: 'fullName'
  },
  {
    label: 'Acronym',
    option: 'acronym'
  },
  {
    label: 'Number',
    option: 'number'
  }
];

export const getEmptySectionDescription = (message: string) => {
  if (message) {
    return (
      <span>
        Something went wrong while trying to search for users...
        <br />
        Error Message:
        {` ${message}`}
      </span>
    );
  }
  return (
    <span>
      Start by searching for a client or agency acronym,
      <br />
      number, or name. The matching results will be
      <br />
      shown here.
    </span>
  );
};
