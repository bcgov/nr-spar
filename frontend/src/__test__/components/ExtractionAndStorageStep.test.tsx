import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom';
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';

describe('Extraction and Storage Step test', () => {
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
    clickNext(5);

    const content = {
      title: 'Extraction information',
      subtitle: 'Enter the extractory agency information and extraction’s star and end dates for this seedlot',
      titleTemporary: 'Temporary seed storage',
      subtitleTemporary: 'Enter the seed storage agency information and storage’s star and end dates for this seedlot'
    }
    const titleBox = component.getElementsByClassName('extraction-information-title')[0];
    expect(titleBox).toHaveTextContent(content.title);
    expect(titleBox).toHaveTextContent(content.subtitle);
    expect(screen.getByText(content.titleTemporary)).toBeInTheDocument();
    expect(screen.getByText(content.subtitleTemporary)).toBeInTheDocument();
  });

  it('should call the checkbox click function twice', async () => {
    // screen click next button
    clickNext(5);

    const checkBoxes = screen.getAllByRole('checkbox');

    for(var i = 0; i < 2; i++){
      for(var j = 0; j < checkBoxes.length; j++){
        fireEvent.click(checkBoxes[j]);
      }
    }

    await waitFor(() => {
      expect(checkBoxes[0]).toBeChecked();
      expect(checkBoxes[1]).toBeChecked();
      expect(checkBoxes[2]).not.toBeChecked();
    });
  });
});
