import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import SeedlotTable from '../../components/SeedlotTable';
import MySeedlotsItems from '../../mock-server/fixtures/MySeedlotsItems';
import { formatDate } from '../../utils/DateUtils'

describe('Seedlot Table component', () => {
  const listItems = MySeedlotsItems;
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
      <BrowserRouter>
        <SeedlotTable
          elements={listItems}
          headers={tableHeaders}
        />
      </BrowserRouter>
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
    expect(cells[2].textContent).toEqual('SX - Spruce Hybrid');
    expect(cells[3].textContent).toEqual('Collection');
    expect(cells[4].textContent).toEqual('Incomplete');
    expect(cells[5]).toBeInTheDocument();
    expect(formatDate(cells[6].textContent ? cells[6].textContent : "")).toEqual('October 10, 2021');
    expect(formatDate(cells[7].textContent ? cells[7].textContent : "")).toEqual('December 24, 2022');
    expect(cells[8].textContent).toEqual('--');
  });
});
