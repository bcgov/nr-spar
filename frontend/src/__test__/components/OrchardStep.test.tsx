import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom';
import SeedlotRegistrarionForm from '../../views/Seedlot/SeedlotRegistrationForm';
import makeServer from '../../mock-server/server';
import * as ReactQuery from '@tanstack/react-query';

describe.skip('Orchard Step test', () => {
  let dismount: Function;
  let component: HTMLElement;

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
    clickNext(3);
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
    for (let checkbox of screen.getAllByRole('checkbox')) {
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    };
  });

  it('should show invalid Orchard ID message in both fields', async () => {
    const orchardIdInput = await screen.findByLabelText('Orchard ID or number') as HTMLInputElement;
    fireEvent.change(orchardIdInput, {
      target: { value: '2' }
    });
    orchardIdInput.blur(); //

    await waitFor(() => {
      expect(orchardIdInput.value).toBe('2');
      expect(screen.getByText('Please insert a valid orchard id between 100 and 999')).toBeInTheDocument();
    });

    //Click button for additional Orchard ID
    const addButton = screen.getByText('Add orchard');
    fireEvent.click(addButton);

    const addOrchardIdInput = await screen.findByLabelText('Additional orchard ID (optional)') as HTMLInputElement;
    fireEvent.change(addOrchardIdInput, {
      target: { value: '3' }
    });
    addOrchardIdInput.blur();

    await waitFor(() => {
      expect(addOrchardIdInput.value).toBe('3');
      expect(screen.getAllByText('Please insert a valid orchard id between 100 and 999')[1]).toBeInTheDocument();
    });
  });

  it('should show and click Delete additional orchard button', () => {
    const addButton = screen.getByText('Add orchard');
    fireEvent.click(addButton);

    const deleteButton = screen.getByText('Delete additional orchard');
    fireEvent.click(deleteButton);
  });

  it('should change the Female contribution combobox value', () => {
    const femaleContCombo = screen.getAllByRole('combobox')[1] as HTMLInputElement;
    const defaultValue = femaleContCombo.value;
    femaleContCombo.value = 'F2 - Measured cone volume'
    femaleContCombo.dispatchEvent(new Event('change'));
    expect(defaultValue).not.toEqual(femaleContCombo.value);
  });

  it('should choose and option from radiogroup', () => {
    const firstRadio = screen.getByRole('radio', { name: 'M1 - Portion of ramets in orchard' });
    const secondRadio = screen.getByRole('radio', { name: 'M2 - Pollen volume estimate by partial survey' });
    const thirdRadio = screen.getByRole('radio', { name: 'M3 - Pollen volume estimate by 100% survey' });
    fireEvent.click(firstRadio);
    expect(firstRadio).toBeChecked();
    expect(secondRadio).not.toBeChecked();
    expect(thirdRadio).not.toBeChecked();
  });

  it('should show Contaminant pollen breeding percentage input', async () => {
    const checkbox = screen.getAllByRole('checkbox')[2];
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(
        screen.getByText('Contaminant pollen breeding value (optional)')
      ).toBeInTheDocument();
      expect(
        screen.getByText('If contaminant pollen was present and the contaminant pollen has a breeding value')
      ).toBeInTheDocument();
    });
  });
});
