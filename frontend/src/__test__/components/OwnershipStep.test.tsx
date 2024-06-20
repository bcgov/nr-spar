import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';
import * as ReactQuery from '@tanstack/react-query';

describe.skip('Ownership Step test', () => {
  let dismount: Function;
  let component: HTMLElement;

  vi.mock('react-query', () => {
    useQuery: vi.fn().mockReturnValue({ data: [], isLoading: false, isSuccess: true });
  });

  beforeEach(async () => {

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
    clickNext();
  });

  afterEach(() => dismount());

  function clickNext() {
    const buttonNext = component.getElementsByClassName('back-next-btn')[1];
    fireEvent.click(buttonNext);
  }

  it('should have the correct labels', async () => {
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

  it('should call the checkbox click function twice', async () => {
    let checkbox = await screen.findByRole('checkbox');

    for (let i = 0; i < 2; i++) {
      fireEvent.click(checkbox);
    }

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('should render Owner agency name clicking twice', async () => {
    //Click button for additional Orchard ID
    const addButton = await screen.findByText('Add owner');
    for (let i = 0; i < 2; i++) {
      fireEvent.click(addButton);
    }

    await waitFor(() => {
      expect(screen.getAllByText('Owner agency name')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Owner agency name')[1]).toBeInTheDocument();
    });
  });

  it('should show invalid message for inputs for agency and location code', async () => {
    let checkbox = await screen.findByRole('checkbox');
    fireEvent.click(checkbox);

    const agencyNumber = component.querySelector('#owner-agency-0') as HTMLInputElement;

    fireEvent.change(agencyNumber, {
      target: { value: '2' }
    });
    agencyNumber.blur();

    await waitFor(() => {
      expect(agencyNumber.value).toBe('2');
      expect(
        screen.getByText('Please choose a valid owner agency, filter with agency number, name or acronym')
      ).toBeInTheDocument();
    });

    const ownerCode = component.querySelector('#single-owner-code-0') as HTMLInputElement;

    fireEvent.change(ownerCode, {
      target: { value: '3' }
    });
    ownerCode.blur();

    await waitFor(() => {
      expect(ownerCode.value).toBe('3');
      expect(
        screen.getByText('Please enter a valid 2-digit code that identifies the address of operated office or division')
      ).toBeInTheDocument();
    });
  });

  it('should show invalid message for inputs for Reserved and Surplus', async () => {
    const ownerReserved = component.querySelector('#single-owner-reserved-0') as HTMLInputElement;

    fireEvent.change(ownerReserved, {
      target: { value: '-2' }
    });
    ownerReserved.blur();

    await waitFor(() => {
      expect(ownerReserved.value).toBe('-2');
      expect(
        screen.getByText('Value must be higher or equal to 0')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Value must be lower or equal to 100')
      ).toBeInTheDocument();
    });
  });
});
