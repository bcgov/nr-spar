import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react';
import ApplicantInformationForm from '../../components/ApplicantInformationForm/index';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('Test the Form Progress component', () => {
  it('should render correctly', () => {
    const qc = new QueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <ApplicantInformationForm />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Applicant agency')).toBeInTheDocument();
    expect(screen.getByText('Enter the applicant agency information')).toBeInTheDocument();

    const checkBoxes = screen.getAllByRole('checkbox');

    expect(checkBoxes[0]).toBeChecked();
    expect(checkBoxes[1]).toBeChecked();

    fireEvent.click(checkBoxes[0]);
    fireEvent.click(checkBoxes[1]);

    expect(checkBoxes[0]).not.toBeChecked();
    expect(checkBoxes[1]).not.toBeChecked();
  })

});
