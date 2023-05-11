import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom';
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';

describe('Ownership Step test', () => {
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

  function clickNext() {
    const buttonNext = component.getElementsByClassName('back-next-btn')[1];
    fireEvent.click(buttonNext);
  }

  it('should have the correct labels', () => {
    // screen click next button
    clickNext();

    const content = {
      title: 'Ownership',
      titleOrchard: 'Strong Seeds Orchard',
      subtitleOrchard: '100% owner portion'
    }
    const titleBox = component.getElementsByClassName('ownership-step-title-box')[0];
    expect(titleBox).toHaveTextContent(content.title);
    expect(screen.getByText(content.titleOrchard)).toBeInTheDocument();
    expect(screen.getByText(content.subtitleOrchard)).toBeInTheDocument();
  });

  it('should call the checkbox click function', async () => {
    // screen click next button
    clickNext();

    let checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });
});
