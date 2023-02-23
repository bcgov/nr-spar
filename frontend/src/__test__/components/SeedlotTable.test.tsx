/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import SeedlotTable from '../../components/SeedlotTable';
import ExistingSeedlotItems from '../../mock-api/fixtures/ExistingSeedlotItems';
import '@testing-library/jest-dom';

describe('Seedlot Table component', () => {
  const listItems = ExistingSeedlotItems;
  const tableHeaders: string[] = [
    'Seedlot number',
    'Lot class',
    'Lot species',
    'Form step',
    'Status',
    'Participants',
    'Created at',
    'Last modified',
    'Approved at'
  ];

  beforeEach(() => {
    render(
      <SeedlotTable
        elements={listItems}
        headers={tableHeaders}
      />
    );
  });

  it('should render headers correctly', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(tableHeaders.length);
    headers.forEach((th, idx) => {
      expect(th.textContent).toEqual(tableHeaders[idx]);
    });
  });

  it('should render columns correctly', () => {
    const cells = screen.getAllByRole('cell');
    expect(cells[0].textContent).toEqual('12456');
    expect(cells[1].textContent).toEqual('A class');
    expect(cells[2].textContent).toEqual('SX - Spruce hibrid');
    expect(cells[3].textContent).toEqual('Collection');
    expect(cells[4].textContent).toEqual('Incomplete');
    expect(cells[5]).toBeInTheDocument;
    expect(cells[6].textContent).toEqual('October 10, 2021');
    expect(cells[7].textContent).toEqual('December 24, 2022');
    expect(cells[8].textContent).toEqual('--');
  });
});
