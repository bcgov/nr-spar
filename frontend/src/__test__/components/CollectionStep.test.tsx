import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom';
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';
import * as ReactQuery from '@tanstack/react-query';

describe.skip('Collection Step test', () => {
  let dismount: Function;
  jest
    .spyOn(ReactQuery, 'useQuery')
    .mockImplementation(
      jest
        .fn()
        .mockReturnValue({ data: [], isLoading: false, isSuccess: true })
    );
  beforeEach(() => {
    makeServer('jest-test');
    const qc = new QueryClient();
    const { unmount } = render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <SeedlotRegistrarionForm />
        </BrowserRouter>
      </QueryClientProvider>
    );
    dismount = unmount;
  });

  afterEach(() => dismount());

  it('should have the correct labels', () => {
    const content = {
      title: 'Collector agency',
      subtitle: 'Enter the collector agency information',
      titleInformation: 'Collection information',
      subtitleInformation: 'Enter the collection information about this seedlot'
    }
    expect(screen.getByText(content.title)).toBeInTheDocument();
    expect(screen.getByText(content.subtitle)).toBeInTheDocument();
    expect(screen.getByText(content.titleInformation)).toBeInTheDocument();
    expect(screen.getByText(content.subtitleInformation)).toBeInTheDocument();
  });

  it('should call the checkbox click function', async () => {
    for (let checkbox of screen.getAllByRole('checkbox')) {
      fireEvent.click(checkbox);
      if (checkbox.id === 'applicant') {
        await waitFor(() => {
          expect(checkbox).not.toBeChecked();
        });
      } else {
        await waitFor(() => {
          expect(checkbox).toBeChecked();
        });
      }
    };
  });
});
