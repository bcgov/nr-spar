import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SeedlotDisplayType } from '../../types/SeedlotType';
import SeedlotDataTable from '../../components/SeedlotTable/Table';

// At runtime approvedAt can be null or undefined for unapproved seedlots,
// even though SeedlotDisplayType declares it as string.
type TestSeedlotData = Omit<SeedlotDisplayType, 'approvedAt'> & {
  approvedAt?: string | null;
};

const mockSeedlotData = [
  {
    seedlotNumber: '12345',
    seedlotClass: 'A',
    seedlotSpecies: 'SX - Spruce Hybrid',
    seedlotStatus: 'Approved',
    entryUserId: 'user1',
    entryTimestamp: '2023-01-01',
    applicantAgency: '00012797',
    locationCode: '01',
    createdAt: '2023-01-01',
    lastUpdatedAt: '2023-06-15',
    approvedAt: '2023-03-01'
  },
  {
    seedlotNumber: '67890',
    seedlotClass: 'B',
    seedlotSpecies: 'PLI - Lodgepole Pine',
    seedlotStatus: 'Pending',
    entryUserId: 'user2',
    entryTimestamp: '2023-02-01',
    applicantAgency: '00012797',
    locationCode: '02',
    createdAt: '2023-02-01',
    lastUpdatedAt: '2023-07-20',
    approvedAt: null
  },
  {
    seedlotNumber: '11111',
    seedlotClass: 'A',
    seedlotSpecies: 'FDC - Coastal Douglas-fir',
    seedlotStatus: 'Incomplete',
    entryUserId: 'user3',
    entryTimestamp: '2023-03-01',
    applicantAgency: '00012797',
    locationCode: '03',
    createdAt: '2023-03-01',
    lastUpdatedAt: '2023-08-10',
    approvedAt: undefined
  }
] satisfies TestSeedlotData[];

const renderTable = (
  seedlotData: SeedlotDisplayType[] = (mockSeedlotData as unknown as SeedlotDisplayType[]),
  showSearch = true
) => {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <SeedlotDataTable
        seedlotData={seedlotData}
        navigate={() => {}}
        isSortable={false}
        showSearch={showSearch}
        showPagination={false}
        tablePagination={<div />}
        isTscAdmin={false}
      />
    </QueryClientProvider>
  );
};

describe('SeedlotDataTable handleSearch', () => {
  it('should not crash when filtering with null/undefined field values', () => {
    renderTable();

    const searchInput = screen.getByPlaceholderText('Filter seedlots');
    expect(() => {
      fireEvent.change(searchInput, { target: { value: 'spruce' } });
    }).not.toThrow();

    // The row with 'Spruce Hybrid' should still be visible
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('should filter rows correctly even when some fields are null', () => {
    renderTable();

    const searchInput = screen.getByPlaceholderText('Filter seedlots');
    fireEvent.change(searchInput, { target: { value: 'lodgepole' } });

    // Only the row matching 'Lodgepole Pine' should be visible
    expect(screen.getByText('67890')).toBeInTheDocument();
    expect(screen.queryByText('12345')).toBeNull();
    expect(screen.queryByText('11111')).toBeNull();
  });

  it('should expand results when deleting characters from the search input', () => {
    renderTable();

    const searchInput = screen.getByPlaceholderText('Filter seedlots');

    // Type a specific query that matches only one row
    fireEvent.change(searchInput, { target: { value: '12345' } });
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.queryByText('67890')).toBeNull();

    // Clear the search to see all rows again
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('67890')).toBeInTheDocument();
    expect(screen.getByText('11111')).toBeInTheDocument();
  });

  it('should expand results when shortening the search query', () => {
    renderTable();

    const searchInput = screen.getByPlaceholderText('Filter seedlots');

    // Type a query that matches only one row
    fireEvent.change(searchInput, { target: { value: '12345' } });
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.queryByText('67890')).toBeNull();
    expect(screen.queryByText('11111')).toBeNull();

    // Shorten the query — '1' appears in fields of all rows so all should be shown
    fireEvent.change(searchInput, { target: { value: '1' } });
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('11111')).toBeInTheDocument();
    expect(screen.getByText('67890')).toBeInTheDocument();
  });
});
