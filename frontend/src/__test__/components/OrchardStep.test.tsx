import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom';
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';

describe('Orchard Step test', () => {
  let dismount: Function;
  let component: HTMLElement;
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
  });

  afterEach(() => dismount());

  function clickNext(times: number) {
    const buttonNext = component.getElementsByClassName('back-next-btn')[1];
    for(var i = 0; i < times; i++) {
      fireEvent.click(buttonNext);
    }
  }

  it('should have the correct labels', () => {
    // screen click next button
    clickNext(3);

    const content = {
      title: 'Orchard information',
      subtitle: 'Enter the contributing orchard information',
      titleGamete: 'Gamete information',
      subtitleGamete: 'Enter the seedlot gamete information',
      titlePollen: 'Pollen information',
      subtitlePollen: 'Enter the pollen contaminant information'
    }
    const titleBox = component.getElementsByClassName('seedlot-orchard-title-row')[0];
    expect(titleBox).toHaveTextContent(content.title);
    expect(titleBox).toHaveTextContent(content.subtitle);
    expect(screen.getByText(content.titleGamete)).toBeInTheDocument();
    expect(screen.getByText(content.subtitleGamete)).toBeInTheDocument();
    expect(screen.getByText(content.titlePollen)).toBeInTheDocument();
    expect(screen.getByText(content.subtitlePollen)).toBeInTheDocument();
  });

  it('should call the checkbox click function', async () => {
    // screen click next button
    clickNext(3);

    for (let checkbox of screen.getAllByRole('checkbox')) {
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    };
  });
});
