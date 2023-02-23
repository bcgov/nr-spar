/* eslint-disable no-undef */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ActivityTable from '../../components/ActivityTable';
import RecentActivityItems from '../../mock-api/fixtures/RecentActivityItems';
import '@testing-library/jest-dom';

describe('Activity Table component', () => {
  const func = jest.fn();
  const listItems = RecentActivityItems;
  const tableHeaders: string[] = [
    'Activity type',
    'Status',
    'Request ID',
    'Created at',
    'Last viewed',
    'View'
  ];

  beforeEach(() => {
    render(
      <ActivityTable
        elements={listItems}
        clickFn={func}
        headers={tableHeaders}
      />
    );
  });

  it('should call the function', () => {
    const svg = screen.getAllByRole('cell')[5].firstElementChild!;
    fireEvent.click(svg);
    expect(func).toBeCalled();
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
    expect(cells[0].textContent).toEqual('Seedling request');
    expect(cells[1].textContent).toEqual('Pending');
    expect(cells[2].textContent).toEqual('201589');
    expect(cells[3].textContent).toEqual('2022-10-27');
    expect(cells[4].textContent).toEqual('2022-10-27');
  });
});
