import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';
import * as ReactQuery from '@tanstack/react-query';

describe.skip('Interim Storage Step test', () => {
  let dismount: Function;
  let component: HTMLElement;
  vi.mock('react-query', () => {
    useQuery: vi.fn().mockReturnValue({ data: [], isLoading: false, isSuccess: true });
  });
  beforeEach(() => {
    makeServer('jest-test');
    const qc = new QueryClient();
    const { container, unmount } = render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <SeedlotRegistrarionForm />
        </BrowserRouter>
      </QueryClientProvider>
    );
    dismount = unmount;
    component = container;

    // screen click next button
    clickNext(2);
  });

  afterEach(() => dismount());

  function clickNext(times: number) {
    const buttonNext = component.getElementsByClassName('back-next-btn')[1];
    for (let i = 0; i < times; i++) {
      fireEvent.click(buttonNext);
    }
  }

  it('should have the correct labels', () => {
    const content = {
      title: 'Interim agency',
      subtitle: 'Enter the interim agency information',
      titleStorage: 'Storage information',
      subtitleStorage: 'Enter the interim storage information for this seedlot'
    }
    const titleBox = component.getElementsByClassName('interim-title-row')[0];
    expect(titleBox).toHaveTextContent(content.title);
    expect(titleBox).toHaveTextContent(content.subtitle);
    expect(screen.getByText(content.titleStorage)).toBeInTheDocument();
    expect(screen.getByText(content.subtitleStorage)).toBeInTheDocument();
  });

  it('should call the checkbox click function twice', async () => {
    let checkbox = screen.getByRole('checkbox');

    for (let i = 0; i < 2; i++) {
      fireEvent.click(checkbox);
    }

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });
});
